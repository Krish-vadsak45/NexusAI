import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import Template from "@/models/Template.model";
import { headers } from "next/headers";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectToDatabase();
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { content, metadata, changelog } = body;

    if (!content) {
      return NextResponse.json(
        { error: "Content is required for new version" },
        { status: 400 },
      );
    }

    const template = await Template.findById(id);
    if (!template) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 },
      );
    }

    if (template.userId.toString() !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const nextVersion = template.versions.length + 1;
    const newVersion = {
      version: nextVersion,
      content,
      metadata,
      changelog: changelog || `Version ${nextVersion}`,
      authorId: session.user.id,
      createdAt: new Date(),
    };

    template.versions.push(newVersion);
    template.currentVersion = nextVersion;

    await template.save();

    return NextResponse.json(template);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
