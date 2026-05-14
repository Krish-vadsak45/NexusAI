import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import { auth } from "@/lib/auth";
import Audit from "@/models/Audit.model";

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();
  const entries = await Audit.find({
    actor: session.user.id,
  })
    .sort({ createdAt: -1 })
    .limit(30)
    .lean();

  return NextResponse.json({
    entries: entries.map((entry) => ({
      id: String(entry._id),
      action: entry.action,
      targetType: entry.targetType ?? null,
      targetId: entry.targetId ? String(entry.targetId) : null,
      createdAt: entry.createdAt,
      data: entry.data ?? {},
    })),
  });
}
