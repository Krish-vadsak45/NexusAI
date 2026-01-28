"use client";
import React from "react";
import { SpinnerLoader } from "./SpinnerLoader";

interface InlineLoaderProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  ariaLabel?: string;
}

export const InlineLoader: React.FC<InlineLoaderProps> = ({
  className = "",
  size,
  ariaLabel = "Loading",
}) => {
  let resolvedSize: "sm" | "md" | "lg" = "sm";
  if (size) resolvedSize = size;
  else if (
    className.includes("h-12") ||
    className.includes("h-16") ||
    className.includes("w-12")
  )
    resolvedSize = "lg";
  else if (className.includes("h-8") || className.includes("w-8"))
    resolvedSize = "md";

  return (
    <span
      className={`inline-flex items-center justify-center ${className}`}
      aria-label={ariaLabel}
      role="status"
    >
      <SpinnerLoader size={resolvedSize} variant="default" />
    </span>
  );
};
