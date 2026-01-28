import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import { auth } from "@/lib/auth";
import Project from "@/models/Project.model";
import { checkProjectMembership } from "@/lib/acl";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; userId: string } },
) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { role } = body;
  if (!role)
    return NextResponse.json({ error: "role required" }, { status: 400 });

  await connectToDatabase();
  const {
    allowed,
    project,
    member: requester,
  } = await checkProjectMembership(session.user.id, params.id, ["viewer"]);
  if (!allowed)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // only owner can change roles
  if (requester.role !== "owner" && (project as any).userId !== session.user.id)
    return NextResponse.json(
      { error: "Only owner can change roles" },
      { status: 403 },
    );

  const member = (project as any).members?.find(
    (m: any) => m.userId === params.userId,
  );
  if (!member)
    return NextResponse.json({ error: "Member not found" }, { status: 404 });

  // prevent demoting the last owner
  if (member.role === "owner" && role !== "owner") {
    const owners = (project as any).members.filter(
      (m: any) => m.role === "owner",
    );
    if (owners.length <= 1)
      return NextResponse.json(
        { error: "Cannot demote the last owner" },
        { status: 400 },
      );
  }

  member.role = role;
  await project.save();
  return NextResponse.json({ success: true, member });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; userId: string } },
) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectToDatabase();
  const {
    allowed,
    project: project2,
    member: requester2,
  } = await checkProjectMembership(session.user.id, params.id, ["viewer"]);
  if (!allowed)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // only owner can remove members
  if (
    requester2.role !== "owner" &&
    (project2 as any).userId !== session.user.id
  )
    return NextResponse.json(
      { error: "Only owner can remove members" },
      { status: 403 },
    );

  const memberIndex = (project2 as any).members?.findIndex(
    (m: any) => m.userId === params.userId,
  );
  if (memberIndex === -1 || memberIndex === undefined)
    return NextResponse.json({ error: "Member not found" }, { status: 404 });

  const member = (project2 as any).members[memberIndex];
  if (member.role === "owner") {
    const owners = (project2 as any).members.filter(
      (m: any) => m.role === "owner",
    );
    if (owners.length <= 1)
      return NextResponse.json(
        { error: "Cannot remove the last owner" },
        { status: 400 },
      );
  }

  (project2 as any).members.splice(memberIndex, 1);
  await project2.save();
  return NextResponse.json({ success: true });
}
