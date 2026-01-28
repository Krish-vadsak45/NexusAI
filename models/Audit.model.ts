import mongoose from "mongoose";

const AuditSchema = new mongoose.Schema(
  {
    action: { type: String, required: true },
    actor: { type: mongoose.Schema.Types.Mixed },
    targetType: { type: String },
    targetId: { type: mongoose.Schema.Types.Mixed, index: true },
    data: { type: Object },
  },
  { timestamps: true, versionKey: false },
);

const Audit = mongoose.models.Audit || mongoose.model("Audit", AuditSchema);
export default Audit;
