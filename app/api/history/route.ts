import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import History from "@/models/History.model";
import connectToDatabase from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
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
  } catch (error) {
    console.error("[HISTORY_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");

    await connectToDatabase();

    const query: any = { userId: session.user.id };
    if (projectId) {
      query.projectId = projectId;
    }

    const history = await History.find(query).sort({ createdAt: -1 }).limit(50);

    return NextResponse.json(history);
  } catch (error) {
    console.error("[HISTORY_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
