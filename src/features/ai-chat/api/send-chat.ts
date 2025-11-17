import { httpClient } from "@/shared/api";

type ChatMessageDto = {
  role: "user" | "assistant";
  content: string;
};

type SendChatRequest = {
  message: string;
  history?: ChatMessageDto[];
};

type SendChatResponse = { reply: string };
type SendChatResponseRaw = Partial<SendChatResponse> & { message?: string };

/**
 * AI 챗봇 백엔드에 메시지를 전송한다.
 * 실제 엔드포인트(`/ai/chat` 등)는 백엔드에 맞게 수정해 사용하세요.
 */
export async function sendChat({
  message,
  history,
}: SendChatRequest): Promise<SendChatResponse> {
  const { data } = await httpClient.post<SendChatResponseRaw>("/ai/chat", {
    message,
    history,
  });

  // 백엔드 응답 형태가 다를 경우 여기서 매핑한다.
  if (typeof data.reply === "string") return { reply: data.reply };
  if (typeof data.message === "string") return { reply: data.message };
  return { reply: "응답을 받아오지 못했습니다." };
}
