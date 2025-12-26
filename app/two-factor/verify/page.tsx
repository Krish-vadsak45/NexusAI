"use client";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function TwoFactorVerifyPage() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await authClient.twoFactor.verifyOtp({
        code,
        trustDevice: true, // optional
      });
      if (error) throw new Error(error.message);
      toast.success("2FA verified! You are now signed in.");
      router.push("/"); // or wherever you want to redirect
    } catch (err: any) {
      toast.error(err.message || "Invalid or expired code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white">
      <form
        onSubmit={handleVerify}
        className="w-full max-w-md rounded-2xl shadow-2xl border border-gray-800 bg-black/90 text-white backdrop-blur-lg p-8 space-y-6"
      >
        <h2 className="text-3xl font-extrabold text-center mb-2">
          Two-Factor Verification
        </h2>
        <p className="text-center text-gray-400 mb-4">
          Enter the 6-digit code sent to your email.
        </p>
        <Input
          type="text"
          placeholder="123456"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
          className="bg-black/80 text-white border-gray-700 placeholder-gray-400"
        />
        <Button
          type="submit"
          className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg shadow hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? "Verifying..." : "Verify"}
        </Button>
      </form>
    </div>
  );
}
