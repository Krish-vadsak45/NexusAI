export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import { auth } from "@/lib/auth";
import SessionSecurity from "@/models/SessionSecurity.model";
import { createAuditLog } from "@/lib/security/audit";



type AuthMultiSessionApi = {
  revokeDeviceSession: (input: {
    headers: Headers;
    body: { sessionToken: string };
  }) => Promise<unknown>;
};

const authApi = auth.api as unknown as AuthMultiSessionApi;

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const activeSession = await auth.api.getSession({ headers: req.headers });
  if (!activeSession?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { token } = await params;
  await authApi.revokeDeviceSession({
    headers: req.headers,
    body: {
      sessionToken: token,
    },
  });

  await connectToDatabase();
  await SessionSecurity.deleteOne({
    userId: activeSession.user.id,
    sessionToken: token,
  });

  await createAuditLog({
    action: "session.revoke",
    actor: activeSession.user.id,
    targetType: "session",
    targetId: token,
  });

  return NextResponse.json({ ok: true });
}