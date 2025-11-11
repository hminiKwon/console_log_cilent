"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { NAV_SECTIONS, SOCIAL_LINKS } from "@/entities/navigation";
import { useSession } from "@/entities/session";
import { logout } from "@/features/auth";

export function SidebarNav() {
  const pathname = usePathname();
  const { isAuthenticated, hasHydrated } = useSession();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<
    Record<string, boolean>
  >({});
  const navSections = NAV_SECTIONS.map((section) => {
    const items = section.items.filter((item) => {
      if (!hasHydrated && item.requiresAuth) return false;
      if (item.requiresAuth && !isAuthenticated) return false;
      if (item.hideWhenAuth && isAuthenticated) return false;
      return true;
    });
    return { ...section, items };
  });

  const toggleSection = (title: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [title]: !(prev[title] ?? false),
    }));
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    setIsLoggingOut(false);
  };

  return (
    <aside className="flex max-h-[calc(100vh-4rem)] w-full flex-col overflow-hidden rounded-4xl border border-white/10 bg-white/5 p-8 text-white backdrop-blur-2xl lg:w-80">
      <div className="space-y-4">
        <p className="text-sm uppercase tracking-[0.3em] text-white/60">
          Console Log
        </p>
        {!hasHydrated ? (
          <div className="h-11 w-full rounded-2xl border border-white/10 bg-white/5" />
        ) : !isAuthenticated ? (
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-2xl border border-white/30 px-4 py-2 text-sm font-medium text-white transition hover:border-white"
          >
            로그인 페이지
            <span aria-hidden>→</span>
          </Link>
        ) : (
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/30 px-4 py-2 text-sm font-medium text-white transition hover:border-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoggingOut ? "로그아웃 중..." : "로그아웃"}
          </button>
        )}
      </div>
      <div className="mt-8 flex-1 space-y-6 overflow-y-auto pr-1">
        {navSections.map((section) => {
          if (section.items.length === 0) {
            return null;
          }
          const isCollapsed = collapsedSections[section.title] ?? false;

          return (
            <div key={section.title} className="space-y-2">
              <button
                type="button"
                onClick={() => toggleSection(section.title)}
                className="flex w-full items-center justify-between text-[11px] uppercase tracking-[0.35em] text-white/50 transition hover:text-white"
                aria-expanded={!isCollapsed}
              >
                {section.title}
                <span className="text-xs">{isCollapsed ? "+" : "−"}</span>
              </button>
              {!isCollapsed && (
                <div className="space-y-3">
                  {section.items.map((item) => {
                    const isActive = item.href ? pathname === item.href : false;
                    const content = (
                      <>
                        <div className="flex items-center justify-between text-sm font-medium">
                          <span>{item.label}</span>
                          <span className="text-xs text-white/60">
                            {isActive ? "•" : "→"}
                          </span>
                        </div>
                        <p
                          className={`text-xs ${
                            isActive ? "text-black/70" : "text-white/60"
                          }`}
                        >
                          {item.desc}
                        </p>
                      </>
                    );

                    if (!item.href) {
                      return (
                        <button
                          type="button"
                          key={item.label}
                          className="w-full rounded-2xl border border-dashed border-white/10 bg-white/0 px-4 py-4 text-left text-white/50"
                        >
                          {content}
                        </button>
                      );
                    }

                    return (
                      <Link
                        key={item.label}
                        href={item.href}
                        className={`block rounded-2xl border px-4 py-4 transition ${
                          isActive
                            ? "border-white/40 bg-white/90 text-black"
                            : "border-white/10 bg-white/5 text-white/80 hover:border-white/30 hover:bg-white/10"
                        }`}
                      >
                        {content}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {/* <div className="mt-8 grid grid-cols-2 gap-3 text-sm">
        {SOCIAL_LINKS.map((link) => (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noreferrer"
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white/80 transition hover:border-white/40 hover:bg-white/15"
          >
            <span className="text-white">{link.icon}</span> {link.label}
          </a>
        ))}
      </div> */}
    </aside>
  );
}
