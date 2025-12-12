import axios from "axios";

export function getHttpErrorMessage(
	error: unknown,
	fallback = "문제가 발생했습니다. 잠시 후 다시 시도해 주세요."
) {
	if (axios.isAxiosError(error)) {
		const data = error.response?.data as { message?: string } | undefined;
		return data?.message ?? error.message ?? fallback;
	}
	if (error instanceof Error) {
		return error.message;
	}
	return fallback;
}
