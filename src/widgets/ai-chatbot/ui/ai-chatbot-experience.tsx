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
		<section className="space-y-5">
			<GlassPanel className="flex h-[85vh] flex-col space-y-3 bg-white lg:h-[90vh]">
				<div
					ref={scrollRef}
					className="min-h-0 flex-1 space-y-2.5 overflow-y-auto rounded-2xl border border-emerald-100 bg-emerald-50/50 p-3.5"
				>
					{messages.map((message) => (
						<div
							key={message.id}
							className={`flex flex-col gap-1 rounded-2xl border px-4 py-3 text-sm ${
								message.role === "user"
									? "items-end border-emerald-200 bg-white text-emerald-900"
									: "items-start border-slate-200 bg-white text-slate-700"
							}`}
						>
							<div className="flex w-full items-center justify-between text-[11px] uppercase tracking-[0.3em] text-slate-500">
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
					<label className="text-xs uppercase tracking-[0.3em] text-emerald-700">
						메시지 입력
					</label>
					<div className="rounded-3xl border border-emerald-100 bg-white p-3">
						<textarea
							value={input}
							onChange={(event) => setInput(event.target.value)}
							onKeyDown={handleKeyDown}
							rows={3}
							className="w-full resize-none rounded-2xl border border-transparent bg-transparent p-3 text-sm text-slate-900 outline-none focus:border-emerald-200"
							placeholder="Shift+Enter로 줄바꿈, Enter로 전송"
						/>
						{error && <p className="px-3 text-xs text-rose-500">{error}</p>}
						<div className="mt-2.5 flex items-center justify-between text-xs text-slate-600">
							<span>{isSending ? "응답 생성 중..." : "준비 완료"}</span>
							<button
								type="button"
								onClick={handleSend}
								disabled={!input.trim() || isSending}
								className="inline-flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-600 px-4 py-2 font-medium text-white transition hover:border-emerald-300 hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
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
