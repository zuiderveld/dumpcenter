function avatarUrl(user) {
  if (user?.id && user?.avatar) {
    return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128`;
  }
  return 'https://cdn.discordapp.com/embed/avatars/0.png';
}

async function discordFetch(url, options = {}) {
  const res = await fetch(url, options);
  return res;
}

const DISCORD_API = 'https://discord.com/api/v10';

async function exchangeCode(cfg, code) {
  const { redirectUri } = require('./config');
  const body = new URLSearchParams({
    client_id: cfg.clientId,
    client_secret: cfg.clientSecret,
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri(cfg),
  });
  const res = await discordFetch(`${DISCORD_API}/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  if (!res.ok) throw new Error('oauth_failed');
  return res.json();
}

async function fetchUser(accessToken) {
  const res = await discordFetch(`${DISCORD_API}/users/@me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error('oauth_failed');
  return res.json();
}

async function getMemberRolesBot(cfg, userId) {
  const res = await discordFetch(`${cfg.discordApi}/guilds/${cfg.guildId}/members/${userId}`, {
    headers: { Authorization: `Bot ${cfg.botToken}` },
  });
  if (res.status === 404) return { ok: false, reason: 'not_in_guild' };
  if (!res.ok) return { ok: false, reason: 'member_lookup_failed' };
  const data = await res.json();
  return { ok: true, roles: (data.roles || []).map(String) };
}

async function verifyAccess(cfg, userId) {
  const member = await getMemberRolesBot(cfg, userId);
  if (!member.ok) return member;
  if (!member.roles.includes(String(cfg.requiredRoleId))) {
    return { ok: false, reason: 'missing_role' };
  }
  return { ok: true, roles: member.roles };
}

async function fetchGuildOwnerId(cfg) {
  const res = await discordFetch(`${cfg.discordApi}/guilds/${cfg.guildId}`, {
    headers: { Authorization: `Bot ${cfg.botToken}` },
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.owner_id ? String(data.owner_id) : null;
}

async function isAdminUser(cfg, userId, roles) {
  if (!userId) return false;
  if (cfg.adminDiscordIds.includes(String(userId))) return true;
  if (cfg.autoAdminGuildOwner) {
    const owner = await fetchGuildOwnerId(cfg);
    if (owner && owner === String(userId)) return true;
  }
  if (!roles?.length) return false;
  const set = new Set(roles.map(String));
  return cfg.adminRoleIds.some((id) => set.has(String(id)));
}

module.exports = {
  avatarUrl,
  exchangeCode,
  fetchUser,
  verifyAccess,
  isAdminUser,
};
