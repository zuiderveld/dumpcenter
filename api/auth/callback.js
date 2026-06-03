const { getConfig, isAuthConfigured } = require('../../lib/config');
const { exchangeCode, fetchUser, verifyAccess, isAdminUser, avatarUrl } = require('../../lib/discord');
const { signSession, setSessionCookie } = require('../../lib/session');
const { touchUserOnLogin, licensePayloadFor } = require('../../lib/licenses');
const { getServers } = require('../../lib/store');

function parseCookies(header) {
  const out = {};
  String(header || '')
    .split(';')
    .forEach((part) => {
      const i = part.indexOf('=');
      if (i < 0) return;
      out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
    });
  return out;
}

module.exports = async (req, res) => {
  const cfg = getConfig(req);
  if (!isAuthConfigured(cfg)) {
    res.writeHead(302, { Location: '/login.html?error=not_configured' });
    res.end();
    return;
  }

  const url = new URL(req.url, cfg.publicBaseUrl);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');
  const cookies = parseCookies(req.headers.cookie);
  const next = cookies.dc_oauth_next || '/panel.html';

  if (error || !code) {
    res.writeHead(302, { Location: `/login.html?error=oauth_failed` });
    res.end();
    return;
  }

  try {
    const tokenPayload = await exchangeCode(cfg, code);
    const discordUser = await fetchUser(tokenPayload.access_token);
    const access = await verifyAccess(cfg, discordUser.id);
    if (!access.ok) {
      res.writeHead(302, { Location: `/login.html?error=${access.reason}` });
      res.end();
      return;
    }

    const admin = await isAdminUser(cfg, discordUser.id, access.roles);
    const user = {
      id: String(discordUser.id),
      username: discordUser.username,
      global_name: discordUser.global_name || discordUser.username,
      avatar_url: avatarUrl(discordUser),
    };

    await touchUserOnLogin(cfg, user, admin);

    const servers = await getServers();
    const count = servers.filter((s) => String(s.owner_id) === String(user.id)).length;
    const license = await licensePayloadFor(cfg, user.id, count, false);

    const token = await signSession(cfg, {
      sub: user.id,
      user,
      isAdmin: admin,
      license,
    });
    setSessionCookie(res, cfg, token);

    const target = admin && (next === '/panel.html' || next === '/panel') ? '/admin.html' : next;
    res.writeHead(302, { Location: target });
    res.end();
  } catch {
    res.writeHead(302, { Location: '/login.html?error=oauth_failed' });
    res.end();
  }
};
