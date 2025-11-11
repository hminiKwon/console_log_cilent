import type { Metadata } from "next";
import { ProtectedGate } from "@/widgets/protected";
import { GalleryPreviewCard } from "@/features/gallery";
import { GlassPanel } from "@/shared/ui";

export const metadata: Metadata = {
  title: "사진 게시판 · Console Log Lab",
  description: "인증된 사용자만 접근 가능한 사진 아카이브",
};

export default function GalleryPage() {
  return (
    <ProtectedGate
      title="사진 게시판은 로그인 후 열립니다"
      description="개인 아카이브와 민감한 촬영 데이터는 인증 사용자에게만 제공됩니다."
    >
      <div className="space-y-8">
        <GlassPanel className="bg-gradient-to-br from-slate-900/80 to-slate-900/40">
          <p className="text-sm uppercase tracking-[0.4em] text-white/60">
            Photo Archive
          </p>
          <h1 className="text-4xl font-semibold text-white">
            감각적인 사진 보드
          </h1>
          <p className="text-sm text-white/70">
            HDR 최적화, 자동 리사이즈, EXIF 히스토리 등 실험적인 기능을 제공합니다.
          </p>
        </GlassPanel>
        <GalleryPreviewCard />
      </div>
    </ProtectedGate>
  );
}
