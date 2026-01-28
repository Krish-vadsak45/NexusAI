import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import { auth } from "@/lib/auth";
import Notification from "@/models/Notification.model";

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectToDatabase();
  const notifications = await Notification.find({
    $or: [{ userId: session.user.id }, { email: session.user.email }],
  })
    .sort({ createdAt: -1 })
    .limit(200);
  return NextResponse.json({ notifications });
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
