"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "forget-password",
      });
      toast.success("Password reset code sent to your email.");
      router.push(`/reset-password?email=${encodeURIComponent(email)}`);
    } catch {
      toast.error("Failed to send reset code.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white">
      <Card className="w-full max-w-md rounded-2xl shadow-2xl border border-gray-800 bg-black/90 text-white backdrop-blur-lg">
        <CardHeader>
          <CardTitle className="text-3xl text-center">
            Forgot Password
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSendOtp} className="space-y-6">
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-black/80 text-white border-gray-700 placeholder-gray-400"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg shadow hover:bg-blue-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Sending..." : "Send Reset Code"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
