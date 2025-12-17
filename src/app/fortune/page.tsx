import type { Metadata } from "next";
import { TodayFortuneWidget } from "@/widgets/fortune";

export const metadata: Metadata = {
  title: "오늘의 운세 · Console Log Lab",
  description: "생년월일과 태어난 시간으로 오늘의 운세를 확인하세요.",
};

export default function FortunePage() {
  return <TodayFortuneWidget />;
}
