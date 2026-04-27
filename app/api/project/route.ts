import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Project from "@/models/Project.model";
import connectToDatabase from "@/lib/db";
import { getOrSetCache, isValidMongoId } from "@/lib/cache-utils";
import { getErrorMessage } from "@/lib/error-utils";
import logger from "@/lib/logger";
import redis from "@/lib/redisClient";

// GET: Fetch all projects for the user or a specific project by ID
export async function GET(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    const url = new URL(req.url);
    const projectId = url.searchParams.get("id");

    await connectToDatabase();

    // If ID is provided, use the enterprise cache utility
    if (projectId) {
      if (!isValidMongoId(projectId)) {
        return new NextResponse("Invalid Project ID", { status: 400 });
      }

      const cacheKey = `project_data:${projectId}`;
      const project = await getOrSetCache(
        cacheKey,
        async () => {
          return await Project.findOne({
            _id: projectId,
            userId: session.user.id,
          }).lean();
        },
        {
          ttl: 3600, // 1 hour positive cache
          negativeTtl: 60, // 60 seconds negative cache if project doesn't exist
          useJitter: true, // Add randomness
          useL1: true, // 1-second process memory          bloomFilterKey: "project_bloom_filter", // Pass the filter key here
        },
      );

      if (!project) {
        return new NextResponse("Project not found", { status: 404 });
      }

      return NextResponse.json(project);
    }

    // Default behavior for fetching all projects (no caching applied to full user lists here for simplicity)
    const projects = await Project.find({ userId: session.user.id }).sort({
      createdAt: -1,
    });

    return NextResponse.json(projects);
  } catch {
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// POST: Create a new project
export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    const { name, description } = await req.json();
    await connectToDatabase();

    const project = await Project.create({
      userId: session.user.id,
      name,
      description,
    });

    // Enterprise Step: Add new ID to the project Bloom Filter
    // This allows the caching layer to instantly reject fake IDs with 0.01% error.
    try {
      await redis.call(
        "BF.ADD",
        "project_bloom_filter",
        project._id.toString(),
      );
    } catch (error: unknown) {
      logger.warn(
        { errorMessage: getErrorMessage(error) },
        "Bloom filter add failed",
      );
    }

    return NextResponse.json(project);
  } catch {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
