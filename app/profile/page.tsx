"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { TwoFactorToggle } from "@/components/TwoFactorToggle";
import axios from "axios";

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-black to-gray-900 text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-black to-gray-900 text-red-400">
        User not found or not logged in.
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-black to-gray-900 text-white px-2">
      <Card className="w-full max-w-xl rounded-3xl shadow-2xl border border-blue-900 bg-black/90 text-white backdrop-blur-lg p-6">
        <CardHeader className="flex flex-col items-center gap-2 pb-0">
          {user.image ? (
            <img
              src={user.image}
              alt="Profile"
              className="w-28 h-28 rounded-full border-4 border-blue-500 shadow-lg object-cover"
            />
          ) : (
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-700 to-blue-400 flex items-center justify-center text-4xl font-bold border-4 border-blue-500 shadow-lg">
              {user.username?.[0]?.toUpperCase() ||
                user.name?.[0]?.toUpperCase() ||
                user.email?.[0]?.toUpperCase() ||
                "U"}
            </div>
          )}
          <CardTitle className="text-3xl font-extrabold mt-2 text-blue-400">
            {user.username || user.name || "User"}
          </CardTitle>
          <div className="text-blue-300 text-sm">{user.email}</div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-blue-300 mb-2 ml-1">Username</Label>
              <Input
                value={user.username || user.name || "-"}
                readOnly
                className="bg-black/80 text-white border-blue-900"
              />
            </div>
            <div>
              <Label className="text-blue-300 mb-2 ml-1">Email</Label>
              <Input
                value={user.email || "-"}
                readOnly
                className="bg-black/80 text-white border-blue-900"
              />
            </div>
            <div>
              <Label className="text-blue-300 mb-2 ml-1">Phone Number</Label>
              <Input
                value={user.phonenumber || "-"}
                readOnly
                className="bg-black/80 text-white border-blue-900"
              />
            </div>
            <div>
              <Label className="text-blue-300 mb-2 ml-1">Email Verified</Label>
              <Input
                value={user.emailVerified ? "Yes" : "No"}
                readOnly
                className={`bg-black/80 text-white border-blue-900 ${
                  user.emailVerified
                    ? "ring-2 ring-green-400"
                    : "ring-2 ring-red-400"
                }`}
              />
            </div>
            <div>
              <Label className="text-blue-300 mb-2 ml-1">Provider</Label>
              <Input
                value={user.provider || user.authProvider || "email/password"}
                readOnly
                className="bg-black/80 text-white border-blue-900"
              />
            </div>
          </div>
          <TwoFactorToggle
            enabled={user.twoFactorEnabled}
            onChange={(val) => setUser({ ...user, twoFactorEnabled: val })}
          />
        </CardContent>
      </Card>
    </div>
  );
}
