import { auth } from "@/lib/auth";
import { getUsageSummary } from "@/middleware/usage";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { UnauthorizedError, withApiHandler } from "@/lib/errors";

export const GET = withApiHandler(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new UnauthorizedError();
  }

  const summary = await getUsageSummary(session.user.id);
  return NextResponse.json(summary);
});
