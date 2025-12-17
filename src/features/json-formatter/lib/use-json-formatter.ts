"use client";

import { useCallback, useState } from "react";
import { formatJson } from "@/shared/lib";

type FormatterState = {
	input: string;
	output: string;
	error: string;
};

export function useJsonFormatter(initialInput = '{"hello":"world","items":[1,2,3]}') {
	const [{ input, output, error }, setState] = useState<FormatterState>({
		input: initialInput,
		output: "",
		error: "",
	});

	const setInput = useCallback((value: string) => {
		setState((prev) => ({ ...prev, input: value }));
	}, []);

	const reset = useCallback(() => {
		setState({ input: "", output: "", error: "" });
	}, []);

	const format = useCallback(() => {
		setState((prev) => ({ ...prev, error: "" }));
		try {
			const parsed = JSON.parse(input);
			const pretty = formatJson(parsed, 2);
			setState((prev) => ({ ...prev, output: pretty, error: "" }));
		} catch {
			setState((prev) => ({ ...prev, output: "", error: "유효한 JSON 문자열을 입력해 주세요." }));
		}
	}, [input]);

	const copy = useCallback(async () => {
		if (!output) return;
		try {
			await navigator.clipboard.writeText(output);
		} catch {
			// clipboard might be blocked; silently ignore
		}
	}, [output]);

	return {
		input,
		output,
		error,
		setInput,
		reset,
		format,
		copy,
	};
}
