"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchTodayFortune } from "../api";
import type { FortuneRequest, FortuneResponse } from "../model/types";
import { getHttpErrorMessage } from "@/shared/lib";

export function useTodayFortune() {
	const [form, setForm] = useState<FortuneRequest>({
		birth_date: "1990-01-01",
		calendar: "solar",
		gender: "male",
		birth_time: null,
	});
	const [result, setResult] = useState<FortuneResponse | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");

	const setField = useCallback(
		<K extends keyof FortuneRequest>(key: K, value: FortuneRequest[K]) => {
			setForm((prev) => ({ ...prev, [key]: value }));
		},
		[]
	);

	const submit = useCallback(async () => {
		setIsLoading(true);
		setError("");
		try {
			const payload: FortuneRequest = {
				...form,
				birth_time: form.birth_time === null ? undefined : form.birth_time,
			};
			const data = await fetchTodayFortune(payload);
			setResult(data);
		} catch (err) {
			setError(getHttpErrorMessage(err, "운세를 불러오지 못했어요."));
			setResult(null);
		} finally {
			setIsLoading(false);
		}
	}, [form]);

	const reset = useCallback(() => {
		setForm({
			birth_date: "1990-01-01",
			calendar: "solar",
			gender: "male",
			birth_time: null,
		});
		setResult(null);
		setError("");
	}, []);

	useEffect(() => {
		// 클라이언트에서만 오늘 날짜로 초기화 (프리렌더 시 시간 의존성 제거)
		const today = (() => {
			try {
				return new Date().toISOString().slice(0, 10);
			} catch {
				return "1990-01-01";
			}
		})();
		setForm((prev) => ({ ...prev, birth_date: today }));
	}, []);

	const timeOptions = useMemo(
		() => [
			{ label: "선택 안 함", value: "" },
			{ label: "자 (23~01시)", value: 0 },
			{ label: "축 (01~03시)", value: 1 },
			{ label: "인 (03~05시)", value: 2 },
			{ label: "묘 (05~07시)", value: 3 },
			{ label: "진 (07~09시)", value: 4 },
			{ label: "사 (09~11시)", value: 5 },
			{ label: "오 (11~13시)", value: 6 },
			{ label: "미 (13~15시)", value: 7 },
			{ label: "신 (15~17시)", value: 8 },
			{ label: "유 (17~19시)", value: 9 },
			{ label: "술 (19~21시)", value: 10 },
			{ label: "해 (21~23시)", value: 11 },
		],
		[]
	);

	return {
		form,
		result,
		isLoading,
		error,
		setField,
		submit,
		reset,
		timeOptions,
	};
}
