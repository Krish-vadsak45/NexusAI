import {
  emailOTPClient,
  magicLinkClient,
  twoFactorClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
export const authClient = createAuthClient({
  // baseURL: "https://nexus-ai-amber-seven.vercel.app/api/auth",
  baseURL: "http://localhost:3000/api/auth",
  plugins: [
    magicLinkClient(),
    emailOTPClient(),
    twoFactorClient({
      onTwoFactorRedirect: () => {
        globalThis.location.href = "/two-factor/verify";
      },
    }),
  ],
});
