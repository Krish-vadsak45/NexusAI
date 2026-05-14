import { APIError } from "better-auth/api";
import { checkRateLimit } from "@/lib/rateLimit";
import { getClientContext } from "@/lib/security/request";

type AuthLikeContext = {
  body?: Record<string, unknown>;
  headers?: Headers;
  path?: string;
};

const PROTECTED_AUTH_PATHS = new Set([
  "/sign-in/email",
  "/sign-up/email",
  "/magic-link/send",
  "/magic-link/verify",
  "/email-otp/send-verification-otp",
  "/email-otp/verify-email",
  "/sign-in/email-otp",
  "/forget-password/email-otp",
  "/email-otp/reset-password",
  "/two-factor/send-otp",
  "/two-factor/verify-otp",
  "/passkey/verify-authentication",
  "/passkey/generate-authenticate-options",
]);

function shouldProtectAuthPath(path: string) {
  return PROTECTED_AUTH_PATHS.has(path);
}

export async function enforceAuthAbuseProtection(ctx: AuthLikeContext) {
  const path = ctx.path ?? "";
  if (!shouldProtectAuthPath(path)) {
    return;
  }

  const email =
    typeof ctx.body?.email === "string"
      ? ctx.body.email.toLowerCase()
      : typeof ctx.body?.newEmail === "string"
        ? ctx.body.newEmail.toLowerCase()
        : null;

  const clientContext = ctx.headers ? getClientContext(ctx.headers) : null;

  const checks = [
    checkRateLimit(`auth:path:${path}`, 200, 5 * 60 * 1000),
    checkRateLimit(`auth:ip:${path}:${clientContext?.ipHash ?? "unknown"}`, 25, 15 * 60 * 1000),
  ];

  if (email) {
    checks.push(
      checkRateLimit(`auth:email:${path}:${email}`, 8, 15 * 60 * 1000),
    );
  }

  if (clientContext?.deviceFingerprint) {
    checks.push(
      checkRateLimit(
        `auth:device:${path}:${clientContext.deviceFingerprint}`,
        12,
        15 * 60 * 1000,
      ),
    );
  }

  const results = await Promise.all(checks);
  const blocked = results.find((result) => !result.allowed);
  if (blocked) {
    throw new APIError("TOO_MANY_REQUESTS", {
      message: "Too many attempts. Please try again later.",
    });
  }
}
