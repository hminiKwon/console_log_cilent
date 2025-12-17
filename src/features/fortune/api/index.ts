import { httpClient } from "@/shared/api/http-client";
import type { FortuneRequest, FortuneResponse } from "../model/types";

export async function fetchTodayFortune(payload: FortuneRequest) {
	const { data } = await httpClient.post<FortuneResponse>(
		"/fortune/today",
		payload
	);
	return data;
}
