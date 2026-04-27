import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Project from "@/models/Project.model";
import connectToDatabase from "@/lib/db";
import {
  BadRequestError,
  UnauthorizedError,
  withApiHandler,
} from "@/lib/errors";

// GET: Fetch all projects for the user with pagination and search
export const GET = withApiHandler(async (req: Request) => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new UnauthorizedError();

  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get("cursor");

  let limit = Number.parseInt(searchParams.get("limit") || "12");
  if (Number.isNaN(limit) || limit < 1) limit = 12;
  if (limit > 50) limit = 50;

  const q = searchParams.get("q") || "";

  await connectToDatabase();

  const query: Record<string, unknown> = { userId: session.user.id };

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
});

// POST: Create a new project
export const POST = withApiHandler(async (req: Request) => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new UnauthorizedError();

  const { name, description } = await req.json();

  if (!name) {
    throw new BadRequestError("Name is required");
  }

  await connectToDatabase();

  const project = await Project.create({
    userId: session.user.id,
    name,
    description,
  });

  return NextResponse.json(project);
});
