const { getConfig } = require('../../lib/config');
const { readSession } = require('../../lib/session');
const { getUser, licensePayloadFor } = require('../../lib/licenses');
const { getServers } = require('../../lib/store');
const { json } = require('../_lib/http');

module.exports = async (req, res) => {
  const cfg = getConfig(req);

  if (cfg.authDisabled) {
    json(res, 200, {
      authenticated: true,
      auth_disabled: true,
      user: null,
      isAdmin: true,
      license: await licensePayloadFor(cfg, 'local', 0, true),
    });
    return;
  }

  const session = await readSession(req, cfg);
  if (!session?.sub) {
    json(res, 401, { authenticated: false });
    return;
  }

  const servers = await getServers();
  const count = servers.filter((s) => String(s.owner_id) === String(session.sub)).length;
  const license = await licensePayloadFor(cfg, session.sub, count, false);
  const profile = await getUser(session.sub);

  json(res, 200, {
    authenticated: true,
    user: session.user,
    isAdmin: Boolean(session.isAdmin),
    license,
    profile,
    cloudMode: cfg.isCloud,
  });
};
