"use client";

import type { ComponentProps, ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type AuthFieldProps = {
  id: string;
  label: string;
  icon?: ReactNode;
  error?: string;
  helperText?: string;
  inputClassName?: string;
} & ComponentProps<typeof Input>;

export function AuthField({
  id,
  label,
  icon,
  error,
  helperText,
  className,
  inputClassName,
  ...props
}: AuthFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label
        htmlFor={id}
        className="text-[0.78rem] font-semibold uppercase tracking-[0.18em] text-slate-200"
      >
        {label}
      </Label>
      <div
        className={cn(
          "group relative rounded-2xl border bg-white/[0.03] transition-all",
          error
            ? "border-red-400/50 ring-4 ring-red-500/10"
            : "border-white/10 hover:border-white/18 focus-within:border-[#7dd3fc]/70 focus-within:ring-4 focus-within:ring-[#7dd3fc]/12",
        )}
      >
        {icon && (
          <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-[#7dd3fc]">
            {icon}
          </div>
        )}
        <Input
          id={id}
          className={cn(
            "h-14 rounded-2xl border-0 bg-transparent px-4 text-[15px] text-white shadow-none placeholder:text-slate-500 focus-visible:ring-0",
            icon ? "pl-12" : "",
            inputClassName,
          )}
          aria-invalid={!!error}
          {...props}
        />
      </div>
      {error ? (
        <p className="text-sm text-red-300">{error}</p>
      ) : helperText ? (
        <p className="text-sm text-slate-400">{helperText}</p>
      ) : null}
    </div>
  );
}
