import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import { auth } from "@/lib/auth";
import User from "@/models/user.model";
import { checkProjectMembership } from "@/lib/acl";
import logger from "@/lib/logger";
import type { ProjectAccessRecord, ProjectMember } from "@/lib/shared-types";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.min(
    100,
    Math.max(1, Number(searchParams.get("limit")) || 20),
  );

  await connectToDatabase();
  const { allowed, project } = await checkProjectMembership(
    session.user.id,
    id,
    ["viewer"],
  );
  if (!allowed)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const projectData = project as ProjectAccessRecord;
  const allMembers = projectData.members || [];
  const total = allMembers.length;

  // Sort members locally by role or joinedAt if needed, or stick to existing order
  // For now, simple pagination on the array:
  const startIndex = (page - 1) * limit;
  const rawMembers = allMembers.slice(startIndex, startIndex + limit);

  // collect user ids to resolve emails
  const idsToResolve = Array.from(
    new Set(
      rawMembers
        .flatMap((member) => [member.userId, member.invitedBy])
        .filter(Boolean)
        .map(String),
    ),
  );
  logger.debug(
    { projectId: id, idsToResolveCount: idsToResolve.length },
    "Resolving project member identities",
  );

  let usersById: Record<
    string,
    { email?: string; _id?: string; name?: string }
  > = {};
  if (idsToResolve.length > 0) {
    const users = await User.find({
      $or: [{ _id: { $in: idsToResolve } }, { id: { $in: idsToResolve } }],
    })
      .select("email name id")
      .lean();

    usersById = users.reduce<
      Record<string, { email?: string; _id?: string; name?: string }>
    >((acc, u) => {
      const id = String(u._id || u.id);
      acc[id] = { email: u.email, name: u.name, _id: id };
      return acc;
    }, {});
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

  const enriched = rawMembers.map((m: ProjectMember) => {
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

  return NextResponse.json({
    members: enriched,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
}
