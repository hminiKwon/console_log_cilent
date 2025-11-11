"use client";

import Link from "next/link";
import { type ReactNode } from "react";
import { useSession } from "@/entities/session";
import { GlassPanel } from "@/shared/ui";

type ProtectedGateProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export function ProtectedGate({
  title,
  description,
  children,
}: ProtectedGateProps) {
  const { isAuthenticated, hasHydrated } = useSession();

  if (!hasHydrated) {
    return (
      <GlassPanel className="space-y-4 bg-white/5 text-white">
        <div className="h-5 w-32 rounded-full bg-white/10" />
        <div className="h-8 w-1/2 rounded-full bg-white/10" />
        <div className="h-20 rounded-2xl bg-white/5" />
      </GlassPanel>
    );
  }

  if (!isAuthenticated) {
    return (
      <GlassPanel className="bg-gradient-to-br from-slate-900/80 to-slate-900/40">
        <div className="space-y-4">
          <p className="text-sm uppercase tracking-[0.4em] text-white/60">
            로그인 필요
          </p>
          <h2 className="text-3xl font-semibold">{title}</h2>
          <p className="text-sm text-white/70">{description}</p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-2xl border border-white/40 px-4 py-2 text-sm font-medium text-white transition hover:border-white"
          >
            로그인하러 가기
            <span aria-hidden>→</span>
          </Link>
        </div>
      </GlassPanel>
    );
  }

  return <>{children}</>;
}
