const { getLicenses, saveLicenses } = require('./store');

function nowIso() {
  return new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
}

async function listUsers() {
  const state = await getLicenses();
  const users = Object.entries(state.users || {}).map(([id, row]) => ({
    ...row,
    discord_id: row.discord_id || id,
  }));
  users.sort((a, b) => String(b.last_login || b.created_at || '').localeCompare(String(a.last_login || a.created_at || '')));
  return users;
}

async function getUser(discordId) {
  if (!discordId) return null;
  const state = await getLicenses();
  const row = (state.users || {})[String(discordId)];
  if (!row) return null;
  return { ...row, discord_id: String(discordId) };
}

async function touchUserOnLogin(cfg, user, isAdmin = false) {
  const discordId = String(user?.id || '');
  if (!discordId) return null;

  const state = await getLicenses();
  state.users = state.users || {};
  const row = { ...(state.users[discordId] || {}) };

  row.discord_id = discordId;
  row.username = user.username || row.username || '';
  row.global_name = user.global_name || user.username || row.global_name || '';
  row.avatar_url = user.avatar_url || row.avatar_url || '';
  row.last_login = nowIso();
  row.is_admin = Boolean(isAdmin || row.is_admin);
  row.created_at = row.created_at || nowIso();

  if (isAdmin) {
    row.max_servers = row.max_servers ?? 999;
    row.license_label = row.license_label || 'Admin';
  } else {
    row.max_servers = row.max_servers ?? cfg.defaultMaxServers;
    row.license_label = row.license_label || (cfg.defaultMaxServers > 0 ? 'Standard' : 'Geen license');
  }
  row.active = row.active ?? true;

  state.users[discordId] = row;
  await saveLicenses(state);
  return row;
}

async function upsertUserLicense(discordId, patch = {}) {
  discordId = String(discordId || '').trim();
  if (!discordId) throw new Error('discord_id_required');

  const state = await getLicenses();
  state.users = state.users || {};
  const row = {
    discord_id: discordId,
    username: '',
    global_name: '',
    avatar_url: '',
    created_at: nowIso(),
    ...(state.users[discordId] || {}),
  };

  if (patch.max_servers != null) row.max_servers = Math.max(0, parseInt(patch.max_servers, 10) || 0);
  else row.max_servers = row.max_servers ?? 0;

  if (patch.license_label != null) row.license_label = String(patch.license_label).trim() || 'License';
  else row.license_label = row.license_label || 'License';

  if (patch.active != null) row.active = Boolean(patch.active);
  else row.active = row.active ?? true;

  if (patch.is_admin != null) row.is_admin = Boolean(patch.is_admin);

  row.updated_at = nowIso();
  state.users[discordId] = row;
  await saveLicenses(state);
  return row;
}

async function deleteUser(discordId) {
  discordId = String(discordId || '').trim();
  const state = await getLicenses();
  if ((state.users || {})[discordId]) {
    delete state.users[discordId];
    await saveLicenses(state);
    return true;
  }
  return false;
}

function licensePayloadFor(cfg, discordId, serverCount = 0, authDisabled = false) {
  if (authDisabled) {
    return {
      active: true,
      max_servers: 999,
      used_servers: serverCount,
      remaining_servers: Math.max(0, 999 - serverCount),
      license_label: 'Dev',
      can_add_server: true,
    };
  }
  return getUser(discordId).then((userRow) => {
    const r = userRow || {};
    const maxServers = parseInt(r.max_servers || 0, 10);
    const active = r.active !== false;
    const canAdd = active && serverCount < maxServers;
    return {
      active,
      max_servers: maxServers,
      used_servers: serverCount,
      remaining_servers: Math.max(0, maxServers - serverCount),
      license_label: r.license_label || 'Geen license',
      can_add_server: canAdd,
    };
  });
}

async function ensureCanAddServer(cfg, discordId, currentCount, authDisabled = false) {
  const info = await licensePayloadFor(cfg, discordId, currentCount, authDisabled);
  if (!info.active) return { ok: false, reason: 'license_inactive' };
  if (!info.can_add_server) return { ok: false, reason: 'license_limit' };
  return { ok: true, reason: 'ok' };
}

module.exports = {
  listUsers,
  getUser,
  touchUserOnLogin,
  upsertUserLicense,
  deleteUser,
  licensePayloadFor,
  ensureCanAddServer,
};
