import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import Template from "@/models/Template.model";
import User from "@/models/user.model";
import Project from "@/models/Project.model";
import { headers } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, tags, isPublic, category, content, metadata } =
      body;

    if (!title || !category || !content) {
      return NextResponse.json(
        { error: "Missing required fields: title, category, content" },
        { status: 400 },
      );
    }

    const version = {
      version: 1,
      content,
      metadata,
      changelog: "Initial version",
      authorId: session.user.id,
      createdAt: new Date(),
    };

    const newTemplate = new Template({
      userId: session.user.id,
      projectId: body.projectId || null, // Optional
      title,
      description,
      tags: tags || [],
      isPublic: isPublic || false,
      category,
      versions: [version],
      currentVersion: 1,
    });

    await newTemplate.save();

    return NextResponse.json(newTemplate, { status: 201 });
  } catch (error: any) {
    console.error("Error creating template:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const session = await auth.api.getSession({ headers: await headers() });

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const filter = searchParams.get("filter"); // 'mine', 'public', 'all'
    const limit = parseInt(searchParams.get("limit") || "20");
    const page = parseInt(searchParams.get("page") || "1");

    const query: any = {};

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$text = { $search: search };
    }

    // Filter logic
    if (filter === "mine" && session) {
      query.userId = session.user.id;
    } else if (filter === "public") {
      query.isPublic = true;
    } else {
      // Default: show public OR mine
      if (session) {
        query.$or = [{ isPublic: true }, { userId: session.user.id }];
      } else {
        query.isPublic = true;
      }
    }

    const templates = await Template.find(query)
      .sort({ createdAt: -1 }) // Sort by newest
      .skip((page - 1) * limit)
      .limit(limit)
      .populate({ path: "userId", model: User, select: "name image" }) // Get author details
      .lean();

    const total = await Template.countDocuments(query);

    return NextResponse.json({
      templates,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Error fetching templates:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
