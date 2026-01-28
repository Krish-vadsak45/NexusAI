import Invite from "../models/Invite.model";
import Project from "../models/Project.model";
import connectToDatabase from "./db";
import crypto from "crypto";
import Notification from "../models/Notification.model";
import Audit from "../models/Audit.model";

export async function generateInvite(
  projectId: string,
  email: string,
  role: string,
  invitedBy: string,
  expiresInDays = 7,
) {
  if (process.env.MONGODB_URI && process.env.NODE_ENV !== "test") {
    try {
      await connectToDatabase();
    } catch (e) {
      console.warn("connectToDatabase failed in generateInvite", e);
    }
  }

  const token = crypto.randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * expiresInDays);
  const invite = await Invite.create({
    token,
    projectId,
    email,
    role,
    invitedBy,
    status: "pending",
    expiresAt,
  });
  try {
    if (process.env.NODE_ENV !== "test") {
      await Audit.create({
        action: "invite.create",
        actor: invitedBy,
        targetType: "project",
        targetId: projectId,
        data: { inviteId: invite._id, email, role },
      });
    }
  } catch (e) {
    console.warn("audit create failed", e);
  }
  await Notification.create({
    email,
    type: "invite_sent",
    data: { projectId, role, inviteId: invite._id },
  });
  return invite;
}

export async function acceptInvite(
  token: string,
  user: any,
  claimToken?: string,
) {
  if (process.env.MONGODB_URI && process.env.NODE_ENV !== "test") {
    try {
      await connectToDatabase();
    } catch (e) {
      console.warn("connectToDatabase failed in acceptInvite", e);
    }
  }

  const invite = await Invite.findOne({ token });
  if (!invite) return { error: "Invite not found" };
  if (invite.status !== "pending") return { error: "Invite not pending" };
  if (invite.expiresAt && invite.expiresAt < new Date())
    return { error: "Invite expired" };

  const project = await Project.findById(invite.projectId);
  if (!project) return { error: "Project not found" };

  // If user.email doesn't match invite.email, allow if claimToken matches
  if (user.email && user.email !== invite.email) {
    if (!claimToken) {
      // create a claim token and save it (caller will send claim email)
      const ct = crypto.randomBytes(20).toString("hex");
      invite.claimToken = ct;
      invite.claimTokenExpires = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 hours
      await invite.save();
      return { error: "email_mismatch", claimToken: ct, inviteId: invite._id };
    }
    // verify provided claimToken
    if (!invite.claimToken || invite.claimToken !== claimToken)
      return { error: "invalid_claim_token" };
    if (invite.claimTokenExpires && invite.claimTokenExpires < new Date())
      return { error: "claim_token_expired" };
  }

  // add member if not exists
  const exists = (project as any).members?.find(
    (m: any) => m.userId === user.id,
  );
  if (!exists) {
    (project as any).members = (project as any).members || [];
    (project as any).members.push({
      userId: user.id,
      role: invite.role,
      invitedBy: invite.invitedBy,
      inviteStatus: "accepted",
      joinedAt: new Date(),
    });
    await project.save();
  }

  invite.status = "claimed";
  invite.claimedAt = new Date();
  invite.claimToken = undefined;
  invite.claimTokenExpires = undefined;
  await invite.save();

  try {
    if (process.env.NODE_ENV !== "test") {
      await Audit.create({
        action: "invite.accept",
        actor: user.id,
        targetType: "project",
        targetId: project._id,
        data: { inviteId: invite._id, acceptedBy: user.id },
      });
    }
  } catch (e) {
    console.warn("audit create failed", e);
  }

  await Notification.create({
    userId: invite.invitedBy,
    type: "invite_accepted",
    data: { projectId: project._id, acceptedBy: user.id, inviteId: invite._id },
  });

  return { success: true, projectId: project._id };
}
