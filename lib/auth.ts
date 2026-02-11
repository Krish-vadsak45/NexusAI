import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import connectToDatabase from "./db";
import { emailOTP, magicLink, twoFactor } from "better-auth/plugins";
import nodemailer from "nodemailer";
import Subscription from "@/models/Subscription.model";

const connection = await connectToDatabase();
if (!connection) throw new Error("Failed to connect to database");

export const auth = betterAuth({
  // if your connectToDatabase returns an object with a `db` property use that, otherwise pass the connection itself
  appName: "NexusAI",
  database: mongodbAdapter((connection as any).db ?? connection),
  user: {
    additionalFields: {
      phonenumber: { type: "string", required: true },
      isAdmin: { type: "boolean", required: false },
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
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
  },
  socialProviders: {
    google: {
      prompt: "select_account",
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
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
    magicLink({
      sendMagicLink: async ({ email, token, url }, request) => {
        // Configure nodemailer transporter
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT) || 587,
          secure: false, // true for 465, false for other ports
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });

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
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT) || 587,
          secure: false,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });
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
        async sendOTP({ user, otp }, request) {
          // send otp to user
          const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT) || 587,
            secure: false,
            auth: {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
            },
          });
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
  ],
});
