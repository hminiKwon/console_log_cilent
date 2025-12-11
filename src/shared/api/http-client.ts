import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { env } from "@/shared/config";
import { accessTokenStore } from "@/entities/session";

type AuthenticatedRequestConfig = InternalAxiosRequestConfig & {
	_retry?: boolean;
};

type RefreshResponse = {
	access_token: string;
	token_type: string;
};

const refreshHttpClient = axios.create({
	baseURL: env.apiBaseUrl,
	withCredentials: true,
	headers: { "Content-Type": "application/json" },
});

export const httpClient = axios.create({
	baseURL: env.apiBaseUrl,
	withCredentials: true, // refresh token HttpOnly cookie 전달
	headers: {
		"Content-Type": "application/json",
	},
});

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken() {
	if (!refreshPromise) {
		refreshPromise = refreshHttpClient
			.post<RefreshResponse>("/auth/refresh")
			.then(({ data }) => {
				const newToken = data.access_token;
				accessTokenStore.getState().setToken(newToken);
				return newToken;
			})
			.catch((error) => {
				accessTokenStore.getState().clearToken();
				throw error;
			})
			.finally(() => {
				refreshPromise = null;
			});
	}
	return refreshPromise;
}

httpClient.interceptors.request.use((config) => {
	const token = accessTokenStore.getState().token;
	if (token) {
		config.headers = config.headers ?? {};
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

httpClient.interceptors.response.use(
	(response) => response,
	async (error: AxiosError) => {
		const status = error.response?.status;
		const originalRequest = error.config as
			| AuthenticatedRequestConfig
			| undefined;

		if (status === 401 && originalRequest && !originalRequest._retry) {
			originalRequest._retry = true;
			try {
				const newToken = await refreshAccessToken();
				if (newToken) {
					originalRequest.headers = originalRequest.headers ?? {};
					originalRequest.headers.Authorization = `Bearer ${newToken}`;
					return httpClient(originalRequest);
				}
			} catch (refreshError) {
				return Promise.reject(refreshError);
			}
		}

		return Promise.reject(error);
	}
);
