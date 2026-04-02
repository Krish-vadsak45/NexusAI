import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Project from "@/models/Project.model";
import connectToDatabase from "@/lib/db";
import { getOrSetCache, isValidMongoId } from "@/lib/cache-utils";
import redis from "@/lib/redisClient";

export async function GET(
  req: Request,
  props: { params: Promise<{ id: string }> },
) {
  const params = await props.params;
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    if (!isValidMongoId(params.id)) {
      return new NextResponse("Invalid Project ID", { status: 400 });
    }

    await connectToDatabase();

    // Check cache for this specific user's access to this specific project
    const cacheKey = `project_data:${params.id}:user:${session.user.id}`;
    const project = await getOrSetCache(
      cacheKey,
      async () => {
        // allow access to project owner or members
        return await Project.findOne({
          _id: params.id,
          $or: [
            { userId: session.user.id },
            { "members.userId": session.user.id },
          ],
        }).lean();
      },
      {
        ttl: 1800, // 30 minutes
        negativeTtl: 30, // 30 seconds for denied/not found scans
        useJitter: true,
        useL1: true,
      },
    );

    if (!project) {
      return new NextResponse("Project not found or Unauthorized", {
        status: 404,
      });
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error("[PROJECT_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  props: { params: Promise<{ id: string }> },
) {
  const params = await props.params;
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    await connectToDatabase();
    // Verify ownership
    const project = await Project.findOneAndDelete({
      _id: params.id,
      userId: session.user.id,
    });

    if (!project) {
      return new NextResponse("Project not found", { status: 404 });
    }

    // Invalidate the specific user's access cache (or any member cache if you have it)
    await redis.del(`project_data:${params.id}:user:${session.user.id}`);

    return NextResponse.json({ message: "Project deleted" });
  } catch (error) {
    console.error("[PROJECT_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
