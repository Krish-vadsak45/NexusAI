import { auth } from "@/lib/auth";
import logger from "@/lib/logger";
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
    .middleware(async () => {
      try {
        const session = await auth.api.getSession({
          headers: await headers(),
        });
        if (!session) {
          throw new Error("Unauthorized");
        }
        logger.debug(
          { userId: session.user.id },
          "UploadThing session verified",
        );
        return { userId: session.user.id };
      } catch (err) {
        logger.error({ err }, "UploadThing middleware error");
        throw err;
      }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      logger.info(
        { userId: metadata.userId, fileUrl: file.ufsUrl },
        "UploadThing upload complete",
      );
      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
