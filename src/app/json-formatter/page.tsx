import type { Metadata } from "next";
import { JsonFormatterWidget } from "@/widgets/json-formatter";

export const metadata: Metadata = {
  title: "JSON 포맷터 · Console Log Lab",
  description: "텍스트를 JSON으로 포맷팅해 보기 쉽게 만들어 줍니다.",
};

export default function JsonFormatterPage() {
  return <JsonFormatterWidget />;
}
