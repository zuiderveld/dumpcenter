const fs = require('fs');
const path = require('path');

const KEYS = {
  licenses: 'dc:licenses',
  servers: 'dc:servers',
};

let memory = {
  licenses: null,
  servers: null,
};

function defaultLicenses() {
  return { users: {} };
}

function readSeed(file) {
  try {
    const p = path.join(process.cwd(), 'data', file);
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return file === 'licenses.json' ? defaultLicenses() : [];
  }
}

async function kvGet(key) {
  if (!process.env.KV_REST_API_URL) return null;
  try {
    const { kv } = require('@vercel/kv');
    return await kv.get(key);
  } catch {
    return null;
  }
}

async function kvSet(key, value) {
  if (!process.env.KV_REST_API_URL) return false;
  try {
    const { kv } = require('@vercel/kv');
    await kv.set(key, value);
    return true;
  } catch {
    return false;
  }
}

async function getLicenses() {
  if (memory.licenses) return memory.licenses;
  const fromKv = await kvGet(KEYS.licenses);
  if (fromKv) {
    memory.licenses = fromKv;
    return fromKv;
  }
  memory.licenses = readSeed('licenses.json');
  return memory.licenses;
}

async function saveLicenses(state) {
  memory.licenses = state;
  if (await kvSet(KEYS.licenses, state)) return;
  memory.licenses = state;
}

async function getServers() {
  if (memory.servers) return memory.servers;
  const fromKv = await kvGet(KEYS.servers);
  if (fromKv) {
    memory.servers = fromKv;
    return fromKv;
  }
  memory.servers = readSeed('servers.json');
  return memory.servers;
}

async function saveServers(list) {
  memory.servers = list;
  if (await kvSet(KEYS.servers, list)) return;
  memory.servers = list;
}

module.exports = { getLicenses, saveLicenses, getServers, saveServers };
