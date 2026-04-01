import { NextRequest, NextResponse } from "next/server";
import { getAdminContext } from "@/lib/admin";
import { getAdminUsers } from "@/lib/admin-queries";

export async function GET(req: NextRequest) {
  const admin = await getAdminContext(req.headers);
  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") ?? undefined;
  const cursor = searchParams.get("cursor") ?? undefined;
  const limit = searchParams.get("limit") ?? undefined;

  try {
    const result = await getAdminUsers({
      query,
      cursor,
      limit: limit ? Number(limit) : undefined,
    });
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to load users" },
      { status: 500 },
    );
  }
}
