import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { STEP_UP_LABELS, startStepUpChallenge } from "@/lib/security/step-up";
import type { StepUpPurpose } from "@/models/StepUpChallenge.model";

const bodySchema = z.object({
  purpose: z.enum([
    "billing:manage",
    "project:delete",
    "project:invite:manage",
    "project:member:role",
    "api-key:create",
  ]),
});

export async function POST(req: NextRequest) {
  try {
    const { purpose } = bodySchema.parse(await req.json());
    const result = await startStepUpChallenge(req.headers, purpose);

    return NextResponse.json({
      ok: true,
      purpose,
      label: STEP_UP_LABELS[purpose as StepUpPurpose],
      ...result,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to start verification";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
