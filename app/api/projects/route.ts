import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Project from "@/models/Project.model";
import connectToDatabase from "@/lib/db";

// GET: Fetch all projects for the user with pagination and search
export async function GET(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    const { searchParams } = new URL(req.url);
    const page = Number.parseInt(searchParams.get("page") || "1");
    const limit = Number.parseInt(searchParams.get("limit") || "12");
    const q = searchParams.get("q") || "";

    const skip = (page - 1) * limit;

    await connectToDatabase();

    const query: any = { userId: session.user.id };

    if (q) {
      query.name = { $regex: q, $options: "i" };
    }

    const [projects, total] = await Promise.all([
      Project.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Project.countDocuments(query),
    ]);

    return NextResponse.json({
      projects,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
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
