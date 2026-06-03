const { getConfig, isAuthConfigured } = require('../../lib/config');
const { readSession } = require('../../lib/session');

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

async function readJsonBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string' && req.body) {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  const raw = await new Promise((resolve) => {
    let data = '';
    req.on('data', (chunk) => { data += chunk; });
    req.on('end', () => resolve(data));
  });
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function getAuth(req, res) {
  const cfg = getConfig(req);
  if (cfg.authDisabled) {
    return { cfg, session: { sub: 'local', isAdmin: true, user: null }, authed: true, disabled: true };
  }
  if (!isAuthConfigured(cfg)) {
    json(res, 503, { status: 'error', message: 'not_configured' });
    return null;
  }
  const session = await readSession(req, cfg);
  if (!session?.sub) {
    json(res, 401, { status: 'error', message: 'unauthorized' });
    return null;
  }
  return { cfg, session, authed: true, disabled: false };
}

async function requireAdmin(req, res) {
  const ctx = await getAuth(req, res);
  if (!ctx) return null;
  if (!ctx.session.isAdmin) {
    json(res, 403, { status: 'error', message: 'admin_required' });
    return null;
  }
  return ctx;
}

module.exports = { json, readJsonBody, getAuth, requireAdmin };
