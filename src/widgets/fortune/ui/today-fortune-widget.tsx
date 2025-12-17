"use client";

import { useMemo } from "react";
import { GlassPanel } from "@/shared/ui";
import { useTodayFortune } from "@/features/fortune";
import type { FortuneResponse } from "@/features/fortune";

export function TodayFortuneWidget() {
	const { form, result, isLoading, error, setField, submit, reset, timeOptions } =
		useTodayFortune();

	type SummaryKey = Exclude<keyof FortuneResponse, "score">;
	const summaryItems = useMemo(
		() =>
			[
				{ label: "총운", key: "overall" as SummaryKey },
				{ label: "재물", key: "wealth" as SummaryKey },
				{ label: "사업", key: "business" as SummaryKey },
				{ label: "직업", key: "career" as SummaryKey },
				{ label: "연애", key: "love" as SummaryKey },
				{ label: "소원 성취", key: "wish" as SummaryKey },
				{ label: "조언", key: "advice" as SummaryKey },
			],
		[]
	);

	return (
		<div className="space-y-4">
			<GlassPanel className="space-y-2">
				<p className="text-sm uppercase tracking-[0.35em] text-emerald-700">
					Fortune
				</p>
				<h1 className="text-2xl font-semibold text-slate-900">
					오늘의 운세를 확인하세요
				</h1>
				<p className="text-sm text-slate-600">
					생년월일, 양력/음력, 성별, 태어난 시간을 선택하면 오늘의 운세를 알려드려요.
				</p>
			</GlassPanel>

			<GlassPanel className="space-y-4">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<h2 className="text-sm font-semibold text-slate-900">입력 정보</h2>
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
							onClick={submit}
							disabled={isLoading}
							className="rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
						>
							{isLoading ? "조회 중..." : "운세 보기"}
						</button>
					</div>
				</div>

					<div className="grid gap-3 sm:grid-cols-2">
						<label className="space-y-1 text-sm text-slate-700">
							생년월일
							<input
								type="date"
							value={form.birth_date}
							onChange={(event) => setField("birth_date", event.target.value)}
							className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
						/>
					</label>

					<label className="space-y-1 text-sm text-slate-700">
						양력/음력
						<select
							value={form.calendar}
							onChange={(event) =>
								setField("calendar", event.target.value as "solar" | "lunar")
							}
							className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
						>
							<option value="solar">양력</option>
							<option value="lunar">음력</option>
						</select>
					</label>

					<label className="space-y-1 text-sm text-slate-700">
						성별
						<select
							value={form.gender}
							onChange={(event) =>
								setField("gender", event.target.value as "male" | "female")
							}
							className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
						>
							<option value="male">남성</option>
							<option value="female">여성</option>
						</select>
					</label>

					<label className="space-y-1 text-sm text-slate-700">
						태어난 시간 (선택)
						<select
							value={form.birth_time ?? ""}
							onChange={(event) => {
								const v = event.target.value;
								setField("birth_time", v === "" ? null : Number(v));
							}}
							className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
						>
							{timeOptions.map((opt) => (
								<option key={opt.label} value={String(opt.value)}>
									{opt.label}
								</option>
							))}
						</select>
					</label>
				</div>

				{error ? (
					<p className="rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
						{error}
					</p>
				) : null}
			</GlassPanel>

			<GlassPanel className="space-y-3">
				<div className="flex items-center justify-between">
					<h2 className="text-sm font-semibold text-slate-900">오늘의 운세</h2>
					{result?.score !== null && result?.score !== undefined ? (
						<span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
							총점 {result.score} / 100
						</span>
					) : null}
				</div>
				{!result ? (
					<p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-600">
						입력 정보를 제출하면 오늘의 운세가 여기에 표시됩니다.
					</p>
				) : (
					<div className="grid gap-3 md:grid-cols-2">
						{summaryItems.map((item) => (
							<article
								key={item.key}
								className={`rounded-2xl border border-emerald-100 bg-white/80 px-4 py-3 text-sm text-slate-800 shadow-sm ${
									item.key === "overall" ? "md:col-span-2" : ""
								}`}
							>
								<p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
									{item.label}
								</p>
								<p className="mt-2 leading-relaxed">
									{result?.[item.key]}
								</p>
							</article>
						))}
					</div>
				)}
			</GlassPanel>
		</div>
	);
}
