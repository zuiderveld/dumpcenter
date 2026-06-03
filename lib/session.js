const COOKIE = 'dc_session';
const MAX_AGE = 60 * 60 * 24 * 7;

async function getSecret(cfg) {
  const { SignJWT, jwtVerify } = await import('jose');
  const key = new TextEncoder().encode(cfg.secretKey);
  return { SignJWT, jwtVerify, key };
}

function parseCookies(header) {
  const out = {};
  String(header || '')
    .split(';')
    .forEach((part) => {
      const i = part.indexOf('=');
      if (i < 0) return;
      out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
    });
  return out;
}

function cookieHeader(name, value, maxAge, secure) {
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${maxAge}`,
  ];
  if (secure) parts.push('Secure');
  return parts.join('; ');
}

async function signSession(cfg, payload) {
  const { SignJWT, key } = await getSecret(cfg);
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(key);
}

async function readSession(req, cfg) {
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies[COOKIE];
  if (!token) return null;
  try {
    const { jwtVerify, key } = await getSecret(cfg);
    const { payload } = await jwtVerify(token, key);
    return payload;
  } catch {
    return null;
  }
}

function setSessionCookie(res, cfg, token) {
  const secure = cfg.publicBaseUrl.startsWith('https');
  res.setHeader('Set-Cookie', cookieHeader(COOKIE, token, MAX_AGE, secure));
}

function clearSessionCookie(res, cfg) {
  const secure = cfg.publicBaseUrl.startsWith('https');
  res.setHeader('Set-Cookie', cookieHeader(COOKIE, '', 0, secure));
}

module.exports = {
  COOKIE,
  readSession,
  signSession,
  setSessionCookie,
  clearSessionCookie,
};
