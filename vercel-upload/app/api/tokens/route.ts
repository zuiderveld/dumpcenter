import { NextResponse } from "next/server";
import { checkAdminKey } from "@/lib/auth";
import { createToken, listTokens, publicTokenView } from "@/lib/tokens";

function adminKeyFrom(req: Request, body?: { admin_key?: string }) {
  return req.headers.get("x-admin-key") || body?.admin_key || "";
}

export async function GET(req: Request) {
  if (!checkAdminKey(adminKeyFrom(req))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const tokens = await listTokens();
  return NextResponse.json(publicTokenView(tokens));
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!checkAdminKey(adminKeyFrom(req, body))) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    const label = String(body?.label ?? "User");
    const entry = await createToken(label);
    return NextResponse.json({
      status: "ok",
      id: entry.id,
      label: entry.label,
      token: entry.token,
      created: entry.created,
    });
  } catch {
    return NextResponse.json({ error: "invalid request" }, { status: 400 });
  }
}
