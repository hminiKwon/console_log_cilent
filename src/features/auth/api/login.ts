import { httpClient } from "@/shared/api";
import { hashPassword } from "@/shared/lib";
import { accessTokenStore } from "@/entities/session";

export type LoginRequest = {
	email: string;
	password: string;
	remember?: boolean;
};

export type LoginResponse = {
	tokens: {
		access_token: string;
		token_type: string;
	};
	user?: {
		id: string;
		username: string;
		email: string;
	};
};

export async function login(request: LoginRequest) {
	const passwordHash = await hashPassword(request.password);

	const { data } = await httpClient.post<LoginResponse>("/auth/login", {
		...request,
		password: passwordHash,
	});
	accessTokenStore.getState().setToken(data.tokens.access_token);
	return data;
}
