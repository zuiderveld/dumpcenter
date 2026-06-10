import { NextResponse } from "next/server";
import { checkAdminKey } from "@/lib/auth";
import { deleteToken } from "@/lib/tokens";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const adminKey = req.headers.get("x-admin-key") || "";
  if (!checkAdminKey(adminKey)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const ok = await deleteToken(id);
  if (!ok) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  return NextResponse.json({ status: "ok", deleted: true });
}
