import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { memoryAdapter } from "better-auth/adapters/memory";
import connectToDatabase from "@/lib/db";
import {
  apiKey,
  emailOTP,
  haveIBeenPwned,
  lastLoginMethod,
  magicLink,
  multiSession,
  twoFactor,
} from "better-auth/plugins";
import { passkey } from "@better-auth/passkey";
import Subscription from "@/models/Subscription.model";
import { createMailTransport } from "@/lib/mailer";
import { enforceAuthAbuseProtection } from "@/lib/security/abuse";
import { createAuditLog } from "@/lib/security/audit";
import {
  handleSuspiciousSession,
  upsertSessionSecurity,
} from "@/lib/security/session-security";

const isBuildTime =
  process.env.NEXT_PHASE === "phase-production-build" ||
  process.env.npm_lifecycle_event === "build";

const connection = isBuildTime ? null : await connectToDatabase();
if (!isBuildTime && !connection?.db) {
  throw new Error("Failed to connect to database");
}
const authDatabase = (() => {
  if (isBuildTime) {
    return memoryAdapter({});
  }

  const database = connection?.db;
  if (!database) {
    throw new Error("Failed to connect to database");
  }

  return mongodbAdapter(database);
})();

function getAuthHookPath(ctx: Record<string, unknown>) {
  if (typeof ctx.path === "string") {
    return ctx.path;
  }

  if (ctx.request instanceof Request) {
    return new URL(ctx.request.url).pathname.replace(/^\/api\/auth/, "");
  }

  return "";
}

