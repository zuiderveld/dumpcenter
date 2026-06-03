const crypto = require('crypto');
const { getAuth, json, readJsonBody } = require('../_lib/http');
const { getServers, saveServers } = require('../../lib/store');
const { licensePayloadFor, ensureCanAddServer } = require('../../lib/licenses');

module.exports = async (req, res) => {
  const ctx = await getAuth(req, res);
  if (!ctx) return;

  const ownerId = ctx.disabled ? 'local' : String(ctx.session.sub);

  if (req.method === 'GET') {
    const all = await getServers();
    const servers = ctx.disabled ? all : all.filter((s) => String(s.owner_id) === ownerId);
    const license = await licensePayloadFor(ctx.cfg, ownerId, servers.length, ctx.disabled);
    json(res, 200, {
      servers,
      license,
      isAdmin: Boolean(ctx.session.isAdmin),
      cloudMode: ctx.cfg.isCloud,
    });
    return;
  }

  if (req.method === 'POST') {
    const body = await readJsonBody(req);
    const name = String(body.name || '').trim();
    const ip = String(body.ip || '').trim();
    if (!name || !ip) {
      json(res, 400, { status: 'error', message: 'name_and_ip_required' });
      return;
    }

    const all = await getServers();
    const userServers = all.filter((s) => String(s.owner_id) === ownerId);
    const check = await ensureCanAddServer(ctx.cfg, ownerId, userServers.length, ctx.disabled);
    if (!check.ok) {
      json(res, 403, { status: 'error', message: check.reason });
      return;
    }

    const entry = {
      id: crypto.randomUUID(),
      name,
      ip,
      owner_id: ownerId,
    };
    all.push(entry);
    await saveServers(all);
    json(res, 200, { status: 'ok', server: entry });
    return;
  }

  if (req.method === 'DELETE') {
    const body = await readJsonBody(req);
    const all = await getServers();
    const userServers = all.filter((s) => String(s.owner_id) === ownerId);
    let targetId = body.id;
    if (!targetId && body.index != null) {
      const idx = parseInt(body.index, 10);
      targetId = userServers[idx]?.id;
    }
    if (!targetId) {
      json(res, 400, { status: 'error', message: 'id_required' });
      return;
    }

    const exists = all.some((s) => String(s.id) === String(targetId) && String(s.owner_id) === ownerId);
    if (!exists) {
      json(res, 404, { status: 'error', message: 'not_found' });
      return;
    }

    await saveServers(all.filter((s) => String(s.id) !== String(targetId)));
    json(res, 200, { status: 'ok' });
    return;
  }

  json(res, 405, { status: 'error', message: 'method_not_allowed' });
};
