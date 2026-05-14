import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { requireAuth } from "@/middleware/requireAuth";
import connectToDatabase from "@/lib/db";
import logger from "@/lib/logger";
import { ObjectId } from "mongodb";
import Subscription from "@/models/Subscription.model";
import { APIError } from "better-auth/api";

export async function GET(req: NextRequest) {
  try {
    // Run auth middleware
    const authResult = await requireAuth(req);
    if (authResult) return authResult;

    // Get session
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    logger.debug({ userId: session.user.id }, "Profile API session resolved");

    // Connect to your MongoDB
    const db = await connectToDatabase();

    // Fetch Subscription
    const subscription = await Subscription.findOne({ user: session.user.id });

    // Check if a twofactor record exists for this user
    let twoFactorDoc = null;
    if (ObjectId.isValid(session.user.id)) {
      twoFactorDoc = await db
        .collection("twoFactor")
        .findOne({ userId: new ObjectId(session.user.id) });
    }

    return NextResponse.json({
      user: {
        ...session.user,
        twoFactorEnabled: !!twoFactorDoc,
        subscription: subscription || null,
      },
    });
  } catch (error) {
    if (error instanceof APIError && error.statusCode === 429) {
      return NextResponse.json(
        {
          error: error.message,
          code: error.body?.code ?? "TOO_MANY_REQUESTS",
        },
        { status: 429 },
      );
    }

    logger.error({ err: error }, "Profile API failed");
    return NextResponse.json(
      { error: "Failed to load profile" },
      { status: 500 },
    );
  }
}
