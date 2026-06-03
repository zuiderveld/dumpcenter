const { getConfig } = require('../../lib/config');
const { clearSessionCookie } = require('../../lib/session');

module.exports = async (req, res) => {
  const cfg = getConfig(req);
  clearSessionCookie(res, cfg);
  res.writeHead(302, { Location: '/' });
  res.end();
};
