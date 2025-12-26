import { auth } from "@/lib/auth";
import { checkUsage, incrementUsage } from "@/middleware/usage";
import { v2 as cloudinary } from "cloudinary";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
  try {
    // 1. Authentication Check
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in to use this tool." },
        { status: 401 }
      );
    }

    // 2. Usage Check
    const userId = session.user.id;
    const usageCheck = await checkUsage(userId, "background_removal");
    if (!usageCheck.allowed) {
      return NextResponse.json({ error: usageCheck.message }, { status: 403 });
    }

    // 3. Input Validation
    const formData = await req.formData();
    const imageFile = formData.get("image") as File;

    if (!imageFile) {
      return NextResponse.json(
        { error: "Image file is required" },
        { status: 400 }
      );
    }

    // 4. Upload to Cloudinary with Background Removal
    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Use a promise wrapper for the upload stream
    const uploadResult: any = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "background-removal",
          background_removal: "cloudinary_ai", // Use Cloudinary AI for BG removal
        },
        (error: any, result: any) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    // 5. Return the publicId and other details for next-cloudinary
    // We also return the processed URL as a fallback or for direct usage
    const processedUrl = cloudinary.url(uploadResult.public_id, {
      effect: "background_removal",
      secure: true,
      format: "png",
    });

    // 6. Increment Usage
    // Cloudinary BG removal costs credits.
    await incrementUsage(userId, "background_removal", 5000);

    return NextResponse.json({
      url: processedUrl,
      publicId: uploadResult.public_id,
      width: uploadResult.width,
      height: uploadResult.height,
      format: uploadResult.format,
    });
  } catch (error: any) {
    console.error("Background Removal Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
