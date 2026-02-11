import connectToDatabase from "@/lib/db";
import Subscription from "@/models/Subscription.model";
import Usage from "@/models/Usage.model";
import User, { IUser } from "@/models/user.model";
import { PLANS } from "@/lib/plans";
import mongoose from "mongoose";

export type AdminMetrics = {
  totals: {
    users: number;
    activeSubscriptions: number;
    pastDueSubscriptions: number;
    cancelledSubscriptions: number;
    mrr: number;
    mrrDelta: number;
    churnRate: number;
    tokensUsed: number;
    activeUsers30d: number;
  };
  planBreakdown: Array<{ planId: string; count: number }>;
  pastDue: Array<{
    subscriptionId: string;
    userId: string;
    email?: string;
    name?: string;
    planId: string;
    currentPeriodEnd?: string;
  }>;
};

export type AdminUserRow = {
  id: string;
  email: string;
  name?: string;
  emailVerified: boolean;
  phonenumber?: string;
  isAdmin?: boolean;
  createdAt?: string;
  subscription?: {
    planId: string;
    status: string;
    currentPeriodEnd?: string;
  } | null;
  usage?: {
    tokensUsed: number;
    updatedAt?: string;
  } | null;
};

const PLAN_PRICE_LOOKUP: Record<string, number> = {
  [PLANS.FREE.id]: PLANS.FREE.price,
  [PLANS.PRO.id]: PLANS.PRO.price,
  [PLANS.PREMIUM.id]: PLANS.PREMIUM.price,
};

function safeNumber(value: number | undefined | null) {
  return Number.isFinite(value) ? (value as number) : 0;
}

function escapeRegex(input: string) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function getAdminMetrics(): Promise<AdminMetrics> {
  await connectToDatabase();
  const now = new Date();
  const periodStart = new Date(now);
  periodStart.setDate(periodStart.getDate() - 30);

  const [
    usersTotal,
    activeSubs,
    pastDueSubs,
    cancelledSubs,
    cancelledInPeriod,
    activeSubsByPlan,
    cancelledPaidInPeriod,
    createdPaidInPeriod,
    usageTotals,
    activeUsers30d,
    pastDueList,
  ] = await Promise.all([
    User.countDocuments(),
    Subscription.countDocuments({ status: "active" }),
    Subscription.countDocuments({ status: "past_due" }),
    Subscription.countDocuments({ status: "cancelled" }),
    Subscription.countDocuments({
      status: "cancelled",
      updatedAt: { $gte: periodStart },
    }),
    Subscription.aggregate([
      { $match: { status: "active" } },
      { $group: { _id: "$planId", count: { $sum: 1 } } },
    ]),
    Subscription.aggregate([
      {
        $match: {
          status: "cancelled",
          planId: { $ne: "free" },
          updatedAt: { $gte: periodStart },
        },
      },
      { $group: { _id: "$planId", count: { $sum: 1 } } },
    ]),
    Subscription.aggregate([
      {
        $match: {
          planId: { $ne: "free" },
          createdAt: { $gte: periodStart },
        },
      },
      { $group: { _id: "$planId", count: { $sum: 1 } } },
    ]),
    Usage.aggregate([
      { $group: { _id: null, tokensUsed: { $sum: "$tokensUsed" } } },
    ]),
    Usage.countDocuments({ updatedAt: { $gte: periodStart } }),
    Subscription.find({ status: "past_due" })
      .sort({ updatedAt: -1 })
      .limit(10)
      .populate({ path: "user", model: User, select: "email name" })
      .lean(),
  ]);

  const mrr = activeSubsByPlan.reduce((total: number, entry: any) => {
    return total + safeNumber(PLAN_PRICE_LOOKUP[entry._id]) * entry.count;
  }, 0);

  const newPaidMRR = createdPaidInPeriod.reduce((total: number, entry: any) => {
    return total + safeNumber(PLAN_PRICE_LOOKUP[entry._id]) * entry.count;
  }, 0);

  const cancelledPaidMRR = cancelledPaidInPeriod.reduce(
    (total: number, entry: any) => {
      return total + safeNumber(PLAN_PRICE_LOOKUP[entry._id]) * entry.count;
    },
    0,
  );

  const churnBase = Math.max(activeSubs + cancelledInPeriod, 1);
  const churnRate = cancelledInPeriod === 0 ? 0 : cancelledInPeriod / churnBase;

  const planBreakdown = activeSubsByPlan.map((entry: any) => ({
    planId: entry._id ?? "unknown",
    count: entry.count,
  }));

  const pastDue = (pastDueList as any[]).map((item) => ({
    subscriptionId: item._id?.toString(),
    userId: item.user?._id?.toString(),
    email: item.user?.email,
    name: item.user?.name,
    planId: item.planId ?? "free",
    currentPeriodEnd: item.currentPeriodEnd
      ? new Date(item.currentPeriodEnd).toISOString()
      : undefined,
  }));

  return {
    totals: {
      users: usersTotal,
      activeSubscriptions: activeSubs,
      pastDueSubscriptions: pastDueSubs,
      cancelledSubscriptions: cancelledSubs,
      mrr,
      mrrDelta: newPaidMRR - cancelledPaidMRR,
      churnRate,
      tokensUsed: usageTotals?.[0]?.tokensUsed ?? 0,
      activeUsers30d,
    },
    planBreakdown,
    pastDue,
  };
}

