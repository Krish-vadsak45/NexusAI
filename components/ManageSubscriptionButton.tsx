"use client";

import { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function ManageSubscriptionButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleManageSubscription = async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.post("/api/stripe/portal");

      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error("Failed to create portal session");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Button onClick={handleManageSubscription} disabled={isLoading}>
      {isLoading ? "Loading..." : "Manage Subscription"}
    </Button>
  );
}
