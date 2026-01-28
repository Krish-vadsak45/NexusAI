import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { acceptInvite } from "@/lib/invite";
import nodemailer from "nodemailer";
import Invite from "@/models/Invite.model";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { token } = body;
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const result = await acceptInvite(token, session.user);
  // email mismatch -> send verification link to invited email with claim token
  if (result.error === "email_mismatch" && result.claimToken) {
    try {
      const invite = await Invite.findOne({ _id: result.inviteId });
      if (invite && process.env.SMTP_HOST) {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT) || 587,
          secure: false,
          auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
        });
        const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/invites/accept?token=${invite.token}&claim=${result.claimToken}`;
        await transporter.sendMail({
          from: process.env.SMTP_FROM || "no-reply@example.com",
          to: invite.email,
          subject: `Confirm your invite to ${invite.projectId}`,
          html: `<p>Please confirm this invite by clicking the link below:</p><p><a href="${verifyUrl}">Confirm invite</a></p>`,
        });
      }
    } catch (e) {
      console.error("failed to send claim email", e);
    }
    return NextResponse.json(
      {
        error: "email_mismatch",
        message: "Verification sent to invited email",
      },
      { status: 400 },
    );
  }

  if (result.error)
    return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json(result);
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) {
    // If not signed in, redirect to sign-in with returnTo
    const origin = process.env.NEXT_PUBLIC_APP_URL || url.origin;
    const acceptPath = `${origin}/api/invites/accept?token=${encodeURIComponent(
      token || "",
    )}`;
    const signInUrl = `${origin}/auth/signin?returnTo=${encodeURIComponent(
      acceptPath,
    )}`;
    return NextResponse.redirect(signInUrl);
  }

  const claim = url.searchParams.get("claim") || undefined;
  const result = await acceptInvite(token!, session.user, claim);
  if (result.error === "email_mismatch" && result.claimToken) {
    // If the user followed the verify link, they should be allowed; otherwise show error
    return NextResponse.json({ error: "email_mismatch" }, { status: 400 });
  }
  if (result.error)
    return NextResponse.json({ error: result.error }, { status: 400 });

  // simple redirect to project page
  const origin = process.env.NEXT_PUBLIC_APP_URL || url.origin;
  const projectUrl = `${origin}/dashboard/projects/${result.projectId}`;
  return NextResponse.redirect(projectUrl);
}
