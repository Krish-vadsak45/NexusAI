import {
  apiKeyClient,
  emailOTPClient,
  inferAdditionalFields,
  magicLinkClient,
  multiSessionClient,
  twoFactorClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { passkeyClient } from "@better-auth/passkey/client";
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
        role: {
          type: "string",
          required: false,
        },
      },
    }),
    magicLinkClient(),
    emailOTPClient(),
    multiSessionClient(),
    apiKeyClient(),
    passkeyClient(),
    twoFactorClient({
      onTwoFactorRedirect: () => {
        globalThis.location.href = "/two-factor/verify";
      },
    }),
  ],
});
