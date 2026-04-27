import {
  emailOTPClient,
  inferAdditionalFields,
  magicLinkClient,
  twoFactorClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
export const authClient = createAuthClient({
  baseURL:
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.BETTER_AUTH_URL || "http://localhost:3000",
  plugins: [
    inferAdditionalFields({
      user: {
        phonenumber: {
          type: "string",
          required: true,
        },
        isAdmin: {
          type: "boolean",
          required: false,
        },
      },
    }),
    magicLinkClient(),
    emailOTPClient(),
    twoFactorClient({
      onTwoFactorRedirect: () => {
        globalThis.location.href = "/two-factor/verify";
      },
    }),
  ],
});
