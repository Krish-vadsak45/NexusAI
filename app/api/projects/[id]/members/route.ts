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

  let usersById: Record<
    string,
    { email?: string; _id?: string; name?: string }
  > = {};
  if (idsToResolve.length > 0) {
    console.log("Resolving user info for IDs:", idsToResolve);
    const users = await User.find({ _id: { $in: idsToResolve } })
      .select("email name")
      .lean();
    usersById = users.reduce((acc: any, u: any) => {
      acc[String(u._id)] = { email: u.email, name: u.name, _id: String(u._id) };
      return acc;
    }, {});
  }
  console.log("Resolved usersById:", rawMembers);
  console.log("hii", usersById[String("6957acda598325d702afde0c")]?.name);
  const enriched = rawMembers.map(async (m: any) => ({
    userId: m.userId,
    userName: (await findDetails(String(m.userId), "name")) || "Unknown User",
    role: m.role,
    inviteStatus: m.inviteStatus,
    invitedBy:
      (await findDetails(String(m.invitedBy), "name")) || "Unknown User",
    invitedByEmail:
      (await findDetails(String(m.invitedBy), "email")) || "Unknown User",
    joinedAt: m.joinedAt,
    permissionsOverrides: m.permissionsOverrides || null,
    userEmail: m.userId ? usersById[String(m.userId)]?.email || null : null,
  }));

  return NextResponse.json({ members: enriched });
}

async function findDetails(userId: string, field?: string) {
  if (!userId) return { user: null };

  await connectToDatabase();
  console.log("userId sgsb", userId);
  const user = await User.findById(userId).lean();
  console.log("user jhbcjhb", user);
  return field == "name" ? user.name : user.email;
}
