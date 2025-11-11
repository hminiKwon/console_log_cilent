import type { Metadata } from "next";
import { ProtectedGate } from "@/widgets/protected";
import { BoardPreviewCard } from "@/features/board";
import { GlassPanel } from "@/shared/ui";

export const metadata: Metadata = {
  title: "일반 게시판 · Console Log Lab",
  description: "인증된 사용자만 접근 가능한 게시판 요약",
};

export default function BoardPage() {
  return (
    <ProtectedGate
      title="게시판은 로그인 후 접근할 수 있어요"
      description="콘솔 기록, 업데이트, 공지 등 민감한 내용을 위해 인증을 요구합니다."
    >
      <div className="space-y-8">
        <GlassPanel className="bg-gradient-to-br from-slate-900/80 to-slate-900/40">
          <p className="text-sm uppercase tracking-[0.4em] text-white/60">
            Bulletin Access
          </p>
          <h1 className="text-4xl font-semibold text-white">
            전용 일반 게시판
          </h1>
          <p className="text-sm text-white/70">
            콘솔 디자인 업데이트, 실험실 공지 등을 빠르게 확인하세요.
          </p>
        </GlassPanel>
        <BoardPreviewCard />
      </div>
    </ProtectedGate>
  );
}
