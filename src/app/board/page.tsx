import type { Metadata } from "next";
import { BoardPreviewCard } from "@/features/board";
import { GlassPanel } from "@/shared/ui";

export const metadata: Metadata = {
  title: "일반 게시판 · Console Log Lab",
  description: "누구나 열람 가능한 일반 게시판 요약",
};

export default function BoardPage() {
  return (
    <div className="space-y-6">
      <GlassPanel className="bg-gradient-to-br from-white to-emerald-50">
        <p className="text-sm uppercase tracking-[0.4em] text-emerald-700">
          Bulletin
        </p>
        <h1 className="text-4xl font-semibold text-slate-900">일반 게시판</h1>
        <p className="text-sm text-slate-600">
          콘솔 디자인 업데이트, 실험실 공지 등을 빠르게 확인하세요.
        </p>
      </GlassPanel>
      <BoardPreviewCard />
    </div>
  );
}
