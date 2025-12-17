import { type ReactNode } from "react";
import { cn } from "@/shared/lib";

type GlassPanelProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Glass 형태 카드. Apple 스타일의 얇은 테두리와 블러 처리를 재사용한다.
 */
export function GlassPanel({ children, className }: GlassPanelProps) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-sky-100/80 bg-white/90 p-5 text-slate-900 shadow-[0_25px_60px_rgba(14,165,233,0.12)] backdrop-blur-2xl",
        className,
      )}
    >
      {children}
    </div>
  );
}
