import { auth } from "@/lib/auth";
import { getUsageSummary } from "@/middleware/usage";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const summary = await getUsageSummary(session.user.id);
    console.log("Usage Summary:", summary);
    return NextResponse.json(summary);
  } catch (error) {
    console.error("Error fetching usage summary:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
