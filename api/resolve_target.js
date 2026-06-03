const { json } = require('../_lib/http');

module.exports = async (req, res) => {
  json(res, 503, {
    status: 'error',
    message: 'cloud_dump_disabled',
    hint: 'Dumpen werkt alleen via Dump Center Desktop (Windows). Login, panel en admin draaien op Vercel.',
  });
};
