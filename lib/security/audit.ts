import connectToDatabase from "@/lib/db";
import Audit from "@/models/Audit.model";

type AuditPayload = {
  action: string;
  actor: string;
  targetType?: string;
  targetId?: string;
  data?: Record<string, unknown>;
};

export async function createAuditLog(payload: AuditPayload) {
  await connectToDatabase();
  await Audit.create(payload);
}
