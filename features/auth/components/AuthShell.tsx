"use client";

import type { ReactNode } from "react";
import { CheckCircle2, LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";

type AuthShellProps = {
  badge: string;
  title: string;
  description: string;
  children: ReactNode;
  bottomLink: ReactNode;
  mode: "signin" | "signup";
};

const trustItems = [
  {
    icon: ShieldCheck,
    title: "Protected access",
    description: "Email verification, optional 2FA, and secure session flows are already built in.",
  },
  {
    icon: Sparkles,
    title: "Work faster",
    description: "Jump into your AI workspace, saved projects, templates, and generation history.",
  },
  {
    icon: LockKeyhole,
    title: "Built for teams",
    description: "Collaboration, billing, usage controls, and project permissions stay under one roof.",
  },
];

export function AuthShell({
  badge,
  title,
  description,
  children,
  bottomLink,
  mode,
}: AuthShellProps) {
  const eyebrow =
    mode === "signin" ? "Welcome back to NexusAI" : "Create your NexusAI workspace";

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#07111f] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(81,204,255,0.18),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(255,176,76,0.16),_transparent_28%),linear-gradient(180deg,_rgba(7,17,31,0.92),_rgba(5,11,22,1))]" />
      <div className="hero-noise-overlay absolute inset-0 opacity-40" />
      <div className="absolute -left-24 top-28 h-64 w-64 rounded-full bg-[#4cc9f0]/10 blur-3xl" />
      <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-[#f6ad55]/10 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen max-w-6xl items-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid w-full gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <section className="order-2 lg:order-1">
            <Link
              href="/"
              className="mb-8 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/90 backdrop-blur-md transition hover:border-[#7dd3fc]/40 hover:bg-white/8"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#7dd3fc] text-[13px] font-black tracking-[0.18em] text-[#07111f]">
                N
              </span>
              NexusAI
            </Link>

            <div className="max-w-xl space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#7dd3fc]/25 bg-[#7dd3fc]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-[#bcecff]">
                <Sparkles className="h-3.5 w-3.5" />
                {eyebrow}
              </div>

              <h1 className="text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">
                Turn ideas into polished AI work, without losing control.
              </h1>

              <p className="max-w-lg text-base leading-7 text-slate-300 sm:text-lg">
                A calm workspace for writing, visual generation, collaboration, and repeatable production workflows.
              </p>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {trustItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="rounded-3xl border border-white/10 bg-white/[0.045] p-4 shadow-[0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl"
                  >
                    <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#7dd3fc]/14 text-[#7dd3fc]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="mb-1 text-sm font-semibold text-white">{item.title}</div>
                    <p className="text-sm leading-6 text-slate-300">{item.description}</p>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 flex items-center gap-3 text-sm text-slate-300">
              <CheckCircle2 className="h-4 w-4 text-[#f6ad55]" />
              Designed for individual creators and growing teams.
            </div>
          </section>

          <section className="order-1 lg:order-2">
            <div className="mx-auto w-full max-w-xl rounded-[30px] border border-white/12 bg-[linear-gradient(180deg,rgba(12,24,42,0.96),rgba(8,15,29,0.98))] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.48)] backdrop-blur-2xl sm:p-7">
              <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-6 sm:p-8">
                <div className="mb-8 space-y-3">
                  <div className="inline-flex rounded-full border border-[#f6ad55]/25 bg-[#f6ad55]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-[#ffd7a1]">
                    {badge}
                  </div>
                  <div>
                    <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-[2rem]">
                      {title}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-slate-300">{description}</p>
                  </div>
                </div>

                {children}

                <div className="mt-8 border-t border-white/8 pt-6 text-center text-sm text-slate-300">
                  {bottomLink}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
