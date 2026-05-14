import crypto from "crypto";

type HeaderLike =
  | Headers
  | {
      get(name: string): string | null | undefined;
    };

export function getHeader(headers: HeaderLike, name: string) {
  return headers.get(name) ?? null;
}

export function getClientIp(headers: HeaderLike) {
  const forwardedFor = getHeader(headers, "x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() ?? null;
  }

  return (
    getHeader(headers, "x-real-ip") ??
    getHeader(headers, "cf-connecting-ip") ??
    null
  );
}

export function sha256(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export function getSessionTokenHash(token: string) {
  return sha256(`session:${token}`);
}

export function normalizeUserAgent(userAgent: string | null) {
  if (!userAgent) return "Unknown device";

  const compact = userAgent.replace(/\s+/g, " ").trim();
  if (compact.includes("Windows")) return "Windows device";
  if (compact.includes("Mac OS X")) return "macOS device";
  if (compact.includes("Android")) return "Android device";
  if (compact.includes("iPhone") || compact.includes("iPad")) {
    return "iOS device";
  }

  return compact.slice(0, 80);
}

export function getDeviceFingerprint(headers: HeaderLike) {
  const explicitFingerprint = getHeader(headers, "x-device-fingerprint");
  if (explicitFingerprint) return explicitFingerprint;

  const userAgent = getHeader(headers, "user-agent") ?? "";
  const language = getHeader(headers, "accept-language") ?? "";
  const platform = getHeader(headers, "sec-ch-ua-platform") ?? "";

  if (!userAgent && !language && !platform) {
    return null;
  }

  return sha256(`${userAgent}|${language}|${platform}`);
}

export function getClientContext(headers: HeaderLike) {
  const ipAddress = getClientIp(headers);
  const userAgent = getHeader(headers, "user-agent");
  const deviceFingerprint = getDeviceFingerprint(headers);

  return {
    ipAddress,
    ipHash: ipAddress ? sha256(`ip:${ipAddress}`) : null,
    userAgent,
    deviceFingerprint,
    deviceLabel: normalizeUserAgent(userAgent),
  };
}
