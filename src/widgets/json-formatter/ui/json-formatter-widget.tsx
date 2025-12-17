"use client";

import { GlassPanel } from "@/shared/ui";
import { useJsonFormatter } from "@/features/json-formatter";

export function JsonFormatterWidget() {
	const { input, output, error, setInput, reset, format, copy } =
		useJsonFormatter();

	return (
		<div className="space-y-4">
			<GlassPanel className="space-y-2">
				<p className="text-sm uppercase tracking-[0.35em] text-emerald-700">
					JSON Formatter
				</p>
				<h1 className="text-2xl font-semibold text-slate-900">
					JSON을 보기 좋게 정렬해요
				</h1>
				<p className="text-sm text-slate-600">
					JSON 문자열을 붙여넣고 포맷 버튼을 누르면 들여쓰기된 결과를 보여줍니다.
				</p>
			</GlassPanel>

			<div className="grid gap-4 lg:grid-cols-2">
				<GlassPanel className="space-y-3">
					<div className="flex items-center justify-between">
						<h2 className="text-sm font-semibold text-slate-900">입력</h2>
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
								onClick={format}
								className="rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-500"
							>
								포맷
							</button>
						</div>
					</div>
					<textarea
						value={input}
						onChange={(event) => setInput(event.target.value)}
						className="h-64 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
						placeholder='{"key": "value"}'
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
{output || "포맷된 결과가 여기에 표시됩니다."}
					</pre>
				</GlassPanel>
			</div>
		</div>
	);
}
