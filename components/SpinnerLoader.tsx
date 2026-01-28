"use client";

interface AdvancedSpinnerLoaderProps {
  size?: "sm" | "md" | "lg";
  variant?:
    | "default"
    | "gradient"
    | "dots"
    | "pulse"
    | "orbit"
    | "wave"
    | "shimmer"
    | "neon";
  text?: string;
  subtext?: string;
  showProgress?: boolean;
  progress?: number;
}

const sizeClasses = {
  sm: "w-6 h-6",
  md: "w-10 h-10",
  lg: "w-16 h-16",
};

const textSizeClasses = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
};

export function SpinnerLoader({
  size = "md",
  variant = "gradient",
  text,
  subtext,
  showProgress = false,
  progress = 45,
}: AdvancedSpinnerLoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 text-white">
      {/* Neon Variant - Tech Monochrome (Robust) */}
      {variant === "neon" && (
        <div
          className={`relative ${sizeClasses[size]} flex items-center justify-center`}
          role="status"
          aria-label="Loading"
        >
          {/* Main Ring */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "9999px",
              background:
                "conic-gradient(from 0deg, transparent, rgba(255,255,255,0.4), #ffffff, rgba(255,255,255,0.4), transparent 50%)",
              padding: "2px",
              animation: "spin 1.2s linear infinite",
              mask: "radial-gradient(farthest-side, transparent calc(100% - 2px), #fff 0)",
              WebkitMask:
                "radial-gradient(farthest-side, transparent calc(100% - 2px), #fff 0)",
            }}
          />

          {/* Inner Glow */}
          <div
            className="absolute rounded-full"
            style={{
              width: "55%",
              height: "55%",
              background:
                "radial-gradient(circle, rgba(255,255,255,0.15), transparent)",
              animation: "pulse 2s ease-in-out infinite",
            }}
          />

          {/* Core */}
          <div
            className="relative rounded-full border border-white/20"
            style={{
              width: "36%",
              height: "36%",
              background: "#09090b",
              boxShadow: "inset 0 0 10px rgba(255,255,255,0.1)",
            }}
          >
            <div className="absolute inset-0 bg-white/5 rounded-full animate-pulse opacity-50" />
            <div
              className="absolute inset-[30%] bg-white rounded-full"
              style={{
                boxShadow: "0 0 15px white",
                animation: "pulse 1.5s ease-in-out infinite alternate",
              }}
            />
          </div>

          {/* New Segmented Speed Ring */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: "-15%",
              borderRadius: "50%",
              border: "1px solid transparent",
              borderLeftColor: "rgba(255,255,255, 0.3)",
              borderRightColor: "rgba(255,255,255, 0.3)",
              transform: "rotate(45deg)",
              animation:
                "spin 3s cubic-bezier(0.55, 0.055, 0.675, 0.19) infinite",
            }}
          />

          {/* Outer mechanical dashed ring */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: "-45%",
              borderRadius: "50%",
              border: "1px dashed rgba(255, 255, 255, 0.1)",
              animation: "spin 12s linear infinite reverse",
            }}
          />

          {/* Orbiting white dot */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: "-20%",
              animation: "spin 3s cubic-bezier(0.5, 0, 0.5, 1) infinite",
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: "50%",
                width: "3px",
                height: "3px",
                background: "#fff",
                borderRadius: "50%",
                boxShadow: "0 0 8px #fff",
                transform: "translate(-50%, -50%)",
              }}
            />
          </div>
        </div>
      )}

      {/* Text and progress */}
      {text && (
        <div className="flex flex-col items-center gap-2">
          <p
            className={`${textSizeClasses[size]} font-semibold leading-snug tracking-wide uppercase`}
            style={{
              background: "linear-gradient(90deg, #ffffff, #a1a1aa, #ffffff)",
              WebkitBackgroundClip: "text",
              color: "transparent",
              textAlign: "center",
              maxWidth: "280px",
              textShadow: "0 0 20px rgba(255,255,255,0.3)",
            }}
          >
            {text}
          </p>

          {showProgress && (
            <div
              className="mt-4 rounded-full relative overflow-hidden box-border border border-white/10"
              style={{
                width: size === "sm" ? 96 : size === "md" ? 160 : 224,
                height: 4,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(255,255,255,0.05)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: `${progress}%`,
                  background: "#fff",
                  boxShadow: "0 0 10px rgba(255,255,255,0.8)",
                  transition: "width 0.3s ease",
                }}
              />
            </div>
          )}

          {!showProgress && (
            <div
              className="mt-4 rounded-none relative overflow-hidden"
              style={{
                width: size === "sm" ? 96 : size === "md" ? 160 : 224,
                height: 2,
                background:
                  "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: "-40%",
                  top: 0,
                  bottom: 0,
                  width: "40%",
                  background:
                    "linear-gradient(90deg, transparent, #fff, transparent)",
                  boxShadow: "0 0 15px #fff",
                  animation:
                    "shimmer 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite",
                }}
              />
            </div>
          )}
        </div>
      )}

      <style jsx global>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes pulse {
          0%,
          100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(0.92);
            opacity: 0.85;
          }
        }
        @keyframes float {
          0% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-6%);
          }
          100% {
            transform: translateY(0);
          }
        }
        @keyframes dotPulse {
          0% {
            transform: translateY(0);
            opacity: 0.75;
          }
          50% {
            transform: translateY(-6px);
            opacity: 1;
          }
          100% {
            transform: translateY(0);
            opacity: 0.75;
          }
        }
        @keyframes shimmer {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(260%);
          }
        }
        @keyframes orbit {
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes orbitReverse {
          to {
            transform: rotate(-360deg);
          }
        }
        @keyframes expandRing {
          0% {
            opacity: 1;
            transform: scale(1);
          }
          100% {
            opacity: 0;
            transform: scale(2.5);
          }
        }
        @keyframes rotate360 {
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes wave {
          0%,
          100% {
            transform: scaleY(0.5);
          }
          50% {
            transform: scaleY(1);
          }
        }
        @keyframes shimmerFlow {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}
