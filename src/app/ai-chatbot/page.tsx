import type { Metadata } from "next";
import { ProtectedGate } from "@/widgets/protected";
import { AiChatbotExperience } from "@/widgets/ai-chatbot";

export const metadata: Metadata = {
  title: "AI Chatbot · Console Log",
  description: "로그인 사용자만 접근 가능한 AI 챗봇 실험 페이지",
};

export default function AiChatbotPage() {
  return (
    <ProtectedGate
      title="AI Chatbot"
      description="로그인 사용자를 위한 AI 챗봇 실험 공간입니다."
    >
      <AiChatbotExperience />
    </ProtectedGate>
  );
}
