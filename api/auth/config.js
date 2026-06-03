const { getConfig, isAuthConfigured, redirectUri } = require('../../lib/config');
const { json } = require('../_lib/http');

module.exports = async (req, res) => {
  const cfg = getConfig(req);
  json(res, 200, {
    authEnabled: !cfg.authDisabled && isAuthConfigured(cfg),
    authConfigured: isAuthConfigured(cfg),
    clientId: cfg.clientId,
    redirectUri: redirectUri(cfg),
    scopes: 'identify guilds guilds.members.read',
    cloudMode: cfg.isCloud,
    guildIdSuffix: cfg.guildId ? String(cfg.guildId).slice(-6) : null,
  });
};
