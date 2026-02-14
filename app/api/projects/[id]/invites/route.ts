import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import { auth } from "@/lib/auth";
import Project from "@/models/Project.model";
import { checkProjectMembership } from "@/lib/acl";
import Invite from "@/models/Invite.model";
import Notification from "@/models/Notification.model";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { checkRateLimit } from "@/lib/rateLimit";
import Audit from "@/models/Audit.model";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  // Feature flag enforcement: if explicitly disabled, hide endpoint
  if (
    process.env.FEATURE_TEAM_COLLAB === "0" ||
    process.env.FEATURE_TEAM_COLLAB === "false"
  ) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { email, role } = body;
  if (!email)
    return NextResponse.json({ error: "email required" }, { status: 400 });

  await connectToDatabase();
  // rate-limit invites per actor (simple in-memory limiter)
  // try {
  //   const { allowed, resetSeconds } = await checkRateLimit(
  //     `invite:${session.user.id}`,
  //     20,
  //     1000 * 60 * 60,
  //   );
  //   if (!allowed)
  //     return NextResponse.json(
  //       { error: "Rate limit exceeded" },
  //       {
  //         status: 429,
  //         headers: {
  //           "Retry-After": String(resetSeconds || 60),
  //         },
  //       },
  //     );
  // } catch (e) {
  //   console.warn("rate limit check failed", e);
  // }
  const { id } = await params;
  const { allowed, project, member } = await checkProjectMembership(
    session.user.id,
    id,
    ["editor"],
  );
  if (!allowed)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (
    role === "owner" &&
    member?.role !== "owner" &&
    (project as any).userId !== session.user.id
  ) {
    return NextResponse.json(
      { error: "Only owner can invite owners" },
      { status: 403 },
    );
  }

  const token = crypto.randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days

  const invite = await Invite.create({
    token,
    projectId: id,
    email,
    role: role || "viewer",
    invitedBy: session.user.id,
    status: "pending",
    expiresAt,
  });

  try {
    await Audit.create({
      action: "invite.create",
      actor: session.user.id,
      targetType: "project",
      targetId: id,
      data: { inviteId: invite._id, email, role: invite.role },
    });
  } catch (e) {
    console.warn("audit create failed", e);
  }

  // create an in-app notification record (by email if user not present yet)
  try {
    await Notification.create({
      email,
      type: "invite_sent",
      data: {
        projectId: id,
        projectName: (project as any).name,
        role: invite.role,
        invitedBy: session.user.id,
        inviteId: invite._id,
      },
    });
  } catch (nerr) {
    console.error("notification create failed", nerr);
  }

  // send email if SMTP configured
  try {
    if (process.env.SMTP_HOST) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const acceptUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/invites/accept?token=${token}`;

      await transporter.sendMail({
        from: process.env.SMTP_FROM || "no-reply@example.com",
        to: email,
        subject: `You're invited to collaborate on project ${project.name}`,
        html: `
          <div style="font-family: sans-serif;">
            <h2>You're invited to collaborate on ${project.name}</h2>
            <p>${session.user.name || session.user.email} invited you as <strong>${invite.role}</strong>.</p>
            <p style="margin-top:12px"><a href="${acceptUrl}" style="display:inline-block;padding:10px 16px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;">Accept invite</a></p>
            <p style="margin-top:12px;color:#666">If you didn't expect this invite, you can ignore this email.</p>
          </div>
        `,
      });
    }
  } catch (e) {
    console.error("invite email failed", e);
  }

  return NextResponse.json(
    { invite: { id: invite._id, email: invite.email, role: invite.role } },
    { status: 201 },
  );
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectToDatabase();
  const { id } = await params;
  const { allowed } = await checkProjectMembership(session.user.id, id, [
    "viewer",
  ]);
  if (!allowed)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const invites = await Invite.find({ projectId: id })
    .sort({ createdAt: -1 })
    .limit(100);
  return NextResponse.json({ invites });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { inviteId } = body || {};
  if (!inviteId)
    return NextResponse.json({ error: "inviteId required" }, { status: 400 });

  await connectToDatabase();
  const { id } = await params;
  const { allowed, member } = await checkProjectMembership(
    session.user.id,
    id,
    ["editor"],
  );
  if (!allowed)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const invite = await Invite.findOne({
    _id: inviteId,
    projectId: resolvedParams.id,
  });
  if (!invite)
    return NextResponse.json({ error: "not found" }, { status: 404 });
  if (invite.status !== "pending")
    return NextResponse.json({ error: "invalid state" }, { status: 400 });

  // Only the inviter or a project owner can cancel
  const isInviter = String(invite.invitedBy) === String(session.user.id);
  const isProjectOwner = member?.role === "owner";
  if (!isInviter && !isProjectOwner)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  invite.status = "revoked";
  await invite.save();

  try {
    await Audit.create({
      action: "invite.cancel",
      actor: session.user.id,
      targetType: "project",
      targetId: resolvedParams.id,
      data: { inviteId: invite._id },
    });
  } catch (e) {
    console.warn("audit create failed", e);
  }

  try {
    await Notification.create({
      email: invite.email,
      type: "invite_revoked",
      data: {
        projectId: resolvedParams.id,
        inviteId: invite._id,
        cancelledBy: session.user.id,
      },
    });
  } catch (nerr) {
    console.error("notification create failed", nerr);
  }

  return NextResponse.json({ success: true });
}
