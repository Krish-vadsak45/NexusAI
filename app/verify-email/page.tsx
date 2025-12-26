"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [otp, setOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const { data, error: err } = await authClient.emailOtp.verifyEmail({
        email,
        otp,
      });
      if (err) {
        throw new Error(err.message);
      }
      toast.success("Email verified! You may now sign in.");
      router.push("/auth/signin");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      toast.error(err.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white">
      <div className="w-full max-w-md rounded-2xl shadow-2xl border border-gray-800 bg-black/90 text-white backdrop-blur-lg p-8">
        <h2 className="text-3xl font-extrabold text-center mb-6">
          Verify Your Email
        </h2>
        <p className="text-center text-gray-400 mb-4">
          Enter the 6-digit code sent to <strong>{email}</strong>
        </p>
        <form onSubmit={handleVerify} className="space-y-6">
          {error && (
            <div className="bg-red-600/90 text-white rounded px-3 py-2 text-sm border border-red-400 shadow">
              {error}
            </div>
          )}
          <div className="space-y-1">
            <Label htmlFor="otp" className="text-white font-semibold">
              Verification Code
            </Label>
            <Input
              id="otp"
              type="text"
              placeholder="123456"
              required
              className="bg-black/80 text-white border-gray-700 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg shadow hover:bg-blue-700 transition-all duration-150 cursor-pointer"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Verifying..." : "Verify Email"}
          </Button>
          <div className="text-center text-sm mt-4 text-gray-400">
            Didn’t receive a code?{" "}
            <button
              type="button"
              className="underline text-blue-400 hover:text-blue-600 cursor-pointer"
              onClick={async () => {
                try {
                  await authClient.emailOtp.sendVerificationOtp({
                    email,
                    type: "email-verification",
                  });
                  toast.success("Verification code sent again.");
                } catch {
                  toast.error("Failed to resend code");
                }
              }}
            >
              Resend code
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
