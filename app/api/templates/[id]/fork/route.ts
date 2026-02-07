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
    const originalTemplate = await Template.findById(id);

    if (!originalTemplate) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 },
      );
    }

    if (
      !originalTemplate.isPublic &&
      originalTemplate.userId.toString() !== session.user.id
    ) {
      return NextResponse.json(
        { error: "Cannot fork private template" },
        { status: 403 },
      );
    }

    // Get the latest version to fork from
    const latestVersion =
      originalTemplate.versions[originalTemplate.versions.length - 1];

    const forkedTemplate = new Template({
      userId: session.user.id,
      // We don't copy specific project ID unless logic dictates, usually fork goes to user's general collection or asked
      title: `Fork of ${originalTemplate.title}`,
      description: originalTemplate.description,
      tags: originalTemplate.tags,
      isPublic: false, // Default to private
      category: originalTemplate.category,
      versions: [
        {
          version: 1,
          content: latestVersion.content,
          metadata: latestVersion.metadata,
          changelog: `Forked from ${originalTemplate.title} (v${latestVersion.version})`,
          authorId: session.user.id,
          createdAt: new Date(),
        },
      ],
      currentVersion: 1,
      forkedFrom: originalTemplate._id,
    });

    await forkedTemplate.save();

    return NextResponse.json(forkedTemplate, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
