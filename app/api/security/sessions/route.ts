import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import { auth } from "@/lib/auth";
import SessionSecurity from "@/models/SessionSecurity.model";

type DeviceSession = {
  session: {
    id?: string;
    token?: string;
    createdAt?: string | Date;
    updatedAt?: string | Date;
    expiresAt?: string | Date;
    ipAddress?: string | null;
    userAgent?: string | null;
  };
};

type AuthMultiSessionApi = {
  listDeviceSessions: (input: { headers: Headers }) => Promise<DeviceSession[]>;
};

const authApi = auth.api as unknown as AuthMultiSessionApi;

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user?.id || !session.session?.token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();

  const deviceSessions = ((await authApi.listDeviceSessions({
    headers: req.headers,
  })) ?? []) as DeviceSession[];

  const metadata = await SessionSecurity.find({ userId: session.user.id })
    .sort({ updatedAt: -1 })
    .lean();

  const enriched = deviceSessions.map((entry) => {
    const sessionToken = entry.session?.token;
    const sessionId = entry.session?.id;
    const meta = metadata.find(
      (candidate) =>
        (sessionToken && candidate.sessionToken === sessionToken) ||
        (sessionId && candidate.sessionId === sessionId),
    );

    return {
      token: sessionToken,
      sessionId,
      current: sessionToken === session.session.token,
      createdAt: entry.session?.createdAt,
      updatedAt: entry.session?.updatedAt,
      expiresAt: entry.session?.expiresAt,
      ipAddress: entry.session?.ipAddress ?? meta?.ipAddress ?? null,
      userAgent: entry.session?.userAgent ?? meta?.userAgent ?? null,
      deviceLabel: meta?.deviceLabel ?? entry.session?.userAgent ?? "Unknown device",
      suspicious: meta?.suspicious ?? false,
      suspiciousReasons: meta?.suspiciousReasons ?? [],
      lastLoginMethod: meta?.lastLoginMethod ?? null,
      lastSeenAt: meta?.lastSeenAt ?? null,
    };
  });

  return NextResponse.json({ sessions: enriched });
}
