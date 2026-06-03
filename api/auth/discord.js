const { getConfig, isAuthConfigured, redirectUri } = require('../../lib/config');
const crypto = require('crypto');

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

function setCookie(res, name, value, maxAge, secure) {
  const parts = [`${name}=${encodeURIComponent(value)}`, 'Path=/', 'HttpOnly', 'SameSite=Lax', `Max-Age=${maxAge}`];
  if (secure) parts.push('Secure');
  res.setHeader('Set-Cookie', parts.join('; '));
}

module.exports = async (req, res) => {
  const cfg = getConfig(req);
  if (!isAuthConfigured(cfg)) {
    res.writeHead(302, { Location: '/login.html?error=not_configured' });
    res.end();
    return;
  }

  const url = new URL(req.url, cfg.publicBaseUrl);
  const next = url.searchParams.get('next') || '/panel.html';
  const state = crypto.randomBytes(16).toString('hex');
  const secure = cfg.publicBaseUrl.startsWith('https');

  setCookie(res, 'dc_oauth_state', state, 600, secure);
  setCookie(res, 'dc_oauth_next', next, 600, secure);

  const params = new URLSearchParams({
    client_id: cfg.clientId,
    redirect_uri: redirectUri(cfg),
    response_type: 'code',
    scope: 'identify guilds guilds.members.read',
    state,
  });

  res.writeHead(302, { Location: `https://discord.com/api/oauth2/authorize?${params}` });
  res.end();
};
