import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import { auth } from "@/lib/auth";
import Notification from "@/models/Notification.model";
import User from "@/models/user.model";
import Invite from "@/models/Invite.model";

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectToDatabase();
  const notifications = await Notification.find({
    $or: [{ userId: session.user.id }, { email: session.user.email }],
    read: false, // Typically pending notifications are unread
  })
    .sort({ createdAt: -1 })
    .limit(100);

  // Extract mentions to enrich
  const userIds = new Set<string>();
  const inviteIds = new Set<string>();
  notifications.forEach((n) => {
    if (n.data?.invitedBy) userIds.add(String(n.data.invitedBy));
    if (n.data?.rejectedBy) userIds.add(String(n.data.rejectedBy));
    if (n.data?.inviteId) inviteIds.add(String(n.data.inviteId));
  });

  const [users, invites] = await Promise.all([
    User.find({ _id: { $in: Array.from(userIds) } }).lean(),
    Invite.find({ _id: { $in: Array.from(inviteIds) } }).lean(),
  ]);

  const usersMap: Record<string, string> = {};
  users.forEach((u: any) => {
    usersMap[String(u._id)] = u.name || u.email;
  });

  const invitesMap: Record<string, string> = {};
  invites.forEach((iv: any) => {
    invitesMap[String(iv._id)] = iv.status;
  });

  const enriched = notifications
    .map((n) => {
      const plain = n.toObject();
      const status = plain.data?.inviteId
        ? invitesMap[String(plain.data.inviteId)]
        : null;

      // Filter out notifications for invites that are no longer pending
      if (plain.type === "invite_sent" && status && status !== "pending") {
        return null;
      }

      if (plain.data?.invitedBy) {
        plain.data.invitedByName = usersMap[String(plain.data.invitedBy)];
      }
      if (plain.data?.rejectedBy) {
        plain.data.rejectedByName = usersMap[String(plain.data.rejectedBy)];
      }
      return plain;
    })
    .filter(Boolean);

  return NextResponse.json({ notifications: enriched });
}

export async function PATCH(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { id, mark } = body;
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  await connectToDatabase();
  const n = await Notification.findById(id);
  if (!n) return NextResponse.json({ error: "not found" }, { status: 404 });
  // allow owner (by userId or email)
  if (
    String(n.userId) !== String(session.user.id) &&
    n.email !== session.user.email
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (mark === "read") n.read = true;
  else if (mark === "unread") n.read = false;
  else if (mark === "delete") await n.deleteOne();
  else {
    return NextResponse.json({ error: "invalid mark" }, { status: 400 });
  }

  try {
    await n.save();
  } catch (e) {}
  return NextResponse.json({ success: true });
}
