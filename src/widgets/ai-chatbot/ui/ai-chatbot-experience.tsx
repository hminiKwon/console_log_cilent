"use client";

import { useMemo, useRef, useState } from "react";
import { GlassPanel } from "@/shared/ui";
import { sendChat } from "@/features/ai-chat";

const formatTime = (date = new Date()) =>
  date.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  time: string;
};

const createInitialMessages = (): ChatMessage[] => {
  const now = formatTime();
  return [
    {
      id: "1",
      role: "assistant",
      content:
        "무엇을 도와드릴까요? 콘솔 로그 실험실과 관련된 질문을 해보세요.",
      time: now,
    },
  ];
};

export function AiChatbotExperience() {
  const [messages, setMessages] = useState<ChatMessage[]>(
    createInitialMessages
  );
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const pendingPlaceholder = useMemo(
    () =>
      ({
        id: "pending",
        role: "assistant" as const,
        content: "생각 중...",
        time: "",
      } satisfies ChatMessage),
    []
  );

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    });
  };

  const handleSend = () => {
    const text = input.trim();
    if (!text || isSending) return;

    const sentAt = new Date();

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      time: formatTime(sentAt),
    };

    const assistantMessage: ChatMessage = {
      ...pendingPlaceholder,
      id: crypto.randomUUID(),
      content: "답변을 준비 중입니다. 잠시만 기다려 주세요.",
      time: "응답 대기",
    };

    setError(null);
    setIsSending(true);
    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setInput("");
    scrollToBottom();

    const history = [...messages, userMessage].map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    sendChat({ message: text, history })
      .then((response) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessage.id
              ? {
                  ...msg,
                  content: response.reply || "응답이 비어 있습니다.",
                  time: formatTime(new Date()),
                }
              : msg
          )
        );
      })
      .catch(() => {
        setError("응답을 불러오지 못했습니다. 잠시 후 다시 시도하세요.");
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessage.id
              ? {
                  ...msg,
                  content: "서버 응답에 실패했습니다.",
                  time: formatTime(new Date()),
                }
              : msg
          )
        );
      })
      .finally(() => {
        setIsSending(false);
        scrollToBottom();
      });
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <section className="space-y-6">
      <GlassPanel className="bg-gradient-to-br from-slate-900/80 to-slate-900/40">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-white/60">
              AI Chatbot
            </p>
            <h1 className="text-2xl font-semibold">대화형 실험실</h1>
            <p className="text-sm text-white/60">
              로그인 사용자만 접근할 수 있는 챗봇 영역입니다.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-white/60">
            <span className="h-2 w-2 rounded-full bg-emerald-400" aria-hidden />
            데모 모드
          </div>
        </div>
      </GlassPanel>

      <GlassPanel className="space-y-4 bg-white/5">
        <div
          ref={scrollRef}
          className="max-h-[480px] space-y-3 overflow-y-auto rounded-2xl border border-white/10 bg-black/20 p-4"
        >
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex flex-col gap-1 rounded-2xl border px-4 py-3 text-sm ${
                message.role === "user"
                  ? "items-end border-white/20 bg-white/10 text-white"
                  : "items-start border-white/10 bg-white/5 text-white/80"
              }`}
            >
              <div className="flex w-full items-center justify-between text-[11px] uppercase tracking-[0.3em] text-white/50">
                <span>{message.role === "user" ? "You" : "Assistant"}</span>
                <span>{message.time}</span>
              </div>
              <p className="whitespace-pre-line text-base leading-relaxed">
                {message.content}
              </p>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-[0.3em] text-white/50">
            메시지 입력
          </label>
          <div className="rounded-3xl border border-white/15 bg-white/5 p-3">
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              rows={3}
              className="w-full resize-none rounded-2xl border border-transparent bg-transparent p-3 text-sm text-white outline-none focus:border-white/40"
              placeholder="Shift+Enter로 줄바꿈, Enter로 전송"
            />
            {error && <p className="px-3 text-xs text-rose-300">{error}</p>}
            <div className="mt-3 flex items-center justify-between text-xs text-white/60">
              <span>{isSending ? "응답 생성 중..." : "준비 완료"}</span>
              <button
                type="button"
                onClick={handleSend}
                disabled={!input.trim() || isSending}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/40 px-4 py-2 font-medium text-white transition hover:border-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                보내기 ↵
              </button>
            </div>
          </div>
        </div>
      </GlassPanel>
    </section>
  );
}
