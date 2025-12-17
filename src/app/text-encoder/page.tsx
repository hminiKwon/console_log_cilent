import type { Metadata } from "next";
import { TextEncoderWidget } from "@/widgets/text-encoder";

export const metadata: Metadata = {
  title: "텍스트 암호화 · Console Log Lab",
  description: "Base64/URL/SHA-256 방식으로 문자열을 변환합니다.",
};

export default function TextEncoderPage() {
  return <TextEncoderWidget />;
}
