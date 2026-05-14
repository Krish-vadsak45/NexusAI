"use client";

import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthField } from "@/features/auth/components/AuthField";

type AuthPasswordFieldProps = {
  id: string;
  showPassword: boolean;
  togglePassword: () => void;
  error?: string;
  helperText?: string;
  autoComplete: string;
  placeholder?: string;
  inputProps?: Record<string, unknown>;
};

export function AuthPasswordField({
  id,
  showPassword,
  togglePassword,
  error,
  helperText,
  autoComplete,
  placeholder = "Enter your password",
  inputProps,
}: AuthPasswordFieldProps) {
  return (
    <div className="relative">
      <AuthField
        id={id}
        label="Password"
        type={showPassword ? "text" : "password"}
        icon={<LockKeyhole className="h-4 w-4" />}
        error={error}
        helperText={helperText}
        autoComplete={autoComplete}
        placeholder={placeholder}
        inputClassName="pr-20"
        {...(inputProps as Record<string, never>)}
      />
      <Button
        type="button"
        size="sm"
        variant="ghost"
        className="absolute right-2 top-[31px] h-10 rounded-xl px-3 text-slate-300 hover:bg-white/6 hover:text-white"
        onClick={togglePassword}
        aria-label={showPassword ? "Hide password" : "Show password"}
      >
        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </Button>
    </div>
  );
}
