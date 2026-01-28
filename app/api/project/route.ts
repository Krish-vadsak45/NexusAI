import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Project from "@/models/Project.model";
import connectToDatabase from "@/lib/db";

// GET: Fetch all projects for the user
export async function GET(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    await connectToDatabase();
    const projects = await Project.find({ userId: session.user.id }).sort({
      createdAt: -1,
    });

    return NextResponse.json(projects);
  } catch (error) {
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

    return NextResponse.json(project);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
