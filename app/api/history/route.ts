export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import History from "@/models/History.model";
import connectToDatabase from "@/lib/db";
import {


  historyCreateRequestSchema,
  historyListQuerySchema,
  historyListResponseSchema,
  type HistoryListResponse,
} from "@/lib/api/contracts";
import { UnauthorizedError, ValidationError, withApiHandler } from "@/lib/errors";
import type { HistoryItem, UnknownRecord } from "@/lib/shared-types";

function serializeHistoryItem(item: Record<string, unknown>): HistoryItem {
  return {
    _id: String(item._id ?? ""),
    tool: String(item.tool ?? ""),
    title: String(item.title ?? ""),
    createdAt:
      item.createdAt instanceof Date
        ? item.createdAt.toISOString()
        : String(item.createdAt ?? ""),
    input: (item.input as UnknownRecord | undefined) ?? {},
    output: item.output,
  };
}

export const POST = withApiHandler(async (req: Request) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new UnauthorizedError();
  }

  const body = historyCreateRequestSchema.parse(await req.json());
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

  return NextResponse.json(serializeHistoryItem(historyItem.toObject()));
});

export const GET = withApiHandler(async (req: Request) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new UnauthorizedError();
  }

  const { searchParams } = new URL(req.url);
  const parsedQuery = historyListQuerySchema.safeParse({
    projectId: searchParams.get("projectId"),
    cursor: searchParams.get("cursor"),
    limit: searchParams.get("limit") || undefined,
    tool: searchParams.get("tool"),
    search: searchParams.get("search"),
  });
  if (!parsedQuery.success) {
    throw new ValidationError("Invalid history query", {
      details: parsedQuery.error.flatten(),
    });
  }
  const { projectId, cursor, limit, tool, search } = parsedQuery.data;

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

  const response: HistoryListResponse = {
    items: history.map((item) =>
      serializeHistoryItem(item as unknown as Record<string, unknown>),
    ),
    nextCursor: nextCursor ? String(nextCursor) : null,
    totalCount,
  };

  return NextResponse.json(
    historyListResponseSchema.parse(response),
  );
});