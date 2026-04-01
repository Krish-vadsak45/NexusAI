import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
  pdfUploader: f({
    pdf: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .middleware(async ({ req }) => {
      console.log("Uploadthing middleware triggered");
      try {
        const session = await auth.api.getSession({
          headers: await headers(),
        });
        console.log("Session in uploadthing:", !!session);
        if (!session) {
          throw new Error("Unauthorized");
        }
        return { userId: session.user.id };
      } catch (err) {
        console.error("Uploadthing middleware error:", err);
        throw err;
      }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId);
      console.log("file url", file.ufsUrl);
      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
