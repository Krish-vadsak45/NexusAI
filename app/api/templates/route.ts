import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import Template from "@/models/Template.model";
import User from "@/models/user.model";
import { headers } from "next/headers";
import redis from "@/lib/redisClient";

const TEMPLATES_CACHE_TTL = 3600; // 1 hour
const TEMPLATES_STALE_THRESHOLD = 300; // 5 minutes

function buildTemplateQuery(
  category: string | null,
  search: string | null,
  filter: string | null,
  session: any,
) {
  const query: any = {};

  if (category) {
    query.category = category;
  }

  if (search) {
    query[""] = { "": search };
  }

  // Filter logic
  if (filter === "mine" && session) {
    query.userId = session.user.id;
  } else if (filter === "public" || !session) {
    query.isPublic = true;
  } else {
    // Default: show public OR mine for authenticated users
    query[""] = [{ isPublic: true }, { userId: session.user.id }];
  }
  return query;
}

async function fetchAndCacheTemplates(
  query: any,
  limit: number,
  page: number,
  cacheKey: string,
) {
  try {
    await connectToDatabase();
    const [templates, total] = await Promise.all([
      Template.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate({ path: "userId", model: User, select: "name image" })
        .lean(),
      Template.countDocuments(query),
    ]);

    const result = {
      templates,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };

    const envelope = {
      data: result,
      cachedAt: Date.now(),
    };

    await redis.set(
      cacheKey,
      JSON.stringify(envelope),
      "EX",
      TEMPLATES_CACHE_TTL,
    );
    return result;
  } catch (e) {
    console.error("Critical error in fetchAndCacheTemplates", e);
    throw e;
  }
}

async function invalidateTemplatesCache() {
  try {
    const keys = await redis.keys("templates:cat:*");
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (e) {
    console.error("Failed to invalidate templates cache", e);
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      title,
      description,
      tags,
      isPublic,
      category,
      content,
      metadata,
      projectId,
    } = body;

    if (!title || !category || !content) {
      return NextResponse.json(
        { error: "Missing required fields: title, category, content" },
        { status: 400 },
      );
    }

    const newTemplate = new Template({
      userId: session.user.id,
      projectId: projectId || null,
      title,
      description,
      tags: tags || [],
      isPublic: isPublic || false,
      category,
      versions: [
        {
          version: 1,
          content,
          metadata,
          changelog: "Initial version",
          authorId: session.user.id,
          createdAt: new Date(),
        },
      ],
      currentVersion: 1,
    });

    await newTemplate.save();
    await invalidateTemplatesCache();

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
    const filter = searchParams.get("filter");
    const limit = Number.parseInt(searchParams.get("limit") || "20", 10);
    const page = Number.parseInt(searchParams.get("page") || "1", 10);

    const query = buildTemplateQuery(category, search, filter, session);
    const cacheKey =
      "templates:cat:" + (category || "all") + ":p:" + page + ":l:" + limit;
    const isCacheable = (filter === "public" || !filter) && !search;

    if (isCacheable) {
      const cached = await redis.get(cacheKey);
      if (cached) {
        const envelope = JSON.parse(cached);
        if (
          (Date.now() - envelope.cachedAt) / 1000 >
          TEMPLATES_STALE_THRESHOLD
        ) {
          fetchAndCacheTemplates(query, limit, page, cacheKey).catch(
            console.error,
          );
        }
        return NextResponse.json(envelope.data);
      }
    }

    const result = await fetchAndCacheTemplates(query, limit, page, cacheKey);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
