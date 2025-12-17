"use client";

import { GlassPanel } from "@/shared/ui";
import {
	useTextEncoder,
	type EncodeMethod,
	ENCODE_METHOD_LABELS,
} from "@/features/text-encoder";

export function TextEncoderWidget() {
	const {
		input,
		output,
		method,
		error,
		isEncoding,
		setInput,
		setMethod,
		reset,
		encode,
		copy,
	} = useTextEncoder();

	const methods: EncodeMethod[] = ["base64", "url", "sha256"];

	return (
		<div className="space-y-4">
			<GlassPanel className="space-y-2">
				<p className="text-sm uppercase tracking-[0.35em] text-emerald-700">
					Text Encoder
				</p>
				<h1 className="text-2xl font-semibold text-slate-900">
					선택한 방식으로 문자열 인코딩
				</h1>
				<p className="text-sm text-slate-600">
					Base64, URL 인코딩, SHA-256 해시를 빠르게 변환합니다.
				</p>
			</GlassPanel>

			<div className="grid gap-4 lg:grid-cols-2">
				<GlassPanel className="space-y-3">
					<div className="flex items-center justify-between gap-3">
						<div className="space-y-1">
							<p className="text-sm font-semibold text-slate-900">입력</p>
							<label className="flex items-center gap-2 text-xs text-slate-600">
								<span className="text-slate-500">방법</span>
								<select
									value={method}
									onChange={(event) =>
										setMethod(event.target.value as EncodeMethod)
									}
									className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 outline-none transition hover:border-emerald-200 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
								>
									{methods.map((m) => (
										<option key={m} value={m}>
											{ENCODE_METHOD_LABELS[m]}
										</option>
									))}
								</select>
							</label>
						</div>
						<div className="flex gap-2">
							<button
								type="button"
								onClick={reset}
								className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-emerald-200 hover:text-emerald-800"
							>
								초기화
							</button>
							<button
								type="button"
								onClick={encode}
								disabled={isEncoding}
								className="rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
							>
								{isEncoding ? "처리 중..." : "인코딩"}
							</button>
						</div>
					</div>
					<textarea
						value={input}
						onChange={(event) => setInput(event.target.value)}
						className="h-64 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
						placeholder="인코딩할 문자열을 입력하세요"
					/>
					{error ? (
						<p className="rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
							{error}
						</p>
					) : null}
				</GlassPanel>

				<GlassPanel className="space-y-3">
					<div className="flex items-center justify-between">
						<h2 className="text-sm font-semibold text-slate-900">출력</h2>
						<button
							type="button"
							onClick={copy}
							disabled={!output}
							className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 transition hover:border-emerald-300 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
						>
							복사
						</button>
					</div>
					<pre className="h-64 overflow-auto rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900">
{output || "인코딩 결과가 여기에 표시됩니다."}
					</pre>
				</GlassPanel>
			</div>
		</div>
	);
}
