import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { createAuditLog } from "@/lib/security/audit";
import { assertRecentStepUp } from "@/lib/security/step-up";

type AuthApiKey = {
  id?: string;
  key?: string;
  value?: string;
  name?: string;
};

type AuthApiBridge = {
  listApiKeys: (input: { headers: Headers }) => Promise<AuthApiKey[]>;
  createApiKey: (input: {
    headers: Headers;
    body: Record<string, unknown>;
  }) => Promise<AuthApiKey>;
  deleteApiKey: (input: {
    headers: Headers;
    body: { keyId: string };
  }) => Promise<unknown>;
};

const createSchema = z.object({
  name: z.string().trim().min(3).max(32),
  expiresInDays: z.number().int().min(1).max(365).optional(),
});

const deleteSchema = z.object({
  keyId: z.string().min(1),
});

const authApi = auth.api as unknown as AuthApiBridge;

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await authApi.listApiKeys({
    headers: req.headers,
  });

  return NextResponse.json({ keys: result ?? [] });
}

export async function POST(req: NextRequest) {
  try {
    const session = await assertRecentStepUp(req.headers, "api-key:create");
    const { name, expiresInDays } = createSchema.parse(await req.json());

    const result = await authApi.createApiKey({
      headers: req.headers,
      body: {
        name,
        userId: session.user.id,
        expiresIn: expiresInDays ?? 30,
        metadata: {
          createdBy: session.user.id,
          createdAt: new Date().toISOString(),
        },
      },
    });

    await createAuditLog({
      action: "api_key.create",
      actor: session.user.id,
      targetType: "api_key",
      targetId: result?.id ? String(result.id) : undefined,
      data: {
        name,
        expiresInDays: expiresInDays ?? 30,
      },
    });

    return NextResponse.json({ key: result }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create API key";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { keyId } = deleteSchema.parse(await req.json());
    await authApi.deleteApiKey({
      headers: req.headers,
      body: {
        keyId,
      },
    });

    await createAuditLog({
      action: "api_key.delete",
      actor: session.user.id,
      targetType: "api_key",
      targetId: keyId,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete API key";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
