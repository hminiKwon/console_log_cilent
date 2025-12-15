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
      <GlassPanel className="space-y-4 bg-white text-slate-800">
        <div className="h-5 w-32 rounded-full bg-slate-100" />
        <div className="h-8 w-1/2 rounded-full bg-slate-100" />
        <div className="h-16 rounded-2xl bg-slate-50" />
      </GlassPanel>
    );
  }

  if (!isAuthenticated) {
    return (
      <GlassPanel className="bg-gradient-to-br from-emerald-50 to-sky-50">
        <div className="space-y-4">
          <p className="text-sm uppercase tracking-[0.4em] text-emerald-700">
            로그인 필요
          </p>
          <h2 className="text-3xl font-semibold">{title}</h2>
          <p className="text-sm text-slate-600">{description}</p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-800 transition hover:border-emerald-300 hover:bg-emerald-100"
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
