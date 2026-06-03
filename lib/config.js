const DISCORD_API = 'https://discord.com/api/v10';

function env(name, fallback = '') {
  return (process.env[name] || fallback).trim();
}

function splitIds(value) {
  return String(value || '')
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);
}

function getPublicBaseUrl(req) {
  const custom = env('PUBLIC_BASE_URL');
  if (custom) return custom.replace(/\/$/, '');
  const host = req?.headers?.['x-forwarded-host'] || req?.headers?.host;
  const proto = req?.headers?.['x-forwarded-proto'] || 'https';
  if (host) return `${proto}://${host}`;
  if (env('VERCEL_URL')) return `https://${env('VERCEL_URL')}`;
  return 'http://127.0.0.1:5000';
}

function getConfig(req) {
  return {
    clientId: env('DISCORD_CLIENT_ID', '1133760156052754502'),
    clientSecret: env('DISCORD_CLIENT_SECRET'),
    botToken: env('DISCORD_BOT_TOKEN'),
    guildId: env('DISCORD_GUILD_ID', '1493577422883524692'),
    requiredRoleId: env('DISCORD_REQUIRED_ROLE_ID', '1511738490063294525'),
    adminRoleIds: splitIds(env('DISCORD_ADMIN_ROLE_IDS')),
    adminDiscordIds: splitIds(env('ADMIN_DISCORD_IDS', '964232673939824691')),
    autoAdminGuildOwner: env('AUTO_ADMIN_GUILD_OWNER', 'true').toLowerCase() !== 'false',
    defaultMaxServers: Math.max(0, parseInt(env('DEFAULT_MAX_SERVERS', '0'), 10) || 0),
    authDisabled: ['1', 'true', 'yes'].includes(env('AUTH_DISABLED', 'false').toLowerCase()),
    secretKey: env('APP_SECRET_KEY', 'change-me-in-production'),
    publicBaseUrl: getPublicBaseUrl(req),
    discordApi: DISCORD_API,
    isCloud: Boolean(env('VERCEL')),
  };
}

function isAuthConfigured(cfg) {
  return Boolean(cfg.clientId && cfg.clientSecret && cfg.botToken && cfg.guildId && cfg.requiredRoleId);
}

function redirectUri(cfg) {
  const custom = env('DISCORD_REDIRECT_URI');
  if (custom) return custom;
  return `${cfg.publicBaseUrl}/api/auth/callback`;
}

module.exports = { getConfig, isAuthConfigured, redirectUri, env };
