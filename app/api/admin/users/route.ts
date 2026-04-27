import { NextRequest, NextResponse } from "next/server";
import { getAdminContext } from "@/lib/admin";
import { getAdminUsers } from "@/lib/admin-queries";
import {
  ForbiddenError,
  UnauthorizedError,
  withApiHandler,
} from "@/lib/errors";

export const GET = withApiHandler(async (req: NextRequest) => {
  const admin = await getAdminContext(req.headers);
  if (!admin.ok) {
    throw admin.status === 403
      ? new ForbiddenError(admin.error)
      : new UnauthorizedError(admin.error);
  }

  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") ?? undefined;
  const cursor = searchParams.get("cursor") ?? undefined;
  const limit = searchParams.get("limit") ?? undefined;

  const result = await getAdminUsers({
    query,
    cursor,
    limit: limit ? Number(limit) : undefined,
  });
  return NextResponse.json(result);
});
