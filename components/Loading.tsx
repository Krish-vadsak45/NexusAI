"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { SpinnerLoader } from "./SpinnerLoader";

export const Loading = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        return prev + Math.random() * 30;
      });
    }, 800);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505]">
      <Card className="bg-black/40 border border-white/5 shadow-[0_0_100px_rgba(255,255,255,0.03)] backdrop-blur-xl relative overflow-hidden">
        {/* Decorative Grid Background */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        <CardContent className="relative z-10 p-12 min-w-[380px]">
          {/* Complete Loading State */}
          <div className="flex flex-col items-center gap-8">
            <div className="relative">
              <div className="absolute inset-0 bg-white/5 blur-3xl rounded-full opacity-20" />
              <SpinnerLoader
                size="lg"
                variant="neon"
                text="Preparing your workspace..."
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
