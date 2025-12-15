import { GlassPanel } from "@/shared/ui";

const galleryItems = [
  { id: 1, color: "from-emerald-100 to-emerald-200", label: "Monochrome" },
  { id: 2, color: "from-sky-100 to-white", label: "Depth" },
  { id: 3, color: "from-orange-100 to-amber-200", label: "Contrast" },
  { id: 4, color: "from-indigo-100 to-blue-200", label: "Night" },
];

export function GalleryPreviewCard() {
  return (
    <GlassPanel className="space-y-4 bg-linear-to-br from-white via-sky-50 to-emerald-50">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-emerald-700">
            Gallery
          </p>
          <h3 className="text-xl font-semibold tracking-tight">사진 게시판</h3>
        </div>
        <div className="text-xs text-slate-600">반응형 Masonry</div>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {galleryItems.map((item) => (
          <div
            key={item.id}
            className={`group relative aspect-3/4 overflow-hidden rounded-3xl border border-emerald-100 bg-linear-to-br ${item.color} text-black`}
          >
            <span className="absolute left-4 top-3 text-xs tracking-widest text-black/60">
              0{item.id}
            </span>
            <span className="absolute inset-x-3 bottom-3 rounded-2xl bg-white/80 px-3 py-1 text-xs font-medium text-black group-hover:bg-white">
              {item.label}
            </span>
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-emerald-100 bg-white/80 px-4 py-2.5 text-xs text-slate-600">
        HDR 최적화, 자동 색상 보정, EXIF 히스토리까지 한 번에 제공하는 사진
        게시판을 구상하고 있습니다.
      </div>
    </GlassPanel>
  );
}
