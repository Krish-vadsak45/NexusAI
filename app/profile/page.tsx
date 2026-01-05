"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { TwoFactorToggle } from "@/components/TwoFactorToggle";
import axios from "axios";
import { ManageSubscriptionButton } from "@/components/ManageSubscriptionButton";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Mail,
  Phone,
  Shield,
  CreditCard,
  Calendar,
  CheckCircle2,
  XCircle,
} from "lucide-react";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      setLoading(true);
      try {
        const res = await axios.get("/api/profile");
        const data = res.data;
        console.log("Profile API session user:", data);
        setUser(data.user ?? data);
      } catch (err: any) {
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to load user info";
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-destructive">
        User not found or not logged in.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 lg:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-center gap-6 p-6 rounded-2xl bg-card border shadow-sm">
          <div className="relative">
            {user.image ? (
              <img
                src={user.image}
                alt="Profile"
                className="w-24 h-24 rounded-full border-4 border-background shadow-md object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-3xl font-bold text-primary border-4 border-background shadow-md">
                {user.username?.[0]?.toUpperCase() ||
                  user.name?.[0]?.toUpperCase() ||
                  user.email?.[0]?.toUpperCase() ||
                  "U"}
              </div>
            )}
            <div className="absolute bottom-0 right-0">
              {user.emailVerified ? (
                <div className="bg-green-500 text-white p-1 rounded-full border-2 border-background">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              ) : (
                <div className="bg-yellow-500 text-white p-1 rounded-full border-2 border-background">
                  <XCircle className="w-4 h-4" />
                </div>
              )}
            </div>
          </div>
          <div className="text-center md:text-left space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">
              {user.username || user.name || "User"}
            </h1>
            <p className="text-muted-foreground flex items-center justify-center md:justify-start gap-2">
              <Mail className="w-4 h-4" /> {user.email}
            </p>
            <div className="flex items-center justify-center md:justify-start gap-2 pt-2">
              <Badge variant="secondary" className="capitalize">
                {user.role || "User"}
              </Badge>
              <Badge variant="outline" className="capitalize">
                {user.provider || user.authProvider || "email"}
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Personal Information */}
          <Card className="md:col-span-2 lg:col-span-2 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Personal Information
              </CardTitle>
              <CardDescription>
                Your personal details and contact information.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="userId">User ID</Label>
                  <Input
                    id="userId"
                    value={user.id || "-"}
                    readOnly
                    className="bg-muted/50 font-mono text-xs"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="username"
                      value={user.username || user.name || "-"}
                      readOnly
                      className="pl-9 bg-muted/50"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      value={user.email || "-"}
                      readOnly
                      className="pl-9 bg-muted/50"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      value={user.phonenumber || "-"}
                      readOnly
                      className="pl-9 bg-muted/50"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Right Column Stack */}
          <div className="space-y-6">
            {/* Subscription Card */}
            <Card className="shadow-sm border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" />
                  Subscription
                </CardTitle>
                <CardDescription>Manage your billing and plan.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/10 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-muted-foreground">
                      Current Plan
                    </span>
                    <Badge
                      variant={
                        user.subscription?.planId === "free"
                          ? "secondary"
                          : "default"
                      }
                      className="uppercase font-bold"
                    >
                      {user.subscription?.planId || "FREE"}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-muted-foreground">
                      Status
                    </span>
                    <span
                      className={`text-sm font-bold capitalize ${
                        user.subscription?.status === "active"
                          ? "text-green-600 dark:text-green-400"
                          : "text-muted-foreground"
                      }`}
                    >
                      {user.subscription?.status || "Active"}
                    </span>
                  </div>
                  {user.subscription?.currentPeriodEnd && (
                    <div className="flex justify-between items-center pt-2 border-t border-primary/10">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Renews
                      </span>
                      <span className="text-xs font-medium">
                        {new Date(
                          user.subscription.currentPeriodEnd
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
                <ManageSubscriptionButton />
              </CardContent>
            </Card>

            {/* Security Card */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Security
                </CardTitle>
                <CardDescription>
                  Protect your account with 2FA.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TwoFactorToggle
                  enabled={user.twoFactorEnabled}
                  onChange={(val) =>
                    setUser({ ...user, twoFactorEnabled: val })
                  }
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
