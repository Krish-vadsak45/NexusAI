import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import { auth } from "@/lib/auth";
import Project from "@/models/Project.model";
import User from "@/models/user.model";
import { checkProjectMembership } from "@/lib/acl";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectToDatabase();
  const resolvedParams = await params;
  const { allowed, project } = await checkProjectMembership(
    session.user.id,
    resolvedParams.id,
    ["viewer"],
  );
  if (!allowed)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const rawMembers = (project as any).members || [];

  // collect user ids to resolve emails
  const idsToResolve = Array.from(
    new Set(
      rawMembers
        .flatMap((m: any) => [m.userId, m.invitedBy])
        .filter(Boolean)
        .map(String),
    ),
  );
  console.log("IDs to resolve:", idsToResolve);

  let usersById: Record<
    string,
    { email?: string; _id?: string; name?: string }
  > = {};
  if (idsToResolve.length > 0) {
    // Better Auth uses 'user' collection. We query via Mongoose model updated to point there.
    // Try to ensure we match by both string or ObjectId if needed, although Mongoose handles casting.
    const users = await User.find({ 
      $or: [
        { _id: { $in: idsToResolve } },
        // if some IDs are stored as strings in _id field (rare but possible in some adapters)
        { id: { $in: idsToResolve } }
      ]
    })
      .select("email name id")
      .lean();

    usersById = users.reduce((acc: any, u: any) => {
      const id = String(u._id || u.id);
      acc[id] = { email: u.email, name: u.name, _id: id };
      return acc;
    }, {});
    
    console.log(`Resolved ${users.length} users from ${idsToResolve.length} IDs`);
  }

  const deriveName = (
    u?: { name?: string; email?: string },
    fallbackId?: string,
  ) => {
    if (u?.name) return u.name;
    if (u?.email) return u.email.split("@")[0];
    return fallbackId
      ? `User (${String(fallbackId).slice(0, 8)})`
      : "Unknown User";
  };

  const enriched = rawMembers.map((m: any) => {
    const uid = m.userId ? String(m.userId) : "";
    const inviterId = m.invitedBy ? String(m.invitedBy) : "";
    const user = usersById[uid];
    const inviter = usersById[inviterId];

    return {
      userId: m.userId,
      userName: deriveName(user, uid),
      role: m.role,
      inviteStatus: m.inviteStatus,
      invitedBy: deriveName(inviter, inviterId),
      invitedByEmail: inviter?.email || null,
      joinedAt: m.joinedAt,
      permissionsOverrides: m.permissionsOverrides || null,
      userEmail: user?.email || null,
    };
  });

  return NextResponse.json({ members: enriched });
}
