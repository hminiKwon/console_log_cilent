import { LoginForm, LOGIN_HIGHLIGHTS } from "@/features/auth";
import { GlassPanel } from "@/shared/ui";

export function LoginExperience() {
  return (
    <section className="space-y-10">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)]">
        <HeroPanel />
        <LoginForm />
      </div>
    </section>
  );
}

function HeroPanel() {
  return (
    <GlassPanel className="flex h-full flex-col justify-between bg-linear-to-br from-slate-950 via-slate-900 to-slate-900/60 p-10 text-white">
      <div className="space-y-5">
        <p className="text-xs uppercase tracking-[0.5em] text-white/50">
          Login
        </p>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          로그인 하나로
          <br />홈 전체를 여는 경험
        </h1>
        <p className="text-base text-white/70">
          사이드바·메인 콘텐츠는 그대로 유지하고, 로그인 상태만 안정적으로
          관리되는 구조입니다. Apple 감성의 여백과 모서리를 지키면서 실제
          서비스에 쓰일 수 있는 조합으로 구성했습니다.
        </p>
        <div className="flex flex-wrap gap-3">
          <button className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-white/90">
            새 계정 만들기
          </button>
          <button className="rounded-2xl border border-white/40 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:border-white hover:bg-white/10">
            지원 센터
          </button>
        </div>
      </div>
      <div className="mt-8 space-y-3">
        {LOGIN_HIGHLIGHTS.map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4"
          >
            <p className="text-sm font-semibold text-white">{item.title}</p>
            <p className="text-sm text-white/70">{item.desc}</p>
          </div>
        ))}
      </div>
    </GlassPanel>
  );
}
