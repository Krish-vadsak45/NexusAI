import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import Template from "@/models/Template.model";
import TemplateRating from "@/models/TemplateRating.model";
import { headers } from "next/headers";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectToDatabase();
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { rating, comment } = body;

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Invalid rating (1-5)" },
        { status: 400 },
      );
    }

    const template = await Template.findById(id);
    if (!template) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 },
      );
    }

    // Upsert rating
    const existingRating = await TemplateRating.findOne({
      templateId: id,
      userId: session.user.id,
    });

    if (existingRating) {
      // Update
      existingRating.rating = rating;
      existingRating.comment = comment;
      await existingRating.save();
    } else {
      // Create
      await TemplateRating.create({
        templateId: id,
        userId: session.user.id,
        rating,
        comment,
      });
    }

    // Recalculate average
    const result = await TemplateRating.aggregate([
      { $match: { templateId: template._id } },
      {
        $group: {
          _id: "$templateId",
          sum: { $sum: "$rating" },
          count: { $sum: 1 },
        },
      },
    ]);

    if (result.length > 0) {
      template.ratingSum = result[0].sum;
      template.ratingCount = result[0].count;
      await template.save();
    }

    return NextResponse.json({ message: "Rating submitted" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
