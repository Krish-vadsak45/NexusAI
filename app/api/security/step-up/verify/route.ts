import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyStepUpChallenge } from "@/lib/security/step-up";

const bodySchema = z.object({
  purpose: z.enum([
    "billing:manage",
    "project:delete",
    "project:invite:manage",
    "project:member:role",
    "api-key:create",
  ]),
  code: z.string().trim().length(6),
});

export async function POST(req: NextRequest) {
  try {
    const { purpose, code } = bodySchema.parse(await req.json());
    const result = await verifyStepUpChallenge(req.headers, purpose, code);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to verify code";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
