import type { Metadata } from "next";
import { GalleryPreviewCard } from "@/features/gallery";
import { GlassPanel } from "@/shared/ui";

export const metadata: Metadata = {
  title: "사진 게시판 · Console Log Lab",
  description: "누구나 열람 가능한 사진 게시판",
};

export default function GalleryPage() {
  return (
    <div className="space-y-6">
      <GlassPanel className="bg-gradient-to-br from-white to-sky-50">
        <p className="text-sm uppercase tracking-[0.4em] text-emerald-700">
          Photo Archive
        </p>
        <h1 className="text-4xl font-semibold text-slate-900">
          감각적인 사진 보드
        </h1>
        <p className="text-sm text-slate-600">
          HDR 최적화, 자동 리사이즈, EXIF 히스토리 등 실험적인 기능을 제공합니다.
        </p>
      </GlassPanel>
      <GalleryPreviewCard />
    </div>
  );
}
