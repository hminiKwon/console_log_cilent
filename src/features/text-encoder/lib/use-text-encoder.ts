"use client";

import { useCallback, useState } from "react";
import { ENCODE_METHOD_LABELS, encodeValue, type EncodeMethod } from "./encoders";

type EncoderState = {
	input: string;
	output: string;
	method: EncodeMethod;
	error: string;
	isEncoding: boolean;
};

export function useTextEncoder(initialInput = "hello world") {
	const [state, setState] = useState<EncoderState>({
		input: initialInput,
		output: "",
		method: "base64",
		error: "",
		isEncoding: false,
	});

	const setInput = useCallback((value: string) => {
		setState((prev) => ({ ...prev, input: value }));
	}, []);

	const setMethod = useCallback((method: EncodeMethod) => {
		setState((prev) => ({ ...prev, method }));
	}, []);

	const reset = useCallback(() => {
		setState({ input: "", output: "", method: "base64", error: "", isEncoding: false });
	}, []);

	const encode = useCallback(async () => {
		setState((prev) => ({ ...prev, isEncoding: true, error: "" }));
		try {
			const result = await encodeValue(state.input, state.method);
			setState((prev) => ({ ...prev, output: result, isEncoding: false }));
		} catch {
			setState((prev) => ({
				...prev,
				error: "인코딩 중 문제가 발생했습니다.",
				isEncoding: false,
				output: "",
			}));
		}
	}, [state.input, state.method]);

	const copy = useCallback(async () => {
		if (!state.output) return;
		try {
			await navigator.clipboard.writeText(state.output);
		} catch {
			// ignore
		}
	}, [state.output]);

	return {
		input: state.input,
		output: state.output,
		method: state.method,
		error: state.error,
		isEncoding: state.isEncoding,
		setInput,
		setMethod,
		reset,
		encode,
		copy,
		methodLabels: ENCODE_METHOD_LABELS,
	};
}
