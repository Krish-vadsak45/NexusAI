import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import Invite from "@/models/Invite.model";
import { acceptInvite } from "@/lib/invite";
import Audit from "@/models/Audit.model";
import Notification from "@/models/Notification.model";

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { inviteId, action } = body || {};
  if (!inviteId || !action)
    return NextResponse.json(
      { error: "inviteId and action required" },
      { status: 400 },
    );

  await connectToDatabase();
  const invite = await Invite.findById(inviteId);
  if (!invite)
    return NextResponse.json({ error: "not found" }, { status: 404 });
  if (invite.expiresAt < new Date())
    return NextResponse.json({ error: "expired" }, { status: 400 });
  if (invite.status !== "pending")
    return NextResponse.json({ error: "invalid state" }, { status: 400 });

  // Ensure only the invited recipient can accept/reject
  if (
    String(invite.email).toLowerCase() !==
    String(session.user.email).toLowerCase()
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (action === "accept") {
    try {
      const result = await acceptInvite(invite.token, session.user);
      if (result.error)
        return NextResponse.json({ error: result.error }, { status: 400 });

      try {
        await Audit.create({
          action: "invite.accept",
          actor: session.user.id,
          targetType: "project",
          targetId: invite.projectId,
          data: { inviteId: invite._id },
        });
      } catch (e) {
        console.warn("audit create failed", e);
      }

      return NextResponse.json({ success: true, ...result });
    } catch (e) {
      console.error(e);
      return NextResponse.json({ error: "failed" }, { status: 500 });
    }
  }

  if (action === "reject") {
    try {
      invite.status = "declined";
      await invite.save();

      try {
        await Audit.create({
          action: "invite.reject",
          actor: session.user.id,
          targetType: "project",
          targetId: invite.projectId,
          data: { inviteId: invite._id },
        });
      } catch (e) {
        console.warn("audit create failed", e);
      }

      try {
        await Notification.create({
          email: invite.invitedBy, // notify inviter
          type: "invite_rejected",
          data: {
            projectId: invite.projectId,
            inviteId: invite._id,
            rejectedBy: session.user.id,
          },
        });
      } catch (nerr) {
        console.error("notification create failed", nerr);
      }

      return NextResponse.json({ success: true });
    } catch (e) {
      console.error(e);
      return NextResponse.json({ error: "failed" }, { status: 500 });
    }
  }

  return NextResponse.json({ error: "invalid action" }, { status: 400 });
}
