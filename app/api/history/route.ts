import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import History from "@/models/History.model";
import connectToDatabase from "@/lib/db";
import { UnauthorizedError, withApiHandler } from "@/lib/errors";

export const POST = withApiHandler(async (req: Request) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new UnauthorizedError();
  }

  const body = await req.json();
  const { tool, title, input, output, projectId } = body;

  await connectToDatabase();

  const historyItem = await History.create({
    userId: session.user.id,
    projectId: projectId || null,
    tool,
    title,
    input,
    output,
  });

  return NextResponse.json(historyItem);
});

export const GET = withApiHandler(async (req: Request) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new UnauthorizedError();
  }

  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");
  const cursor = searchParams.get("cursor"); // cursor is the _id of the last item

  let limit = Number.parseInt(searchParams.get("limit") || "12");
  if (Number.isNaN(limit) || limit < 1) limit = 12;
  if (limit > 50) limit = 50;

  const tool = searchParams.get("tool");
  const search = searchParams.get("search");

  await connectToDatabase();

  const query: Record<string, unknown> = { userId: session.user.id };
  if (projectId) {
    query.projectId = projectId;
  }
  if (tool && tool !== "All") {
    query.tool = tool;
  }
  if (search) {
    query.title = { $regex: search, $options: "i" };
  }

  if (cursor) {
    query._id = { $lt: cursor };
  }

  const [history, totalCount] = await Promise.all([
    History.find(query).sort({ _id: -1 }).limit(limit).lean(),
    History.countDocuments(query),
  ]);

  const nextCursor =
    history.length > 0 ? history[history.length - 1]._id : null;

  return NextResponse.json({
    items: history,
    nextCursor,
    totalCount,
  });
});
