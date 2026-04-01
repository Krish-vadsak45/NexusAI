import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Project from "@/models/Project.model";
import connectToDatabase from "@/lib/db";
import logger from "@/lib/logger";

// GET: Fetch all projects for the user with pagination and search
export async function GET(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get("cursor");

    // Validate and clamp limit
    let limit = Number.parseInt(searchParams.get("limit") || "12");
    if (Number.isNaN(limit) || limit < 1) limit = 12;
    if (limit > 50) limit = 50; // Hard max limit

    const q = searchParams.get("q") || "";

    await connectToDatabase();

    const query: any = { userId: session.user.id };

    if (q) {
      query.name = { $regex: q, $options: "i" };
    }

    if (cursor) {
      query._id = { $lt: cursor };
    }

    const [projects, total] = await Promise.all([
      Project.find(query).sort({ _id: -1 }).limit(limit).lean(),
      Project.countDocuments(query),
    ]);

    const nextCursor =
      projects.length > 0 ? projects[projects.length - 1]._id : null;

    return NextResponse.json({
      projects,
      nextCursor,
      total,
    });
  } catch (error) {
    console.error("[PROJECTS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// POST: Create a new project
export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    const { name, description } = await req.json();

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    await connectToDatabase();

    const project = await Project.create({
      userId: session.user.id,
      name,
      description,
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error("[PROJECTS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
