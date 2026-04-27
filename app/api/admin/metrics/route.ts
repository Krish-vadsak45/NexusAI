import { NextRequest, NextResponse } from "next/server";
import { getAdminContext } from "@/lib/admin";
import { getAdminMetrics } from "@/lib/admin-queries";
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
  const refresh = searchParams.get("refresh") === "true";

  const metrics = await getAdminMetrics(refresh);
  return NextResponse.json(metrics);
});
