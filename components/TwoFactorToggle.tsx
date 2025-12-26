import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function TwoFactorToggle({
  enabled,
  onChange,
}: {
  enabled: boolean;
  onChange: (val: boolean) => void;
}) {
  const [loading, setLoading] = useState(false);

  const [isPendingTwoFa, setIsPendingTwoFa] = useState<boolean>(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Show dialog to enter password before enabling/disabling 2FA
  const handleClick = () => {
    setPassword("");
    setError(null);
    setDialogOpen(true);
  };

  // const handleToggle = async () => {
  //   setLoading(true);
  //   // Enable/Disable 2FA function
  //   if (twoFaPassword.length < 8) {
  //     toast.error("Password must be at least 8 characters");
  //     return;
  //   }
  //   setIsPendingTwoFa(true);
  //   if (session?.user.twoFactorEnabled) {
  //     const res = await authClient.twoFactor.disable({
  //       //@ts-ignore
  //       password: twoFaPassword,
  //       fetchOptions: {
  //         onError(context) {
  //           toast.error(context.error.message);
  //         },
  //         onSuccess() {
  //           toast("2FA disabled successfully");
  //           setTwoFactorDialog(false);
  //         },
  //       },
  //     });
  //   } else {
  //     const res = await authClient.twoFactor.enable({
  //       password: twoFaPassword,
  //       fetchOptions: {
  //         onError(context) {
  //           toast.error(context.error.message);
  //         },
  //         onSuccess() {
  //           toast.success("2FA enabled successfully");
  //           setTwoFactorDialog(false);
  //         },
  //       },
  //     });
  //   }
  //   setIsPendingTwoFa(false);
  //   setTwoFaPassword("");
  // };

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);

    if (!password || password.length < 8) {
      setError("Password must be at least 8 characters.");
      setLoading(false);
      return;
    }

    try {
      if (enabled) {
        // Disable 2FA
        const res = await authClient.twoFactor.disable({
          password,
        });
        if (res.error) {
          setError(res.error.message || "Incorrect password.");
        } else {
          toast.success("2FA disabled successfully");
          onChange(false);
          setDialogOpen(false);
        }
      } else {
        // Enable 2FA
        const res = await authClient.twoFactor.enable({
          password,
        });
        if (res.error) {
          setError(res.error.message || "Incorrect password.");
        } else {
          toast.success("2FA enabled successfully");
          onChange(true);
          setDialogOpen(false);
        }
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={handleClick}
        disabled={loading}
        className={
          enabled
            ? "bg-green-600 text-white hover:bg-green-700 mt-4 cursor-pointer"
            : "bg-gray-700 text-white hover:bg-gray-800 mt-4 cursor-pointer"
        }
      >
        {enabled
          ? "Disable Two-Factor Authentication"
          : "Enable Two-Factor Authentication"}
      </Button>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {enabled
                ? "Disable Two-Factor Authentication"
                : "Enable Two-Factor Authentication"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-gray-300">
              Please enter your password to {enabled ? "disable" : "enable"}{" "}
              2FA.
            </p>
            <Input
              type="password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <Button
              onClick={handleConfirm}
              disabled={loading}
              className="w-full"
            >
              {loading
                ? "Processing..."
                : enabled
                ? "Disable 2FA"
                : "Enable 2FA"}
            </Button>
          </div>
          <div className="text-xs text-gray-400 mt-2">
            {`If you signed up with Google or another provider and don't have a password, `}
            <a href="/reset-password" className="underline text-blue-400">
              set a password first
            </a>
            {`.`}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
