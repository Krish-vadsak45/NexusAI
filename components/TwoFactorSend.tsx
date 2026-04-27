"use client";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/error-utils";

export default function TwoFactorSend() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  type SendOtpOptions = {
    trustDevice?: boolean;
    query?: Record<string, unknown>;
  };

  const handleSendOtp = async () => {
    setLoading(true);
    try {
      const { error } = await authClient.twoFactor.sendOtp({
        trustDevice: true, // optional
      } as SendOtpOptions);
      if (error) throw new Error(error.message);
      toast.success("OTP sent to your email.");
      router.push("/two-factor/verify");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to send OTP."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleSendOtp} disabled={loading} className="w-full">
      {loading ? "Sending..." : "Send 2FA Code"}
    </Button>
  );
}
