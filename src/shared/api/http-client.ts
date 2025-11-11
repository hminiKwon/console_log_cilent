import axios from "axios";
import { env } from "@/shared/config";
import { accessTokenStore } from "@/entities/session";

export const httpClient = axios.create({
  baseURL: env.apiBaseUrl,
  withCredentials: true, // refresh token HttpOnly cookie 전달
  headers: {
    "Content-Type": "application/json",
  },
});

httpClient.interceptors.request.use((config) => {
  const token = accessTokenStore.getState().token;
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
