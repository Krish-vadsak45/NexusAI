import connectToDatabase from "@/lib/db";
import { createMailTransport } from "@/lib/mailer";
import Notification from "@/models/Notification.model";
import SessionSecurity from "@/models/SessionSecurity.model";
import type { StepUpPurpose } from "@/models/StepUpChallenge.model";
import { createAuditLog } from "@/lib/security/audit";
import {
  getClientContext,
  getSessionTokenHash,
} from "@/lib/security/request";

type SessionLike = {
  id?: string | null;
  token?: string | null;
  userId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
};

type SessionHookContext = {
  headers?: Headers;
  path?: string;
  params?: Record<string, string | undefined>;
};

type SessionUser = {
  email?: string | null;
};

function getLoginMethodFromPath(path?: string | null) {
  if (!path) return null;
  if (path.includes("passkey")) return "passkey";
  if (path.includes("magic-link")) return "magic-link";
  if (path.includes("email-otp")) return "email-otp";
  if (path.includes("sign-in/email")) return "password";
  if (path.includes("callback")) return "oauth";
  return "session";
}

export async function upsertSessionSecurity(
  session: SessionLike,
  context?: SessionHookContext | null,
) {
  if (!session.userId) return;

  await connectToDatabase();

  const clientContext = context?.headers
    ? getClientContext(context.headers)
    : {
        ipAddress: session.ipAddress ?? null,
        ipHash: session.ipAddress ? getSessionTokenHash(session.ipAddress) : null,
        userAgent: session.userAgent ?? null,
        deviceFingerprint: null,
        deviceLabel: session.userAgent ?? "Unknown device",
      };

  const sessionTokenHash = session.token
    ? getSessionTokenHash(session.token)
    : null;

  await SessionSecurity.findOneAndUpdate(
    {
      userId: session.userId,
      $or: [
        ...(session.id ? [{ sessionId: session.id }] : []),
        ...(sessionTokenHash ? [{ sessionTokenHash }] : []),
      ],
    },
    {
      $set: {
        sessionId: session.id ?? null,
        sessionToken: session.token ?? null,
        sessionTokenHash,
        ipAddress: clientContext.ipAddress,
        ipHash: clientContext.ipHash,
        userAgent: clientContext.userAgent,
        deviceFingerprint: clientContext.deviceFingerprint,
        deviceLabel: clientContext.deviceLabel,
        lastSeenAt: new Date(),
        lastLoginMethod: getLoginMethodFromPath(context?.path),
      },
    },
    { upsert: true, new: true },
  );
}

export async function handleSuspiciousSession(
  session: SessionLike,
  user: SessionUser,
  context?: SessionHookContext | null,
) {
  if (!session.userId) return;

  await connectToDatabase();
  const clientContext = context?.headers ? getClientContext(context.headers) : null;

  const priorRecords = await SessionSecurity.find({ userId: session.userId })
    .sort({ updatedAt: -1 })
    .limit(5)
    .lean();

  const reasons: string[] = [];
  if (
    priorRecords.length > 0 &&
    clientContext?.ipHash &&
    !priorRecords.some((record) => record.ipHash === clientContext.ipHash)
  ) {
    reasons.push("new_ip");
  }

  if (
    priorRecords.length > 0 &&
    clientContext?.deviceFingerprint &&
    !priorRecords.some(
      (record) => record.deviceFingerprint === clientContext.deviceFingerprint,
    )
  ) {
    reasons.push("new_device");
  }

  if (reasons.length === 0) return;

  const sessionTokenHash = session.token
    ? getSessionTokenHash(session.token)
    : null;

  await SessionSecurity.findOneAndUpdate(
    {
      userId: session.userId,
      $or: [
        ...(session.id ? [{ sessionId: session.id }] : []),
        ...(sessionTokenHash ? [{ sessionTokenHash }] : []),
      ],
    },
    {
      $set: {
        suspicious: true,
        suspiciousReasons: reasons,
      },
    },
    { upsert: true },
  );

  await Notification.create({
    userId: session.userId,
    email: user.email ?? undefined,
    type: "security_suspicious_login",
    data: {
      reasons,
      deviceLabel: clientContext?.deviceLabel ?? "Unknown device",
      ipAddress: clientContext?.ipAddress ?? session.ipAddress ?? null,
    },
  });

  await createAuditLog({
    action: "security.suspicious_login",
    actor: session.userId,
    targetType: "session",
    targetId: session.id ?? session.token ?? undefined,
    data: {
      reasons,
      deviceLabel: clientContext?.deviceLabel ?? "Unknown device",
    },
  });

  if (process.env.SMTP_HOST && user.email) {
    const transporter = createMailTransport();
    await transporter.sendMail({
      from: process.env.SMTP_FROM || "no-reply@example.com",
      to: user.email,
      subject: "New sign-in detected on your NexusAI account",
      html: `
        <div style="font-family: sans-serif;">
          <h2>Suspicious sign-in alert</h2>
          <p>We noticed a sign-in from a new device or network.</p>
          <p><strong>Device:</strong> ${clientContext?.deviceLabel ?? "Unknown device"}</p>
          <p><strong>Reasons:</strong> ${reasons.join(", ")}</p>
        </div>
      `,
    });
  }
}

export async function clearSessionStepUp(
  userId: string,
  sessionToken: string,
  purposes?: StepUpPurpose[],
) {
  await connectToDatabase();
  const sessionTokenHash = getSessionTokenHash(sessionToken);

  if (!purposes || purposes.length === 0) {
    await SessionSecurity.findOneAndUpdate(
      { userId, sessionTokenHash },
      { $set: { stepUpVerifiedAt: {} } },
    );
    return;
  }

  const unsetFields = Object.fromEntries(
    purposes.map((purpose) => [`stepUpVerifiedAt.${purpose}`, ""]),
  );

  await SessionSecurity.findOneAndUpdate(
    { userId, sessionTokenHash },
    { $unset: unsetFields },
  );
}
