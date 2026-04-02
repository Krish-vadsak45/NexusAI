import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import Template, { ITemplate } from "@/models/Template.model";
import User from "@/models/user.model";
import { headers } from "next/headers";
import { getOrSetCache, isValidMongoId } from "@/lib/cache-utils";
import redis from "@/lib/redisClient";

// GET single template
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectToDatabase();
    const session = await auth.api.getSession({ headers: await headers() });
    const { id } = await params;

    if (!isValidMongoId(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const templateData = await getOrSetCache<any>(
      `template_data:${id}`,
      async () => {
        // High-Value Strategy: Exclude heavy versions from detail view to save Redis memory.
        return await Template.findById(id)
          .select("-versions")
          .populate({
            path: "userId",
            model: User,
            select: "name image",
          })
          .lean();
      },
      {
        ttl: 3600, // 1 hour (High Value)
        negativeTtl: 30, // 30s (Low Value - Priority for Eviction)
        useJitter: true,
        useL1: true,
        bloomFilterKey: "template_bloom_filter",
      },
    );

    if (!templateData || Array.isArray(templateData)) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 },
      );
    }

    const template = templateData as any;

    // Visibility check
    const templateUserId =
      template.userId?._id?.toString() || template.userId?.toString();
    const isOwner = session?.user?.id === templateUserId;

    if (!template.isPublic && !isOwner) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json(template);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// UPDATE template metadata (title, description, isPublic, tags)
export async function PUT(
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
    const { title, description, isPublic, tags, category } = body;

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

    if (title) template.title = title;
    if (description !== undefined) template.description = description;
    if (isPublic !== undefined) template.isPublic = isPublic;
    if (tags) template.tags = tags;
    if (category) template.category = category;

    await template.save();

    // Invalidate the specific template cache
    await redis.del(`template_data:${id}`);

    return NextResponse.json(template);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE template
export async function DELETE(
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

    await Template.findByIdAndDelete(id);

    // Invalidate the specific template cache
    await redis.del(`template_data:${id}`);

    return NextResponse.json({ message: "Template deleted" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
