export type TemplateSession = {
  user: {
    id: string;
  };
} | null;

export function buildTemplateQuery(
  category: string | null,
  search: string | null,
  filter: string | null,
  session: TemplateSession,
) {
  const query: Record<string, unknown> = {};

  if (category) {
    query.category = category;
  }

  if (search) {
    query.$text = { $search: search };
  }

  if (filter === "mine" && session) {
    query.userId = session.user.id;
  } else if (filter === "public" || !session) {
    query.isPublic = true;
  } else {
    query.$or = [{ isPublic: true }, { userId: session.user.id }];
  }

  return query;
}

export function isTemplateQueryCacheable(search: string | null) {
  return !search;
}

export function buildTemplateCacheKey(params: {
  category: string | null;
  filter: string | null;
  limit: number;
  page: number;
  search: string | null;
  session: TemplateSession;
}) {
  const { category, filter, limit, page, search, session } = params;

  const normalizedFilter =
    filter || (session ? "mixed" : "public");
  const scope = session ? `user:${session.user.id}` : "guest";
  const categoryKey = category || "all";
  const searchKey = search ? `search:${encodeURIComponent(search)}` : "nosearch";

  return `templates:scope:${scope}:filter:${normalizedFilter}:cat:${categoryKey}:p:${page}:l:${limit}:${searchKey}`;
}
