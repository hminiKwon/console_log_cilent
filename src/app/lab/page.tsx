import type { Metadata } from "next";
import { ProtectedGate } from "@/widgets/protected";
import { GlassPanel } from "@/shared/ui";

export const metadata: Metadata = {
  title: "실험실 · Console Log Lab",
  description: "새로운 기능을 시험하는 전용 공간",
};

const experiments = [
  {
    title: "AI 콘솔 분석",
    desc: "서버 로그를 AI가 요약하고 이상 패턴을 조기에 탐지합니다.",
  },
  {
    title: "WebGL 모션",
    desc: "사이드바 상호작용에 따라 3D 배경이 실시간 반응합니다.",
  },
  {
    title: "실시간 사진 편집",
    desc: "브라우저 내에서 RAW 파일을 편집하고 공유합니다.",
  },
];

export default function LabPage() {
  return (
    <ProtectedGate
      title="실험실은 인증 사용자에게만 공개됩니다"
      description="미완성 기능과 비공개 실험을 다루므로 로그인 후 이용해 주세요."
    >
      <GlassPanel className="space-y-6 bg-gradient-to-br from-slate-900/80 to-slate-900/20">
        <div>
          <p className="text-sm uppercase tracking-[0.4em] text-white/60">
            Lab
          </p>
          <h1 className="text-4xl font-semibold text-white">실험 노트</h1>
          <p className="text-sm text-white/70">
            진행 중인 실험 목록과 향후 계획을 이곳에서 관리합니다.
          </p>
        </div>
        <div className="space-y-4">
          {experiments.map((exp) => (
            <div
              key={exp.title}
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4"
            >
              <p className="text-base font-semibold text-white">
                {exp.title}
              </p>
              <p className="text-sm text-white/70">{exp.desc}</p>
            </div>
          ))}
        </div>
      </GlassPanel>
    </ProtectedGate>
  );
}
