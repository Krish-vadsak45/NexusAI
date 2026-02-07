import mongoose, { Schema, model, models } from "mongoose";

export interface ITemplateRating {
  templateId: mongoose.Types.ObjectId | string;
  userId: mongoose.Types.ObjectId | string;
  rating: number;
  comment?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const templateRatingSchema = new Schema<ITemplateRating>(
  {
    templateId: {
      type: Schema.Types.ObjectId,
      ref: "Template",
      required: true,
    },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String },
  },
  {
    timestamps: true,
  },
);

templateRatingSchema.index({ templateId: 1, userId: 1 }, { unique: true });

const TemplateRating =
  models?.TemplateRating ||
  model<ITemplateRating>("TemplateRating", templateRatingSchema);

export default TemplateRating;
