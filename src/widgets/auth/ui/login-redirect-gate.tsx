"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/entities/session";
import { GlassPanel } from "@/shared/ui";

type LoginRedirectGateProps = {
  children: ReactNode;
  redirectTo?: string;
};

export function LoginRedirectGate({
  children,
  redirectTo = "/",
}: LoginRedirectGateProps) {
  const { isAuthenticated, hasHydrated } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (hasHydrated && isAuthenticated) {
      router.replace(redirectTo);
    }
  }, [hasHydrated, isAuthenticated, redirectTo, router]);

  if (!hasHydrated) {
    return (
      <GlassPanel className="space-y-4 bg-white text-slate-800">
        <div className="h-5 w-24 rounded-full bg-slate-100" />
        <div className="h-8 w-1/3 rounded-full bg-slate-100" />
        <div className="h-16 rounded-2xl bg-slate-50" />
      </GlassPanel>
    );
  }

  if (isAuthenticated) {
    return (
      <GlassPanel className="bg-gradient-to-br from-emerald-50 to-sky-50 text-slate-900">
        <p className="text-sm uppercase tracking-[0.4em] text-emerald-700">
          Already Signed In
        </p>
        <h2 className="text-2xl font-semibold">홈으로 이동 중입니다.</h2>
        <p className="text-sm text-slate-600">
          이미 로그인된 상태라 로그인 페이지에 접근할 수 없습니다.
        </p>
      </GlassPanel>
    );
  }

  return <>{children}</>;
}
