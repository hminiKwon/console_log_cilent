"use client";

import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { GlassPanel } from "@/shared/ui";
import { AUTH_SOCIAL_PROVIDERS, login } from "@/features/auth";
import { getHttpErrorMessage } from "@/shared/lib";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccessMessage("");
    setIsSubmitting(true);
    try {
      await login({ email, password });
      setSuccessMessage("로그인되었습니다. 잠시만 기다려 주세요.");
      router.push("/");
    } catch (err) {
      setError(getHttpErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <GlassPanel className="space-y-5 bg-linear-to-br from-white via-emerald-50 to-sky-50">
      <header className="space-y-1.5">
        <p className="text-sm uppercase tracking-[0.35em] text-emerald-700">
          Sign in
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          다시 만나 반가워요
        </h1>
        <p className="text-sm text-slate-600">
          하나의 계정으로 실험실 기능을 모두 이용할 수 있어요.
        </p>
      </header>

      <form className="space-y-3.5" onSubmit={handleSubmit}>
        <label className="block space-y-2 text-sm text-slate-700">
          이메일
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@apple.com"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
            required
          />
        </label>
        <label className="block space-y-2 text-sm text-slate-700">
          <span className="flex items-center justify-between">
            비밀번호
            <button type="button" className="text-xs text-emerald-700 underline">
              재설정
            </button>
          </span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
            required
          />
        </label>
        <div className="flex items-center justify-between text-xs text-slate-600">
          <span>보안 레벨: 하이브리드</span>
        </div>
        {error ? (
          <p className="rounded-2xl border border-red-400/40 bg-red-50 px-4 py-2 text-xs text-red-700">
            {error}
          </p>
        ) : null}
        {successMessage ? (
          <p className="rounded-2xl border border-emerald-500/40 bg-emerald-50 px-4 py-2 text-xs text-emerald-700">
            {successMessage}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "확인 중..." : "로그인"}
        </button>
      </form>

      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.3em] text-emerald-700">
          Quick Access
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {AUTH_SOCIAL_PROVIDERS.map((provider) => (
            <button
              key={provider.label}
              type="button"
              className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 transition hover:border-emerald-200 hover:bg-emerald-50"
            >
              <span className="text-lg">{provider.icon}</span>
              {provider.label}
            </button>
          ))}
        </div>
      </div>
      <p className="text-center text-xs text-slate-600">
        계정이 없다면{" "}
        <button type="button" className="text-emerald-700 underline">
          Apple 스타일 가입
        </button>
      </p>
    </GlassPanel>
  );
}
