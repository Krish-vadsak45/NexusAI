import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { requireAuth } from "@/middleware/requireAuth";
import connectToDatabase from "@/lib/db";
import { ObjectId } from "mongodb";

export async function GET(req: NextRequest) {
  // Run auth middleware
  const authResult = await requireAuth(req);
  if (authResult) return authResult;

  // Get session
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  console.log("Profile API session user:", session.user);
  // You can fetch more user info from your DB here if needed
  // For now, just return the session user
  // Connect to your MongoDB
  const db = await connectToDatabase();
  // Check if a twofactor record exists for this user
  const twoFactorDoc = await db
    .collection("twoFactor")
    .findOne({ userId: new ObjectId(session.user.id) });
  // console.log("TwoFactorDoc:", twoFactorDoc);
  return NextResponse.json({
    user: { ...session.user, twoFactorEnabled: !!twoFactorDoc },
  });
}
