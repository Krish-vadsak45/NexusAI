import { NextRequest, NextResponse } from "next/server";
import { getAdminContext } from "@/lib/admin";
import { getAdminMetrics } from "@/lib/admin-queries";

export async function GET(req: NextRequest) {
  const admin = await getAdminContext(req.headers);
  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  const { searchParams } = new URL(req.url);
  const refresh = searchParams.get("refresh") === "true";

  try {
    const metrics = await getAdminMetrics(refresh);
    return NextResponse.json(metrics);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to load metrics" },
      { status: 500 },
    );
  }
}
