import { BoardPreviewCard } from "@/features/board";
import { GalleryPreviewCard } from "@/features/gallery";
import { GlassPanel } from "@/shared/ui";

export function DashboardShowcase() {
  return (
    <section className="flex-1 space-y-8">
      <HeroPanel />
      <div className="grid gap-6 md:grid-cols-2">
        <BoardPreviewCard />
        <BoardPreviewCard />
      </div>
      <GalleryPreviewCard />
    </section>
  );
}

function HeroPanel() {
  return (
    <GlassPanel className="relative overflow-hidden bg-linear-to-br from-black via-slate-900 to-slate-800">
      <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
      <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center">
        <div className="flex-1 space-y-4">
          <p className="text-sm uppercase tracking-[0.4em] text-white/60">
            Welcome Back
          </p>
          <h2 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            CONSOLE LOG
          </h2>
          <p className="text-base text-white/70 sm:text-lg">
            주제 없이 모든 것을 기록하기 위해 만들어진 개인 페이지 입니다.
            <br />
            대부분의 기능은 오픈되어 있으며, 일부 기능은 로그인 한 사용자만 이용
            가능합니다.
          </p>
          {/* <div className="flex flex-wrap gap-3">
            <button className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-white/90">
              프로토타입 시작하기
            </button>
            <button className="rounded-2xl border border-white/40 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:border-white hover:bg-white/10">
              구성 살펴보기
            </button>
          </div> */}
        </div>
      </div>
    </GlassPanel>
  );
}
