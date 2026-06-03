const { requireAdmin, json, readJsonBody } = require('../_lib/http');
const { listUsers, upsertUserLicense } = require('../../lib/licenses');
const { getServers, saveServers } = require('../../lib/store');

module.exports = async (req, res) => {
  const ctx = await requireAdmin(req, res);
  if (!ctx) return;

  if (req.method === 'GET') {
    const users = await listUsers();
    const allServers = await getServers();
    const counts = {};
    allServers.forEach((srv) => {
      const oid = String(srv.owner_id || '');
      counts[oid] = (counts[oid] || 0) + 1;
    });
    users.forEach((u) => {
      u.used_servers = counts[String(u.discord_id)] || 0;
    });
    json(res, 200, { status: 'ok', users });
    return;
  }

  if (req.method === 'POST') {
    const body = await readJsonBody(req);
    if (!discordId) {
      json(res, 400, { status: 'error', message: 'discord_id_required' });
      return;
    }

    const row = await upsertUserLicense(discordId, {
      max_servers: body.max_servers,
      license_label: body.license_label,
      active: body.active,
      is_admin: body.is_admin,
    });
    json(res, 200, { status: 'ok', user: row });
    return;
  }

  json(res, 405, { status: 'error', message: 'method_not_allowed' });
};
