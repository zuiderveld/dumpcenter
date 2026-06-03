const { requireAdmin, json, readJsonBody } = require('../../_lib/http');
const { upsertUserLicense, deleteUser } = require('../../../lib/licenses');
const { getServers, saveServers } = require('../../../lib/store');

module.exports = async (req, res) => {
  const ctx = await requireAdmin(req, res);
  if (!ctx) return;

  const discordId = String(req.query.discordId || req.query.discord_id || '').trim();
  if (!discordId) {
    json(res, 400, { status: 'error', message: 'discord_id_required' });
    return;
  }

  if (req.method === 'DELETE') {
    await deleteUser(discordId);
    const all = await getServers();
    await saveServers(all.filter((s) => String(s.owner_id) !== discordId));
    json(res, 200, { status: 'ok' });
    return;
  }

  if (req.method === 'PUT') {
    const body = await readJsonBody(req);
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
