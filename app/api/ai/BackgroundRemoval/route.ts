import { auth } from "@/lib/auth";
import {
  checkAndIncrementUsage,
  revertFeatureUsage,
  recordUsageResult,
} from "@/middleware/usage";
import { v2 as cloudinary } from "cloudinary";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getErrorMessage } from "@/lib/error-utils";
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
    // 1. Authentication Check
    session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in to use this tool." },
        { status: 401 },
      );
    }

    // 2. Usage Check (Atomic)
    const userId = session.user.id;
    const usageCheck = await checkAndIncrementUsage(
      userId,
      "background_removal",
    );
    if (!usageCheck.allowed) {
      return NextResponse.json({ error: usageCheck.message }, { status: 403 });
    }

    // 3. Input Validation
    const formData = await req.formData();
    const imageFile = formData.get("image") as File;

    if (!imageFile) {
      await revertFeatureUsage(userId, "background_removal");
      await recordUsageResult(userId, "background_removal", 0, "fail");
      return NextResponse.json(
        { error: "Image file is required" },
        { status: 400 },
      );
    }

    // Check file size (max 5MB)
    const MAX_FILE_SIZE = 5 * 1024 * 1024;
    if (imageFile.size > MAX_FILE_SIZE) {
      await revertFeatureUsage(userId, "background_removal");
      await recordUsageResult(userId, "background_removal", 0, "fail");
      return NextResponse.json(
        { error: "File too large. Max 5MB allowed." },
        { status: 413 },
      );
    }

    // 4. Upload to Cloudinary with Background Removal
    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Use a promise wrapper for the upload stream
    const uploadResult = await new Promise<CloudinaryUploadResult>(
      (resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "background-removal",
            background_removal: "cloudinary_ai", // Use Cloudinary AI for BG removal
          },
          (
            error: Error | undefined,
            result: CloudinaryUploadResult | undefined,
          ) => {
            if (error) {
              reject(error);
              return;
            }

            if (!result?.public_id) {
              reject(new Error("Cloudinary upload did not return a public ID"));
              return;
            }

            resolve(result);
          },
        );
        uploadStream.end(buffer);
      },
    );
    if (!uploadResult.public_id) {
      throw new Error("Cloudinary upload did not return a public ID");
    }
    const publicId = uploadResult.public_id;

    // 5. Return the publicId and other details for next-cloudinary
    // We also return the processed URL as a fallback or for direct usage
    const processedUrl = cloudinary.url(publicId, {
      effect: "background_removal",
      secure: true,
      format: "png",
    });

    // 6. Record Usage Success
    await recordUsageResult(userId, "background_removal", 5000, "success");

    return NextResponse.json({
      url: processedUrl,
      publicId,
      width: uploadResult.width,
      height: uploadResult.height,
      format: uploadResult.format,
    });
  } catch (error: unknown) {
    logger.error({ err: error }, "Background Removal Error");
    return NextResponse.json(
      { error: getErrorMessage(error, "Internal Server Error") },
      { status: 500 },
    );
  }
}
