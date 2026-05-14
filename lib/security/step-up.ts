import crypto from "crypto";
import { APIError } from "better-auth/api";
import connectToDatabase from "@/lib/db";
import { auth } from "@/lib/auth";
import { createMailTransport } from "@/lib/mailer";
import StepUpChallenge, {
  type StepUpPurpose,
} from "@/models/StepUpChallenge.model";
import SessionSecurity from "@/models/SessionSecurity.model";
import { getSessionTokenHash, sha256 } from "@/lib/security/request";

const STEP_UP_TTL_MS = 10 * 60 * 1000;
const STEP_UP_CODE_LENGTH = 6;
const STEP_UP_MAX_ATTEMPTS = 5;

export const STEP_UP_LABELS: Record<StepUpPurpose, string> = {
  "billing:manage": "manage billing",
  "project:delete": "delete a project",
  "project:invite:manage": "manage project invites",
  "project:member:role": "change project roles",
  "api-key:create": "create an API key",
};

function generateNumericCode(length: number) {
  const max = 10 ** length;
  return crypto.randomInt(0, max).toString().padStart(length, "0");
}

export async function getAuthenticatedSession(headers: Headers) {
  const session = await auth.api.getSession({ headers });
  if (!session?.session?.token || !session.user?.id || !session.user?.email) {
    throw new APIError("UNAUTHORIZED", { message: "Unauthorized" });
  }

  return session;
}

export async function startStepUpChallenge(
  headers: Headers,
  purpose: StepUpPurpose,
) {
  await connectToDatabase();
  const session = await getAuthenticatedSession(headers);
  const code = generateNumericCode(STEP_UP_CODE_LENGTH);
  const sessionTokenHash = getSessionTokenHash(session.session.token);

  await StepUpChallenge.findOneAndUpdate(
    {
      userId: session.user.id,
      sessionTokenHash,
      purpose,
    },
    {
      $set: {
        codeHash: sha256(`step-up:${code}`),
        expiresAt: new Date(Date.now() + STEP_UP_TTL_MS),
        consumedAt: null,
        attempts: 0,
      },
    },
    { upsert: true, new: true },
  );

  if (process.env.SMTP_HOST) {
    const transporter = createMailTransport();
    await transporter.sendMail({
      from: process.env.SMTP_FROM || "no-reply@example.com",
      to: session.user.email,
      subject: "Your NexusAI security verification code",
      html: `
        <div style="font-family: sans-serif;">
          <h2>Security verification</h2>
          <p>Use this code to ${STEP_UP_LABELS[purpose]}:</p>
          <div style="font-size:2rem;letter-spacing:0.2em;font-weight:bold;">${code}</div>
          <p>This code expires in 10 minutes.</p>
        </div>
      `,
    });
  }

  return {
    email: session.user.email,
    expiresInSeconds: Math.floor(STEP_UP_TTL_MS / 1000),
  };
}

export async function verifyStepUpChallenge(
  headers: Headers,
  purpose: StepUpPurpose,
  code: string,
) {
  await connectToDatabase();
  const session = await getAuthenticatedSession(headers);
  const sessionTokenHash = getSessionTokenHash(session.session.token);

  const challenge = await StepUpChallenge.findOne({
    userId: session.user.id,
    sessionTokenHash,
    purpose,
  });

  if (!challenge || challenge.consumedAt || challenge.expiresAt < new Date()) {
    throw new APIError("BAD_REQUEST", {
      message: "Verification challenge expired. Request a new code.",
    });
  }

  if (challenge.attempts >= STEP_UP_MAX_ATTEMPTS) {
    throw new APIError("TOO_MANY_REQUESTS", {
      message: "Too many attempts. Request a new verification code.",
    });
  }

  const valid = challenge.codeHash === sha256(`step-up:${code}`);
  if (!valid) {
    challenge.attempts += 1;
    await challenge.save();
    throw new APIError("BAD_REQUEST", { message: "Invalid verification code." });
  }

  challenge.consumedAt = new Date();
  await challenge.save();

  const verifiedAt = new Date();
  await SessionSecurity.findOneAndUpdate(
    {
      userId: session.user.id,
      sessionTokenHash,
    },
    {
      $set: {
        [`stepUpVerifiedAt.${purpose}`]: verifiedAt,
        lastSeenAt: verifiedAt,
      },
    },
    { upsert: true, new: true },
  );

  return { verifiedAt };
}

export async function assertRecentStepUp(
  headers: Headers,
  purpose: StepUpPurpose,
  ttlMs: number = STEP_UP_TTL_MS,
) {
  await connectToDatabase();
  const session = await getAuthenticatedSession(headers);
  const sessionTokenHash = getSessionTokenHash(session.session.token);

  const record = await SessionSecurity.findOne({
    userId: session.user.id,
    sessionTokenHash,
  }).lean<{
    stepUpVerifiedAt?: Partial<Record<StepUpPurpose, Date>>;
  }>();

  const verifiedAt = record?.stepUpVerifiedAt?.[purpose];
  if (!verifiedAt || Date.now() - new Date(verifiedAt).getTime() > ttlMs) {
    throw new APIError("FORBIDDEN", {
      message: "Step-up verification required.",
      code: "STEP_UP_REQUIRED",
    });
  }

  return session;
}
