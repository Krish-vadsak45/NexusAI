"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  Loader2,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Zap,
} from "lucide-react";
import axios from "axios";

interface UsageData {
  date: string;
  totalTokens: number;
  totalAttempts: number;
  totalSuccess: number;
  totalFail: number;
  tools: Record<string, any>;
}

interface Summary {
  totalTokens: number;
  totalAttempts: number;
  totalSuccess: number;
  totalFail: number;
}

export default function UsageOverview() {
  const [data, setData] = useState<UsageData[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUsage() {
      try {
        const { data: json } = await axios.get("/api/profile/usage-overview");
        if (json.overview) {
          // Fill in all days of the month so the chart is always full/properly visible
          const now = new Date();
          const year = now.getUTCFullYear();
          const month = now.getUTCMonth();
          const daysInMonth = new Date(year, month + 1, 0).getDate();

          const fullMonthData: UsageData[] = [];
          for (let i = 1; i <= daysInMonth; i++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
            const existingDay = json.overview.find(
              (d: any) => d.date === dateStr,
            );

            if (existingDay) {
              fullMonthData.push(existingDay);
            } else {
              fullMonthData.push({
                date: dateStr,
                totalTokens: 0,
                totalAttempts: 0,
                totalSuccess: 0,
                totalFail: 0,
                tools: {},
              });
            }
          }

          setData(fullMonthData);
          setSummary(json.summary);
        }
      } catch (error) {
        console.error("Failed to fetch usage overview", error);
      } finally {
        setLoading(false);
      }
    }
    fetchUsage();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">
          Loading your usage stats...
        </p>
      </div>
    );
  }

  const maxTokens = Math.max(...data.map((d) => d.totalTokens), 1);
  const maxAttempts = Math.max(...data.map((d) => d.totalAttempts), 1);

  // Debug max values
  console.log("CHART DEBUG:", {
    maxTokens,
    maxAttempts,
    dataLength: data.length,
  });

  const todayStr = new Date().toISOString().split("T")[0];
  const todayUsage = data.find((d) => d.date === todayStr);

  return (
    <div className="space-y-6">
      {data.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No usage data yet</h3>
            <p className="text-muted-foreground">
              Start using our AI tools to see your usage statistics here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Tokens
                </CardTitle>
                <Zap className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {summary?.totalTokens.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">Used this month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Success Rate
                </CardTitle>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {summary && summary.totalAttempts > 0
                    ? Math.round(
                        (summary.totalSuccess / summary.totalAttempts) * 100,
                      )
                    : 0}
                  %
                </div>
                <p className="text-xs text-muted-foreground">
                  {summary?.totalSuccess} of {summary?.totalAttempts} attempts
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Failed Tasks
                </CardTitle>
                <AlertCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary?.totalFail}</div>
                <p className="text-xs text-muted-foreground">
                  Errors encountered
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Tools Active
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {todayUsage ? Object.keys(todayUsage.tools).length : 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Features used today
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Daily Token Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Daily Token Consumption</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full flex items-end gap-1 pt-6 px-2">
                {data.map((day, i) => (
                  <div
                    key={day.date}
                    className="group relative flex-1 h-full flex flex-col justify-end items-center"
                  >
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 hidden group-hover:block z-50">
                      <div className="bg-popover text-popover-foreground text-xs p-2 rounded shadow-xl border-2 min-w-[140px]">
                        <p className="font-bold border-b mb-1 pb-1">
                          {day.date}
                        </p>
                        <p className="flex justify-between">
                          <span>Tokens:</span>
                          <span className="font-bold text-blue-500">
                            {day.totalTokens.toLocaleString()}
                          </span>
                        </p>
                        <div className="mt-1 pt-1 border-t opacity-90">
                          {Object.entries(day.tools).map(
                            ([tool, stats]: any) => (
                              <p
                                key={tool}
                                className="flex justify-between text-[10px]"
                              >
                                <span className="capitalize">
                                  {tool.replace(/_/g, " ")}:
                                </span>
                                <span>{stats.tokens.toLocaleString()}</span>
                              </p>
                            ),
                          )}
                        </div>
                      </div>
                    </div>
                    {/* Bar */}
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{
                        height: `${Math.max((day.totalTokens / maxTokens) * 100, 2)}%`,
                      }}
                      className="w-full max-w-[32px] bg-blue-500/40 hover:bg-blue-500 transition-all rounded-t-sm shadow-[0_-2px_10px_rgba(59,130,246,0.2)] border-x border-t border-blue-500/20"
                    />
                    <span className="text-[9px] text-muted-foreground mt-2 rotate-45 origin-left truncate w-4">
                      {day.date.split("-")[2]}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Success vs Fail Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Daily Success vs Failures</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48 w-full flex items-end gap-1 pt-6 px-2">
                {data.map((day) => (
                  <div
                    key={day.date}
                    className="group relative flex-1 h-full flex flex-col justify-end items-center gap-0.5"
                  >
                    <div className="absolute bottom-full mb-2 hidden group-hover:block z-50">
                      <div className="bg-popover text-popover-foreground text-xs p-2 rounded shadow-xl border-2 min-w-[120px]">
                        <p className="font-bold mb-1 border-b pb-1">
                          {day.date}
                        </p>
                        <p className="text-emerald-500 flex justify-between gap-4">
                          <span>Success:</span>
                          <span className="font-bold">{day.totalSuccess}</span>
                        </p>
                        <p className="text-rose-500 flex justify-between gap-4">
                          <span>Fail:</span>
                          <span className="font-bold">{day.totalFail}</span>
                        </p>
                      </div>
                    </div>
                    {/* Fail Bar (Red) */}
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{
                        height: `${(day.totalFail / maxAttempts) * 100}%`,
                      }}
                      className="w-full max-w-[32px] bg-rose-500/50 hover:bg-rose-500 transition-colors rounded-t-sm"
                    />
                    {/* Success Bar (Green) */}
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{
                        height: `${(day.totalSuccess / maxAttempts) * 100}%`,
                      }}
                      className="w-full max-w-[32px] bg-emerald-500/50 hover:bg-emerald-500 transition-colors rounded-t-sm"
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-center gap-8 mt-6 text-sm font-medium">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-emerald-500/60 rounded-sm border border-emerald-600" />
                  <span>Successful Tasks</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-rose-500/60 rounded-sm border border-rose-600" />
                  <span>Failed Tasks</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
