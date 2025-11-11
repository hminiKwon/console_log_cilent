export type OverviewStat = {
  label: string;
  value: string;
  trend: string;
};

export const OVERVIEW_STATS: OverviewStat[] = [
  { label: "활성 사용자", value: "12.4K", trend: "+8%" },
  { label: "게시물", value: "3.1K", trend: "+24%" },
  { label: "사진 자산", value: "980", trend: "+12%" },
];
