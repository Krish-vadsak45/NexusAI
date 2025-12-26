import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Usage from "@/models/Usage.model";

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (
      process.env.CRON_SECRET &&
      authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    // Reset all daily counters and tokens for all users
    const result = await Usage.updateMany(
      {},
      {
        $set: {
          articlesGenerated: 0,
          titlesGenerated: 0,
          imagesGenerated: 0,
          backgroundRemovals: 0,
          objectRemovals: 0,
          resumeReviews: 0,
          textSummaries: 0,
          codeGenerations: 0,
          tokensUsed: 0,
          date: new Date(), // Mark as reset for today
        },
      }
    );

    return NextResponse.json({
      success: true,
      message: `Daily usage reset completed. Updated ${result.modifiedCount} records.`,
    });
  } catch (error) {
    console.error("Cron Job Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
