import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import { auth } from "@/lib/auth";
import { checkProjectMembership } from "@/lib/acl";
import type {
  ProjectAccessRecord,
  ProjectMember,
  ProjectRole,
} from "@/lib/shared-types";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> },
) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const resolvedParams = await params;
  const { id, userId } = resolvedParams;

  const body = await req.json();
  const { role } = body;
  if (!role)
    return NextResponse.json({ error: "role required" }, { status: 400 });

  await connectToDatabase();
  const {
    allowed,
    project,
    member: requester,
  } = await checkProjectMembership(session.user.id, id, ["viewer"]);
  if (!allowed)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // only owner can change roles
  const projectData = project as ProjectAccessRecord;
  if (requester.role !== "owner" && projectData.userId !== session.user.id)
    return NextResponse.json(
      { error: "Only owner can change roles" },
      { status: 403 },
    );

  const member = projectData.members?.find(
    (projectMember: ProjectMember) => projectMember.userId === userId,
  );
  if (!member)
    return NextResponse.json({ error: "Member not found" }, { status: 404 });

  // prevent demoting the last owner
  if (member.role === "owner" && role !== "owner") {
    const owners = (projectData.members || []).filter(
      (projectMember: ProjectMember) => projectMember.role === "owner",
    );
    if (owners.length <= 1)
      return NextResponse.json(
        { error: "Cannot demote the last owner" },
        { status: 400 },
      );
  }

  member.role = role as ProjectRole;
  await project.save();
  return NextResponse.json({ success: true, member });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> },
) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, userId } = await params;

  await connectToDatabase();
  const {
    allowed,
    project: project2,
    member: requester2,
  } = await checkProjectMembership(session.user.id, id, ["viewer"]);
  if (!allowed)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // only owner can remove members
  const projectRecord = project2 as ProjectAccessRecord;
  if (requester2.role !== "owner" && projectRecord.userId !== session.user.id)
    return NextResponse.json(
      { error: "Only owner can remove members" },
      { status: 403 },
    );

  const memberIndex = projectRecord.members?.findIndex(
    (projectMember: ProjectMember) => projectMember.userId === userId,
  );
  if (memberIndex === -1 || memberIndex === undefined)
    return NextResponse.json({ error: "Member not found" }, { status: 404 });

  const member = projectRecord.members?.[memberIndex];
  if (!member)
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  if (member.role === "owner") {
    const owners = (projectRecord.members || []).filter(
      (projectMember: ProjectMember) => projectMember.role === "owner",
    );
    if (owners.length <= 1)
      return NextResponse.json(
        { error: "Cannot remove the last owner" },
        { status: 400 },
      );
  }

  projectRecord.members?.splice(memberIndex, 1);
  await project2.save();
  return NextResponse.json({ success: true });
}
