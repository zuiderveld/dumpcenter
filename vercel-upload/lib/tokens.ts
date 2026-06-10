import { Redis } from "@upstash/redis";
import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";

export type TokenEntry = {
  id: string;
  token: string;
  label: string;
  created: string;
};

const KV_KEY = "dumpcenter:tokens";
const DATA_FILE = path.join(process.cwd(), "data", "tokens.json");

function nowIso() {
  return new Date().toISOString();
}

function hasRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  return Boolean(url && token);
}

function getRedis() {
  return Redis.fromEnv();
}

async function readFileStore(): Promise<TokenEntry[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed?.tokens) ? parsed.tokens : [];
  } catch {
    return [];
  }
}

async function writeFileStore(tokens: TokenEntry[]) {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify({ tokens }, null, 2), "utf8");
}

export async function listTokens(): Promise<TokenEntry[]> {
  if (hasRedis()) {
    const redis = getRedis();
    const tokens = await redis.get<TokenEntry[]>(KV_KEY);
    return tokens ?? [];
  }
  return readFileStore();
}

async function saveTokens(tokens: TokenEntry[]) {
  if (hasRedis()) {
    const redis = getRedis();
    await redis.set(KV_KEY, tokens);
    return;
  }
  await writeFileStore(tokens);
}

export async function validateToken(token: string) {
  const needle = token.trim();
  if (!needle) return null;
  const tokens = await listTokens();
  const hit = tokens.find((t) => t.token === needle);
  if (!hit) return null;
  return { id: hit.id, label: hit.label, created: hit.created };
}

export async function createToken(label: string) {
  const entry: TokenEntry = {
    id: randomUUID(),
    token: randomBytesUrlSafe(24),
    label: (label || "User").trim() || "User",
    created: nowIso(),
  };
  const tokens = await listTokens();
  tokens.push(entry);
  await saveTokens(tokens);
  return entry;
}

export async function deleteToken(id: string) {
  const tokens = await listTokens();
  const next = tokens.filter((t) => t.id !== id);
  if (next.length === tokens.length) return false;
  await saveTokens(next);
  return true;
}

export function publicTokenView(tokens: TokenEntry[]) {
  return tokens.map((t) => ({
    id: t.id,
    label: t.label,
    created: t.created,
    preview: `${t.token.slice(0, 6)}…`,
  }));
}

function randomBytesUrlSafe(length: number) {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Buffer.from(bytes)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "")
    .slice(0, length + 8);
}
