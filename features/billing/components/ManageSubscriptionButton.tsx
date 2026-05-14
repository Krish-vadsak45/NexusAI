"use client";

import { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { StepUpDialog } from "@/features/auth/components/StepUpDialog";
import { getErrorMessage } from "@/lib/error-utils";

export function ManageSubscriptionButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [stepUpOpen, setStepUpOpen] = useState(false);

  const handleManageSubscription = async (skipRetry = false) => {
    setIsLoading(true);
    try {
      const { data } = await axios.post("/api/stripe/portal");

      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error("Failed to create portal session");
      }
    } catch (error) {
      const message = getErrorMessage(error, "Something went wrong. Please try again.");
      if (!skipRetry && message.toLowerCase().includes("step-up verification required")) {
        setStepUpOpen(true);
      } else {
        toast.error(message);
      }
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <>
      <Button onClick={() => void handleManageSubscription()} disabled={isLoading}>
        {isLoading ? "Loading..." : "Manage Subscription"}
      </Button>
      <StepUpDialog
        open={stepUpOpen}
        purpose="billing:manage"
        onOpenChange={setStepUpOpen}
        onVerified={async () => {
          await handleManageSubscription(true);
        }}
      />
    </>
  );
}
