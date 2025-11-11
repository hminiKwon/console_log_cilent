import { GlassPanel } from "@/shared/ui";

const posts = [
  {
    title: "콘솔 디자인 가이드 v2",
    tag: "공지",
    time: "방금 전",
  },
  {
    title: "사진 게시판 자동 리사이즈",
    tag: "업데이트",
    time: "2시간 전",
  },
  {
    title: "Apple 감성 타이포그래피 모듈",
    tag: "디자인",
    time: "어제",
  },
];

export function BoardPreviewCard() {
  return (
    <GlassPanel className="h-full bg-linear-to-br from-slate-900/60 via-slate-900/40 to-slate-900/20">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-white/60">
            Bulletin
          </p>
          <h3 className="text-xl font-semibold tracking-tight">일반 게시판</h3>
        </div>
        <button className="rounded-2xl border border-white/20 px-3 py-1 text-xs text-white/80 transition hover:border-white/40">
          모두 보기
        </button>
      </div>
      <div className="mt-6 space-y-4">
        {posts.map((post) => (
          <article
            key={post.title}
            className="rounded-2xl border border-white/5 bg-black/20 px-4 py-4 text-sm text-white/80 transition hover:border-white/20"
          >
            <div className="flex items-center gap-2 text-xs text-white/50">
              <span className="rounded-full border border-white/20 px-2 py-0.5 text-[11px] uppercase tracking-wide">
                {post.tag}
              </span>
              <span>{post.time}</span>
            </div>
            <h4 className="mt-2 text-base font-medium text-white">
              {post.title}
            </h4>
            <p className="mt-1 text-xs text-white/60">
              새로운 공지와 업데이트를 타임라인에서 즉시 확인하세요.
            </p>
          </article>
        ))}
      </div>
    </GlassPanel>
  );
}
