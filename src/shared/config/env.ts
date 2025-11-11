type AppEnv = "development" | "production" | (string & {});

const APP_ENV = (process.env.NEXT_PUBLIC_APP_ENV ??
  process.env.NODE_ENV ??
  "development") as AppEnv;

const API_BY_ENV: Record<AppEnv, string | undefined> = {
  development: process.env.NEXT_PUBLIC_API_BASE_URL_DEV,
  production: process.env.NEXT_PUBLIC_API_BASE_URL_PRD,
};

const fallbackBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

export const env = {
  appEnv: APP_ENV,
  apiBaseUrl: API_BY_ENV[APP_ENV] ?? fallbackBaseUrl,
};