export const auth = betterAuth({
  appName: "NexusAI",
  database: authDatabase,
  user: {
    additionalFields: {
      phonenumber: { type: "string", required: true },
      isAdmin: { type: "boolean", required: false },
      role: { type: "string", required: false },
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          await Subscription.create({
            user: user.id,
            planId: "free",
            status: "active",
          });
        },
      },
    },
    session: {
      create: {
        after: async (session, context) => {
          await upsertSessionSecurity(session, context);
          await handleSuspiciousSession(
            session,
            {
              email:
                typeof context?.context?.newSession?.user?.email === "string"
                  ? context.context.newSession.user.email
                  : null,
            },
            context,
          );
        },
      },
    },
  },
  socialProviders: {
    google: {
      prompt: "select_account",
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  hooks: {
    before: async (ctx) => {
      const path = getAuthHookPath(ctx as Record<string, unknown>);

      await enforceAuthAbuseProtection({
        body:
          ctx.body && typeof ctx.body === "object"
            ? (ctx.body as Record<string, unknown>)
            : undefined,
        headers: ctx.headers ? new Headers(ctx.headers) : undefined,
        path,
      });

      return { context: ctx };
    },
    after: async (ctx) => {
      const authContext =
        "context" in ctx && ctx.context && typeof ctx.context === "object"
          ? (ctx.context as { session?: { user?: { id?: string } } })
          : undefined;
      const session = authContext?.session;
      const path = getAuthHookPath(ctx as Record<string, unknown>);

      if (
        session?.user?.id &&
        (path === "/passkey/verify-registration" ||
          path === "/passkey/delete-passkey" ||
          path === "/passkey/update-passkey")
      ) {
        const action =
          path === "/passkey/verify-registration"
            ? "passkey.create"
            : path === "/passkey/delete-passkey"
              ? "passkey.delete"
              : "passkey.rename";

        await createAuditLog({
          action,
          actor: session.user.id,
          targetType: "account",
          targetId: session.user.id,
        });
      }

      return {
        context: ctx,
      };
    },
  },

  // emailVerification: {
  //   sendVerificationEmail: async ({ user, url, token }, request) => {
  //     // Configure nodemailer transporter
  //     console.log("Sending verification email to:", user.email, url);
  //     const transporter = nodemailer.createTransport({
  //       host: process.env.SMTP_HOST,
  //       port: Number(process.env.SMTP_PORT) || 587,
  //       secure: false, // true for 465, false for other ports
  //       auth: {
  //         user: process.env.SMTP_USER,
  //         pass: process.env.SMTP_PASS,
  //       },
  //     });

  //     // Email content
  //     const mailOptions = {
  //       from: process.env.SMTP_FROM || "no-reply@example.com",
  //       to: user.email,
  //       subject: "Your Verify Sign-Up Link",
  //       html: `
  //           <div style="font-family: sans-serif;">
  //             <h2>Sign in to Your Account</h2>
  //             <p>Click the link below to sign in and verify your account:</p>
  //             <a href="${url}" style="display:inline-block;padding:10px 20px;background:#2563eb;color:#fff;text-decoration:none;border-radius:5px;">Sign in</a>
  //             <p>If you did not request this, you can ignore this email.</p>
  //           </div>
  //         `,
  //     };

  //     // Send the email
  //     await transporter.sendMail(mailOptions);
  //   },
  //   // Optionally:
  //   sendOnSignUp: true, // send verification immediately at sign up
  //   autoSignInAfterVerification: false, // or true, choose based on UX
  // },

  plugins: [
    haveIBeenPwned(),
    lastLoginMethod({
      storeInDatabase: true,
    }),
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        const transporter = createMailTransport();

        // Email content
        const mailOptions = {
          from: process.env.SMTP_FROM || "no-reply@example.com",
          to: email,
          subject: "Your Magic Sign-In Link",
          html: `
            <div style="font-family: sans-serif;">
              <h2>Sign in to Your Account</h2>
              <p>Click the link below to sign in:</p>
              <a href="${url}" style="display:inline-block;padding:10px 20px;background:#2563eb;color:#fff;text-decoration:none;border-radius:5px;">Sign in</a>
              <p>If you did not request this, you can ignore this email.</p>
            </div>
          `,
        };

        // Send the email
        await transporter.sendMail(mailOptions);
      },
    }),
    emailOTP({
      overrideDefaultEmailVerification: true,
      async sendVerificationOTP({ email, otp, type }) {
        const transporter = createMailTransport();
        if (type === "email-verification") {
          // Email content with OTP
          const mailOptions = {
            from: process.env.SMTP_FROM || "no-reply@example.com",
            to: email,
            subject: "Your Email Verification Code",
            html: `
          <div style="font-family: sans-serif;">
            <h2>Email Verification</h2>
            <p>Your verification code is:</p>
            <div style="font-size:2rem;letter-spacing:0.2em;font-weight:bold;">${otp}</div>
            <p>Enter this code in the app to verify your email.</p>
          </div>
        `,
          };

          // Send the email
          await transporter.sendMail(mailOptions);
        }

        if (type === "forget-password") {
          // send the OTP email to the user
          const mailOptions = {
            from: process.env.SMTP_FROM || "no-reply@example.com",
            to: email,
            subject: "Your Password Reset Code",
            html: `
        <div style="font-family: sans-serif;">
          <h2>Password Reset</h2>
          <p>Your password reset code is:</p>
          <div style="font-size:2rem;letter-spacing:0.2em;font-weight:bold;">${otp}</div>
          <p>Enter this code in the app to reset your password.</p>
        </div>
      `,
          };

          await transporter.sendMail(mailOptions);
        }
      },
      // You can also specify options like:
      otpLength: 6,
      expiresIn: 300, // 5 minutes
      allowedAttempts: 3,
    }),
    twoFactor({
      skipVerificationOnEnable: true,
      issuer: "NexusAI",
      otpOptions: {
        async sendOTP({ user, otp }) {
          const transporter = createMailTransport();
          const mailOptions = {
            from: process.env.SMTP_FROM || "no-reply@example.com",
            to: user.email,
            subject: "Your Two Factor Verification Code",
            html: `
          <div style="font-family: sans-serif;">
            <h2>Two Factor Verification</h2>
            <p>Your verification code is:</p>
            <div style="font-size:2rem;letter-spacing:0.2em;font-weight:bold;">${otp}</div>
            <p>Enter this code in the app to verify it's you.</p>
          </div>
        `,
          };

          // Send the email
          await transporter.sendMail(mailOptions);
        },
      },
    }),
    multiSession({
      maximumSessions: 5,
    }),
    apiKey({
      requireName: true,
      enableMetadata: true,
      rateLimit: {
        enabled: true,
        maxRequests: 5,
        timeWindow: 24 * 60 * 60 * 1000,
      },
      keyExpiration: {
        maxExpiresIn: 365,
        minExpiresIn: 1,
      },
    }),
    passkey({
      rpID:
        process.env.BETTER_AUTH_PASSKEY_RP_ID ??
        process.env.NEXT_PUBLIC_APP_URL?.replace(/^https?:\/\//, "") ??
        "localhost",
      rpName: "NexusAI",
    }),
  ],
});
