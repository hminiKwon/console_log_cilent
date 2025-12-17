"use client";

import { type ReactNode, useEffect, useState } from "react";
import { SidebarNav } from "./sidebar-nav";

type SidebarShellProps = {
  children: ReactNode;
};

/**
 * 페이지 어디서든 사이드바를 유지하고 토글할 수 있는 레이아웃 컨테이너.
 * - 데스크톱: 사이드바 열림/닫힘 시 폭이 부드럽게 변하면서 콘텐츠 영역 확장
 * - 모바일: 오프캔버스 드로어 형태로 동작
 */
export function SidebarShell({ children }: SidebarShellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    const sync = () => {
      setIsDesktop(mediaQuery.matches);
      setIsOpen(mediaQuery.matches);
    };
    sync();
    mediaQuery.addEventListener("change", sync);
    return () => mediaQuery.removeEventListener("change", sync);
  }, []);

  const toggleSidebar = () => setIsOpen((prev) => !prev);

  const handleNavigate = () => {
    if (!isDesktop) setIsOpen(false);
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-sky-50 via-white to-emerald-50 text-slate-900">
      <button
        type="button"
        onClick={toggleSidebar}
        className="fixed left-4 top-4 z-50 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/90 px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-slate-700 shadow-sm backdrop-blur transition hover:border-emerald-300 hover:bg-white lg:left-8"
      >
        {isOpen ? "Close" : "Menu"}
        <span className="text-lg">{isOpen ? "⟲" : "☰"}</span>
      </button>

      {/* 모바일 드로어 */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-full max-w-xs border-r border-slate-200 bg-white/95 p-6 backdrop-blur-2xl transition-transform duration-500 lg:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarNav onNavigate={handleNavigate} />
      </div>

      <div
        className={`mx-auto flex w-full flex-col px-6 py-12 lg:flex-row ${
          isOpen ? "gap-6 lg:gap-8" : ""
        }`}
      >
        <div
          className={`hidden lg:block lg:transition-[width] lg:duration-500 ${
            isOpen ? "lg:w-80" : "lg:w-0"
          }`}
        >
          <div
            className={`sticky top-0 transition-all duration-500 ${
              isOpen
                ? "pointer-events-auto opacity-100"
                : "pointer-events-none opacity-0"
            }`}
          >
            <SidebarNav onNavigate={handleNavigate} />
          </div>
        </div>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
