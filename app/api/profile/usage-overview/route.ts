import { auth } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import logger from "@/lib/logger";
import DailyUsage from "@/models/DailyUsage.model";
import mongoose from "mongoose";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type { UnknownRecord } from "@/lib/shared-types";

type UsageAggregateRow = {
  _id: {
    date: string;
    feature: string;
  };
  tokens: number;
  count: number;
  success: number;
  fail: number;
};

type UsageOverviewRecord = {
  date: string;
  totalTokens: number;
  totalAttempts: number;
  totalSuccess: number;
  totalFail: number;
  tools: Record<string, UnknownRecord>;
};

type UsageSummary = {
  totalTokens: number;
  totalAttempts: number;
  totalSuccess: number;
  totalFail: number;
};

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
    const formattedData = (usageData as UsageAggregateRow[]).reduce<
      Record<string, UsageOverviewRecord>
    >((acc, item) => {
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

    const totals = Object.values(formattedData).reduce<UsageSummary>(
      (acc, day) => {
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
    logger.error({ err: error }, "Usage overview request failed");
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
