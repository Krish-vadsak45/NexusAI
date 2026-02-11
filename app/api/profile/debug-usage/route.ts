import connectToDatabase from "@/lib/db";
import DailyUsage from "@/models/DailyUsage.model";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "No session" }, { status: 401 });
    }

    await connectToDatabase();

    const userId = session.user.id;
    const allData = await DailyUsage.find({
      $or: [
        { userId: userId },
        { userId: new mongoose.Types.ObjectId(userId) },
      ],
    })
      .limit(10)
      .lean();

    const sampleData = await DailyUsage.findOne().lean();
    const count = await DailyUsage.countDocuments();

    return NextResponse.json({
      sessionUserId: userId,
      dbCount: count,
      sampleRecord: sampleData,
      userSpecificData: allData,
      idType: typeof userId,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
