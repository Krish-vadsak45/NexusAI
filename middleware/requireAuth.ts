import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import logger from "@/lib/logger";

export async function requireAuth(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  logger.debug({ session }, "requireAuth session");
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // Attach session to request for downstream handlers (optional)
  return null; // null means continue
}
