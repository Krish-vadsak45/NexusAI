import { ReactNode } from "react";

interface InfiniteScrollTextProps {
  children: ReactNode;
  speed?: number;
  className?: string;
}

export default function InfiniteScrollText({
  children,
  speed = 30,
  className = "",
}: InfiniteScrollTextProps) {
  return (
    <div
      className={`relative overflow-hidden bg-white/85 ${className}`}
      style={{
        maskImage:
          "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
        WebkitMaskImage:
          "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
      }}
    >
      <div
        className="flex whitespace-nowrap animate-scroll items-center"
        style={{
          animation: `scroll ${speed}s linear infinite`,
        }}
      >
        <div className="flex items-center gap-16 px-8 shrink-0">{children}</div>
        <div className="flex items-center gap-16 px-8 shrink-0">{children}</div>
        <div className="flex items-center gap-16 px-8 shrink-0">{children}</div>
      </div>
      <style>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }
      `}</style>
    </div>
  );
}
