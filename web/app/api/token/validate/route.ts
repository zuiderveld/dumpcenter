import { NextResponse } from "next/server";
import { validateToken } from "@/lib/tokens";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const token = String(body?.token ?? "").trim();
    if (!token) {
      return NextResponse.json({ valid: false, message: "token missing" }, { status: 400 });
    }
    const info = await validateToken(token);
    if (!info) {
      return NextResponse.json({ valid: false }, { status: 401 });
    }
    return NextResponse.json({ valid: true, ...info });
  } catch {
    return NextResponse.json({ valid: false, message: "invalid request" }, { status: 400 });
  }
}
