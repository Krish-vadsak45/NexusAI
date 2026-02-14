"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Sparkles,
  Zap,
  LayoutDashboard,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { InlineLoader } from "@/components/InlineLoader";
import UsageOverview from "@/components/UsageOverview";

interface UsageItem {
  feature: string;
  used: number;
  limit: number;
  label: string;
}

interface UsageSummary {
  planName: string;
  usage: UsageItem[];
  tokens: {
    used: number;
    limit: number;
  };
}

export default function UsagePage() {
  const [data, setData] = useState<UsageSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const response = await axios.get("/api/profile/usage");
        console.log("Usage Data:", response.data);
        setData(response.data);
      } catch (err: any) {
        setError(err.response?.data?.error || "Failed to load usage data");
      } finally {
        setLoading(false);
      }
    };

    fetchUsage();

    // Poll for updates every 30 seconds for "real-time" feel
    const interval = setInterval(fetchUsage, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <InlineLoader className="h-8 w-8 text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <p className="text-xl font-semibold text-destructive">{error}</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="p-6 space-y-8">
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Usage Overview</h1>
        <UsageOverview />
      </div>
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Usage Quotas</h1>
        <p className="text-muted-foreground">
          Monitor your usage and plan limits in real-time.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Token Usage Card */}
        <Card className="md:col-span-3 border-primary/20 bg-primary/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle className="text-2xl font-bold flex items-center">
                <Sparkles className="mr-2 h-6 w-6 text-primary" />
                Monthly Token Usage
              </CardTitle>
              <CardDescription>
                Tokens reset on your monthly billing cycle.
              </CardDescription>
            </div>
            <div className="px-3 py-1 bg-primary text-primary-foreground rounded-full text-sm font-medium">
              {data.planName} Plan
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-muted-foreground">
                  {data.tokens.used.toLocaleString()} /{" "}
                  {data.tokens.limit.toLocaleString()} tokens used
                </span>
                <span className="font-bold">
                  {((data.tokens.used / data.tokens.limit) * 100).toFixed(2)}%
                </span>
              </div>
              <Progress
                value={(data.tokens.used / data.tokens.limit) * 100}
                className="h-3"
              />
              {data.tokens.used >= data.tokens.limit && (
                <p className="text-xs text-destructive flex items-center">
                  <AlertCircle className="mr-1 h-3 w-3" />
                  Monthly token limit reached. Please upgrade to continue.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Feature Specific Usage */}
        {data.usage.map((item) => (
          <Card key={item.feature} className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold flex items-center justify-between">
                <span>{item.label}</span>
                <Zap
                  className={cn(
                    "h-4 w-4",
                    item.used >= item.limit
                      ? "text-destructive"
                      : "text-amber-500",
                  )}
                />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-xs">
                  <span
                    className="text-muted-foreground
                    "
                  >
                    Daily Limit
                  </span>
                  <span className="font-medium">
                    {item.used} / {item.limit}
                  </span>
                </div>
                <Progress
                  value={(item.used / item.limit) * 100}
                  className={cn(
                    "h-2",
                    item.used >= item.limit ? "bg-destructive/20" : "",
                  )}
                  style={{
                    // @ts-ignore
                    "--progress-foreground":
                      item.used >= item.limit
                        ? "var(--destructive)"
                        : "var(--primary)",
                  }}
                />
                {item.used >= item.limit && (
                  <p className="text-[10px] text-destructive font-medium">
                    Daily quota reached
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ShieldCheck className="mr-2 h-5 w-5 text-emerald-500" />
            Fair Billing Enforcement
          </CardTitle>
          <CardDescription>
            Our real-time enforcement engine prevents overages and ensures fair
            resource distribution.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <ul className="list-disc pl-5 space-y-1">
            <li>Limits are reset daily at 00:00 UTC.</li>
            <li>Tokens are reset monthly on your subscription anniversary.</li>
            <li>
              If you reach a limit, your requests will be rejected until the
              next reset.
            </li>
            <li>
              Need more? Check out our higher tier plans in the billing section.
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
