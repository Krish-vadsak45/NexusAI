import { auth } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import DailyUsage from "@/models/DailyUsage.model";
import mongoose from "mongoose";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const month = Number.parseInt(
      searchParams.get("month") || new Date().getUTCMonth().toString(),
    );
    const year = Number.parseInt(
      searchParams.get("year") || new Date().getUTCFullYear().toString(),
    );

    await connectToDatabase();

    const startDate = new Date(Date.UTC(year, month, 1));
    const endDate = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));

    // DEBUG: Log the query parameters
    console.log("USAGE QUERY:", {
      userId: session.user.id,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });

    const usageData = await DailyUsage.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(session.user.id),
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
            feature: "$feature",
          },
          tokens: { $sum: "$tokens" },
          count: { $sum: "$count" },
          success: { $sum: "$success" },
          fail: { $sum: "$fail" },
        },
      },
      {
        $sort: { "_id.date": 1 },
      },
    ]);

    // Format data for easier use in charts
    const formattedData = usageData.reduce((acc: any, item: any) => {
      const date = item._id.date;
      if (!acc[date]) {
        acc[date] = {
          date,
          totalTokens: 0,
          totalAttempts: 0,
          totalSuccess: 0,
          totalFail: 0,
          tools: {},
        };
      }

      acc[date].totalTokens += item.tokens;
      acc[date].totalAttempts += item.count;
      acc[date].totalSuccess += item.success;
      acc[date].totalFail += item.fail;

      acc[date].tools[item._id.feature] = {
        tokens: item.tokens,
        count: item.count,
        success: item.success,
        fail: item.fail,
      };

      return acc;
    }, {});

    const totals = Object.values(formattedData).reduce(
      (acc: any, day: any) => {
        acc.totalTokens += day.totalTokens;
        acc.totalAttempts += day.totalAttempts;
        acc.totalSuccess += day.totalSuccess;
        acc.totalFail += day.totalFail;
        return acc;
      },
      { totalTokens: 0, totalAttempts: 0, totalSuccess: 0, totalFail: 0 },
    );

    return NextResponse.json({
      overview: Object.values(formattedData),
      summary: totals,
    });
  } catch (error) {
    console.error("Usage Overview Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
