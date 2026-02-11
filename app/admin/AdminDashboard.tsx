"use client";

import { useCallback, useMemo, useState } from "react";
import type { FormEvent } from "react";
import type { AdminMetrics, AdminUserRow } from "@/lib/admin-queries";

type UserPayload = {
  users: AdminUserRow[];
  page: number;
  limit: number;
  total: number;
};

type AdminDashboardProps = {
  initialMetrics: AdminMetrics;
  initialUsers: UserPayload;
};

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("en-US");

function formatPercent(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

function formatDate(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString();
}

function formatStatus(value?: string) {
  if (!value) return "Unknown";
  if (value === "past_due") return "Past due";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default function AdminDashboard({
  initialMetrics,
  initialUsers,
}: AdminDashboardProps) {
  const [metrics, setMetrics] = useState<AdminMetrics>(initialMetrics);
  const [usersPayload, setUsersPayload] = useState<UserPayload>(initialUsers);
  const [query, setQuery] = useState("");
  const [metricsError, setMetricsError] = useState<string | null>(null);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [loadingMetrics, setLoadingMetrics] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(usersPayload.total / usersPayload.limit));
  }, [usersPayload.total, usersPayload.limit]);

  const rangeStart =
    usersPayload.total === 0
      ? 0
      : (usersPayload.page - 1) * usersPayload.limit + 1;
  const rangeEnd = Math.min(
    usersPayload.page * usersPayload.limit,
    usersPayload.total,
  );

  const tokensPerActiveUser = useMemo(() => {
    const activeUsers = Math.max(metrics.totals.activeUsers30d, 1);
    return Math.round(metrics.totals.tokensUsed / activeUsers);
  }, [metrics.totals.activeUsers30d, metrics.totals.tokensUsed]);

  const renewalCoverage = useMemo(() => {
    if (metrics.totals.activeSubscriptions === 0) return 1;
    const pastDue = metrics.totals.pastDueSubscriptions;
    return Math.max(
      0,
      1 - pastDue / Math.max(metrics.totals.activeSubscriptions, 1),
    );
  }, [metrics.totals.activeSubscriptions, metrics.totals.pastDueSubscriptions]);

  const planMixTotal = useMemo(() => {
    return metrics.planBreakdown.reduce((sum, plan) => sum + plan.count, 0);
  }, [metrics.planBreakdown]);

  const alertItems = useMemo(() => {
    const items: string[] = [];
    if (metrics.totals.pastDueSubscriptions > 0) {
      items.push(
        `${metrics.totals.pastDueSubscriptions} subscriptions require billing follow-up.`,
      );
    }
    if (metrics.totals.mrrDelta < 0) {
      items.push("MRR declined in the last 30 days.");
    }
    if (metrics.totals.churnRate > 0.05) {
      items.push("Churn rate is above 5% for the last 30 days.");
    }
    if (metrics.totals.activeUsers30d === 0) {
      items.push("No active users in the last 30 days.");
    }
    return items;
  }, [metrics.totals]);

  const loadMetrics = useCallback(async () => {
    try {
      setLoadingMetrics(true);
      setMetricsError(null);
      const response = await fetch("/api/admin/metrics", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        throw new Error("Failed to refresh metrics");
      }
      const data = (await response.json()) as AdminMetrics;
      setMetrics(data);
    } catch (error: any) {
      setMetricsError(error?.message || "Unable to refresh metrics");
    } finally {
      setLoadingMetrics(false);
    }
  }, []);

  const loadUsers = useCallback(
    async (nextPage: number, nextQuery?: string) => {
      try {
        setLoadingUsers(true);
        setUsersError(null);
        const params = new URLSearchParams({
          page: String(nextPage),
          limit: String(usersPayload.limit),
        });
        if (nextQuery) {
          params.set("q", nextQuery);
        }
        const response = await fetch(`/api/admin/users?${params.toString()}`);
        if (!response.ok) {
          throw new Error("Failed to load users");
        }
        const data = (await response.json()) as UserPayload;
        setUsersPayload(data);
      } catch (error: any) {
        setUsersError(error?.message || "Unable to load users");
      } finally {
        setLoadingUsers(false);
      }
    },
    [usersPayload.limit],
  );

  const handleSearch = async (event: FormEvent) => {
    event.preventDefault();
    await loadUsers(1, query.trim());
  };

  return (
    <main className="relative min-h-screen bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-neutral-900 via-neutral-950 to-neutral-950 text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-0 top-0 h-64 w-64 rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="absolute right-0 top-24 h-72 w-72 rounded-full bg-cyan-500/10 blur-[140px]" />
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))]" />
      </div>
      <section className="relative mx-auto max-w-6xl px-6 pb-20 pt-16">
        <div className="flex flex-col gap-4 rounded-3xl border border-neutral-800 bg-neutral-950/50 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.35em] text-neutral-400">
                Admin Intelligence Console
              </p>
              <h1 className="text-4xl font-semibold tracking-tight">
                Revenue, Risk, and Operator Signals
              </h1>
              <p className="max-w-2xl text-sm text-neutral-300">
                Track subscription health, usage pressure, and operational
                follow-ups. Surface the next action before it becomes urgent.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                className="rounded-full border border-neutral-700 px-4 py-2 text-xs uppercase tracking-widest text-neutral-200 transition hover:border-neutral-500"
                onClick={loadMetrics}
                disabled={loadingMetrics}
              >
                {loadingMetrics ? "Refreshing..." : "Refresh metrics"}
              </button>
              <div className="rounded-full border border-neutral-700 px-4 py-2 text-xs uppercase tracking-widest text-neutral-400">
                Data: Last 30d
              </div>
            </div>
          </div>
          {metricsError ? (
            <span className="text-xs text-rose-300">{metricsError}</span>
          ) : null}
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5">
            <p className="text-xs uppercase tracking-widest text-neutral-400">
              Monthly recurring
            </p>
            <p className="mt-3 text-3xl font-semibold">
              {currencyFormatter.format(metrics.totals.mrr)}
            </p>
            <p className="mt-1 text-xs text-neutral-400">
              Delta 30d: {currencyFormatter.format(metrics.totals.mrrDelta)}
            </p>
          </div>
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5">
            <p className="text-xs uppercase tracking-widest text-neutral-400">
              Active subs
            </p>
            <p className="mt-3 text-3xl font-semibold">
              {numberFormatter.format(metrics.totals.activeSubscriptions)}
            </p>
            <p className="mt-1 text-xs text-neutral-400">
              Past due:{" "}
              {numberFormatter.format(metrics.totals.pastDueSubscriptions)}
            </p>
          </div>
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5">
            <p className="text-xs uppercase tracking-widest text-neutral-400">
              Churn (30d)
            </p>
            <p className="mt-3 text-3xl font-semibold">
              {formatPercent(metrics.totals.churnRate)}
            </p>
            <p className="mt-1 text-xs text-neutral-400">
              Cancelled:{" "}
              {numberFormatter.format(metrics.totals.cancelledSubscriptions)}
            </p>
          </div>
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5">
            <p className="text-xs uppercase tracking-widest text-neutral-400">
              Tokens used
            </p>
            <p className="mt-3 text-3xl font-semibold">
              {numberFormatter.format(metrics.totals.tokensUsed)}
            </p>
            <p className="mt-1 text-xs text-neutral-400">
              Active 30d:{" "}
              {numberFormatter.format(metrics.totals.activeUsers30d)}
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-neutral-800 bg-neutral-950/60 p-5">
            <p className="text-xs uppercase tracking-widest text-neutral-400">
              Revenue health
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-neutral-800/70 bg-neutral-900/70 p-4">
                <p className="text-xs text-neutral-500">Renewal coverage</p>
                <p className="mt-2 text-2xl font-semibold">
                  {formatPercent(renewalCoverage)}
                </p>
                <p className="text-xs text-neutral-500">
                  Active subs staying current
                </p>
              </div>
              <div className="rounded-xl border border-neutral-800/70 bg-neutral-900/70 p-4">
                <p className="text-xs text-neutral-500">Tokens per user</p>
                <p className="mt-2 text-2xl font-semibold">
                  {numberFormatter.format(tokensPerActiveUser)}
                </p>
                <p className="text-xs text-neutral-500">Avg last 30d</p>
              </div>
              <div className="rounded-xl border border-neutral-800/70 bg-neutral-900/70 p-4">
                <p className="text-xs text-neutral-500">Total users</p>
                <p className="mt-2 text-2xl font-semibold">
                  {numberFormatter.format(metrics.totals.users)}
                </p>
                <p className="text-xs text-neutral-500">Lifetime signups</p>
              </div>
              <div className="rounded-xl border border-neutral-800/70 bg-neutral-900/70 p-4">
                <p className="text-xs text-neutral-500">Active risk</p>
                <p className="mt-2 text-2xl font-semibold">
                  {metrics.totals.pastDueSubscriptions === 0
                    ? "Stable"
                    : "Elevated"}
                </p>
                <p className="text-xs text-neutral-500">
                  Based on past due count
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-950/60 p-5">
            <p className="text-xs uppercase tracking-widest text-neutral-400">
              Operational alerts
            </p>
            <div className="mt-4 space-y-3 text-sm">
              {alertItems.length === 0 ? (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-emerald-200">
                  No urgent operational alerts.
                </div>
              ) : (
                alertItems.map((item, index) => (
                  <div
                    key={`${item}-${index}`}
                    className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-amber-100"
                  >
                    {item}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-widest text-neutral-400">
                Plan mix
              </p>
              <span className="text-xs text-neutral-500">Active only</span>
            </div>
            <div className="mt-4 space-y-3">
              {metrics.planBreakdown.length === 0 ? (
                <p className="text-sm text-neutral-400">
                  No active subscriptions.
                </p>
              ) : (
                metrics.planBreakdown.map((plan) => (
                  <div key={plan.planId} className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-300">
                        {plan.planId.toUpperCase()}
                      </span>
                      <span className="text-neutral-200">
                        {numberFormatter.format(plan.count)}
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-neutral-800">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-400/60 via-emerald-400/60 to-lime-400/60"
                        style={{
                          width: `${
                            planMixTotal === 0
                              ? 0
                              : Math.min(100, (plan.count / planMixTotal) * 100)
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5 lg:col-span-2">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-widest text-neutral-400">
                Past due subscriptions
              </p>
              <span className="text-xs text-neutral-500">Latest 10</span>
            </div>
            <div className="mt-4 space-y-3 text-sm">
              {metrics.pastDue.length === 0 ? (
                <p className="text-neutral-400">No past due subscriptions.</p>
              ) : (
                metrics.pastDue.map((item) => (
                  <div
                    key={item.subscriptionId}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-neutral-800/60 bg-neutral-950/40 px-3 py-2"
                  >
                    <div>
                      <p className="text-neutral-200">
                        {item.email ?? "Unknown user"}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {item.planId.toUpperCase()} · Renewal{" "}
                        {formatDate(item.currentPeriodEnd)}
                      </p>
                    </div>
                    <span className="text-xs text-amber-300">Past due</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <section className="mt-12 rounded-3xl border border-neutral-800 bg-neutral-950/60 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-neutral-400">
                User search
              </p>
              <h2 className="mt-2 text-2xl font-semibold">
                Manual user management
              </h2>
              <p className="mt-2 text-sm text-neutral-400">
                Inspect subscription status, verification state, and usage
                recency before taking action.
              </p>
            </div>
            <form
              className="flex w-full max-w-md items-center gap-2"
              onSubmit={handleSearch}
            >
              <input
                className="w-full rounded-full border border-neutral-700 bg-neutral-900/80 px-4 py-2 text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none"
                placeholder="Search by email, name, or phone"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
              <button
                type="submit"
                className="rounded-full border border-neutral-700 px-4 py-2 text-xs uppercase tracking-widest text-neutral-200 transition hover:border-neutral-500"
                disabled={loadingUsers}
              >
                {loadingUsers ? "Searching..." : "Search"}
              </button>
            </form>
          </div>

          {usersError ? (
            <p className="mt-4 text-sm text-rose-300">{usersError}</p>
          ) : null}

          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-widest text-neutral-500">
                <tr>
                  <th className="pb-3">User</th>
                  <th className="pb-3">Plan</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Verified</th>
                  <th className="pb-3">Tokens</th>
                  <th className="pb-3">Last seen</th>
                  <th className="pb-3">Renewal</th>
                  <th className="pb-3">Created</th>
                  <th className="pb-3">Admin</th>
                </tr>
              </thead>
              <tbody className="text-neutral-200">
                {usersPayload.users.length === 0 ? (
                  <tr>
                    <td className="py-4 text-neutral-400" colSpan={9}>
                      No users found for this query.
                    </td>
                  </tr>
                ) : (
                  usersPayload.users.map((user) => (
                    <tr key={user.id} className="border-t border-neutral-800">
                      <td className="py-4">
                        <p className="text-neutral-100">{user.email}</p>
                        <p className="text-xs text-neutral-500">
                          {user.name ?? "No name"}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {user.phonenumber ?? "No phone"}
                        </p>
                      </td>
                      <td className="py-4">
                        {user.subscription?.planId.toUpperCase() ?? "FREE"}
                      </td>
                      <td className="py-4">
                        {formatStatus(user.subscription?.status)}
                      </td>
                      <td className="py-4">
                        {user.emailVerified ? "Yes" : "No"}
                      </td>
                      <td className="py-4">
                        {numberFormatter.format(user.usage?.tokensUsed ?? 0)}
                      </td>
                      <td className="py-4">
                        {formatDate(user.usage?.updatedAt)}
                      </td>
                      <td className="py-4">
                        {formatDate(user.subscription?.currentPeriodEnd)}
                      </td>
                      <td className="py-4">{formatDate(user.createdAt)}</td>
                      <td className="py-4">{user.isAdmin ? "Yes" : "No"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-400">
            <span>
              Showing {rangeStart} - {rangeEnd} of{" "}
              {numberFormatter.format(usersPayload.total)}
            </span>
            <div className="flex items-center gap-2">
              <button
                className="rounded-full border border-neutral-700 px-3 py-1 disabled:opacity-40"
                onClick={() => loadUsers(usersPayload.page - 1, query.trim())}
                disabled={usersPayload.page <= 1 || loadingUsers}
              >
                Prev
              </button>
              <span>
                Page {usersPayload.page} of {totalPages}
              </span>
              <button
                className="rounded-full border border-neutral-700 px-3 py-1 disabled:opacity-40"
                onClick={() => loadUsers(usersPayload.page + 1, query.trim())}
                disabled={usersPayload.page >= totalPages || loadingUsers}
              >
                Next
              </button>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
