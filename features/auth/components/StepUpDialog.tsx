"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getErrorMessage } from "@/lib/error-utils";

export type StepUpPurpose =
  | "billing:manage"
  | "project:delete"
  | "project:invite:manage"
  | "project:member:role"
  | "api-key:create";

const PURPOSE_LABELS: Record<StepUpPurpose, string> = {
  "billing:manage": "manage billing",
  "project:delete": "delete a project",
  "project:invite:manage": "manage project invites",
  "project:member:role": "change project roles",
  "api-key:create": "create an API key",
};

type StepUpDialogProps = {
  open: boolean;
  purpose: StepUpPurpose;
  onOpenChange: (open: boolean) => void;
  onVerified?: () => void | Promise<void>;
};

export function StepUpDialog({
  open,
  purpose,
  onOpenChange,
  onVerified,
}: StepUpDialogProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (!open) {
      setCode("");
      return;
    }

    const startChallenge = async () => {
      setSending(true);
      try {
        const { data } = await axios.post("/api/security/step-up/start", {
          purpose,
        });
        setEmail(data.email ?? "");
      } catch (error) {
        toast.error(getErrorMessage(error, "Failed to send verification code"));
        onOpenChange(false);
      } finally {
        setSending(false);
      }
    };

    void startChallenge();
  }, [open, onOpenChange, purpose]);

  const handleVerify = async () => {
    setLoading(true);
    try {
      await axios.post("/api/security/step-up/verify", {
        purpose,
        code,
      });
      toast.success("Verification complete.");
      onOpenChange(false);
      await onVerified?.();
    } catch (error) {
      toast.error(getErrorMessage(error, "Invalid verification code"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Extra Verification Required</DialogTitle>
          <DialogDescription>
            Enter the 6-digit code we sent to {email || "your email"} to{" "}
            {PURPOSE_LABELS[purpose]}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="step-up-code">Verification code</Label>
            <Input
              id="step-up-code"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="123456"
              maxLength={6}
            />
          </div>

          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading || sending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleVerify}
              disabled={loading || sending || code.trim().length !== 6}
            >
              {loading ? "Verifying..." : sending ? "Sending..." : "Verify"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
