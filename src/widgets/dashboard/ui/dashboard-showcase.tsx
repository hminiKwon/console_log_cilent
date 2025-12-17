import { GlassPanel } from "@/shared/ui";

export function DashboardShowcase() {
  return (
    <section className="flex-1 space-y-6">
      <HeroPanel />
      <QuickActions />
    </section>
  );
}

function HeroPanel() {
  return (
    <GlassPanel className="relative overflow-hidden bg-linear-to-br from-emerald-50 via-sky-50 to-white">
      <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-emerald-200/50 blur-3xl" />
      <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div className="flex-1 space-y-3.5">
          <p className="text-sm uppercase tracking-[0.4em] text-emerald-700">
            Welcome Back
          </p>
          <h2 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
            CONSOLE LOG
          </h2>
          <p className="text-base text-slate-700 sm:text-lg">
            주제 없이 모든 것을 기록하기 위해 만들어진 개인 페이지 입니다.
            <br />
            대부분의 기능은 오픈되어 있으며, 일부 기능은 로그인 한 사용자만 이용
            가능합니다.
          </p>
          {/* <div className="flex flex-wrap gap-3">
            <button className="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500">
              프로토타입 시작하기
            </button>
            <button className="rounded-2xl border border-emerald-200 bg-white px-5 py-3 text-sm font-semibold text-emerald-800 transition hover:border-emerald-300 hover:bg-emerald-50">
              구성 살펴보기
            </button>
          </div> */}
        </div>
      </div>
    </GlassPanel>
  );
}

function QuickActions() {
  const actions = [
    {
      title: "오늘의 운세",
      desc: "생년월일로 오늘의 운세 보기",
      href: "/fortune",
      tag: "운세",
    },
    {
      title: "화상 통화",
      desc: "4인 WebRTC 룸 생성 및 참여",
      href: "/rooms",
      tag: "콘텐츠",
    },
    {
      title: "JSON 포맷터",
      desc: "JSON을 예쁘게 정렬",
      href: "/json-formatter",
      tag: "도구",
    },
    {
      title: "텍스트 암호화",
      desc: "Base64/URL/SHA-256 변환",
      href: "/text-encoder",
      tag: "도구",
    },
  ];

  return (
    <div className="grid gap-5 md:grid-cols-2">
      {actions.map((action) => (
        <GlassPanel key={action.href} className="bg-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-emerald-700">
                {action.tag}
              </p>
              <h3 className="text-xl font-semibold tracking-tight text-slate-900">
                {action.title}
              </h3>
            </div>
            <span className="text-xs text-slate-500">바로가기</span>
          </div>
          <div className="mt-3 space-y-2 text-sm text-slate-700">
            <p>{action.desc}</p>
            <a
              href={action.href}
              className="inline-flex items-center gap-2 text-emerald-700 underline decoration-emerald-200 decoration-2 underline-offset-4"
            >
              이동하기 <span aria-hidden>→</span>
            </a>
          </div>
        </GlassPanel>
      ))}
    </div>
  );
}