export async function getAdminUsers(options: {
  query?: string;
  page?: number;
  limit?: number;
}) {
  await connectToDatabase();
  const page = Math.max(1, Number(options.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(options.limit) || 20));
  const skip = (page - 1) * limit;

  const filter: Record<string, any> = {};
  if (options.query) {
    const escaped = escapeRegex(options.query.trim());
    if (escaped.length > 0) {
      filter.$or = [
        { email: { $regex: escaped, $options: "i" } },
        { name: { $regex: escaped, $options: "i" } },
        { phonenumber: { $regex: escaped, $options: "i" } },
      ];
    }
  }

  const [total, users] = await Promise.all([
    User.countDocuments(filter),
    User.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean<IUser[]>(),
  ]);

  const userIds = users
    .map((user) => user._id)
    .filter(Boolean)
    .map((id) => new mongoose.Types.ObjectId(id?.toString()));

  const [subscriptions, usage] = await Promise.all([
    Subscription.find({ user: { $in: userIds } }).lean(),
    Usage.find({ userId: { $in: userIds } }).lean(),
  ]);

  const subscriptionByUser = new Map(
    subscriptions.map((sub: any) => [sub.user?.toString(), sub]),
  );
  const usageByUser = new Map(
    usage.map((entry: any) => [entry.userId?.toString(), entry]),
  );

  const rows: AdminUserRow[] = users.map((user) => {
    const id = user._id?.toString() ?? "";
    const subscription = subscriptionByUser.get(id);
    const usageEntry = usageByUser.get(id);

    return {
      id,
      email: user.email,
      name: user.name,
      emailVerified: !!user.emailVerified,
      phonenumber: user.phonenumber,
      isAdmin: !!user.isAdmin,
      createdAt: user.createdAt
        ? new Date(user.createdAt).toISOString()
        : undefined,
      subscription: subscription
        ? {
            planId: subscription.planId ?? "free",
            status: subscription.status ?? "active",
            currentPeriodEnd: subscription.currentPeriodEnd
              ? new Date(subscription.currentPeriodEnd).toISOString()
              : undefined,
          }
        : null,
      usage: usageEntry
        ? {
            tokensUsed: usageEntry.tokensUsed ?? 0,
            updatedAt: usageEntry.updatedAt
              ? new Date(usageEntry.updatedAt).toISOString()
              : undefined,
          }
        : null,
    };
  });

  return {
    users: rows,
    page,
    limit,
    total,
  };
}
