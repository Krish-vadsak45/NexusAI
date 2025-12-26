import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function requireAuth(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  console.log("requireAuth session:", session);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // Attach session to request for downstream handlers (optional)
  return null; // null means continue
}
