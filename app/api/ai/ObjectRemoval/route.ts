import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  checkAndIncrementUsage,
  revertFeatureUsage,
  recordUsageResult,
} from "@/middleware/usage";
import { v2 as cloudinary } from "cloudinary";
import { getErrorMessage } from "@/lib/error-utils";
import { headers } from "next/headers";
import logger from "@/lib/logger";

type CloudinaryUploadResult = {
  format?: string;
  height?: number;
  public_id?: string;
  secure_url?: string;
  width?: number;
};

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
  let session;
  try {
    // 1. Authenticate User
    session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. CHECK USAGE (Atomic)
    const userId = session.user.id;
    const usageCheck = await checkAndIncrementUsage(userId, "object_removal");
    if (!usageCheck.allowed) {
      return NextResponse.json(
        { error: usageCheck.message },
        { status: 403 }, // Forbidden
      );
    }

    // 3. Parse Form Data
    const formData = await req.formData();
    const file = formData.get("image") as File;

    if (!file) {
      await revertFeatureUsage(userId, "object_removal");
      await recordUsageResult(userId, "object_removal", 0, "fail");
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // Check file size (max 5MB)
    const MAX_FILE_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      await revertFeatureUsage(userId, "object_removal");
      await recordUsageResult(userId, "object_removal", 0, "fail");
      return NextResponse.json(
        { error: "File too large (max 5MB)" },
        { status: 413 },
      );
    }

    // 4. Upload to Cloudinary
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResult = await new Promise<CloudinaryUploadResult>(
      (resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "object-removal" },
          (error, result: CloudinaryUploadResult | undefined) => {
            if (error) {
              reject(error);
              return;
            }

            if (!result?.public_id || !result.secure_url) {
              reject(new Error("Cloudinary upload did not return image data"));
              return;
            }

            resolve(result);
          },
        );
        uploadStream.end(buffer);
      },
    );

    // We increment the feature count (handled inside checkAndIncrementUsage) and add token cost
    await recordUsageResult(userId, "object_removal", 5000, "success");

    return NextResponse.json({
      publicId: uploadResult.public_id,
      url: uploadResult.secure_url,
      width: uploadResult.width,
      height: uploadResult.height,
      format: uploadResult.format,
    });
  } catch (error: unknown) {
    logger.error({ err: error }, "Object Removal Error");
    if (session?.user?.id) {
      await revertFeatureUsage(session.user.id, "object_removal");
      await recordUsageResult(session.user.id, "object_removal", 0, "fail");
    }
    return NextResponse.json(
      { error: getErrorMessage(error, "Internal Server Error") },
      { status: 500 },
    );
  }
}
