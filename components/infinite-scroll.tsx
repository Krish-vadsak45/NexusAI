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
      className={`relative overflow-hidden border-y border-white/5 bg-white/5 py-4 backdrop-blur-md ${className}`}
      style={{
        maskImage:
          "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
        WebkitMaskImage:
          "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
      }}
    >
      <div className="flex flex-wrap items-center justify-center gap-3 px-2 md:hidden">
        {children}
      </div>
      <div
        className="hidden items-center whitespace-nowrap md:flex"
        style={{
          animation: `scroll ${speed}s linear infinite`,
        }}
      >
        <div className="flex shrink-0 items-center gap-16 px-8">{children}</div>
        <div className="flex shrink-0 items-center gap-16 px-8">{children}</div>
        <div className="flex shrink-0 items-center gap-16 px-8">{children}</div>
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
