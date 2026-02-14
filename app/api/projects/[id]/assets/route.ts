import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import { auth } from "@/lib/auth";
import Project from "@/models/Project.model";
import SharedAsset from "@/models/SharedAsset.model";
import { checkProjectMembership } from "@/lib/acl";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectToDatabase();
  const { allowed } = await checkProjectMembership(session.user.id, id, [
    "viewer",
  ]);
  if (!allowed)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const assets = await SharedAsset.find({ projectId: id })
    .sort({ updatedAt: -1 })
    .limit(200);
  return NextResponse.json({ assets });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { title, type, content, visibility } = body;
  if (!type || !content)
    return NextResponse.json(
      { error: "type and content required" },
      { status: 400 },
    );

  await connectToDatabase();
  const { allowed, project, member } = await checkProjectMembership(
    session.user.id,
    id,
    ["editor"],
  );
  if (!allowed)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // only owner/editor can create assets
  if (member.role !== "owner" && member.role !== "editor")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const asset = await SharedAsset.create({
    projectId: id,
    createdBy: session.user.id,
    title: title || "",
    type,
    content,
    visibility: visibility || "project",
    version: 1,
  });

  return NextResponse.json({ asset }, { status: 201 });
}
