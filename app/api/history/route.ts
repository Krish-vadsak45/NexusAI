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
    const page = Number.parseInt(searchParams.get("page") || "1");
    const limit = Number.parseInt(searchParams.get("limit") || "12");
    const tool = searchParams.get("tool");
    const search = searchParams.get("search");

    await connectToDatabase();

    const query: any = { userId: session.user.id };
    if (projectId) {
      query.projectId = projectId;
    }
    if (tool && tool !== "All") {
      query.tool = tool;
    }
    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    const skip = (page - 1) * limit;

    const [history, totalCount] = await Promise.all([
      History.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      History.countDocuments(query),
    ]);

    return NextResponse.json({
      items: history,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error("[HISTORY_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
