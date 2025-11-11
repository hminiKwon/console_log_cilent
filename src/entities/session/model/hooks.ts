"use client";

import { useStore } from "zustand";
import { accessTokenStore } from "./access-token-store";

export function useSession() {
  const token = useStore(accessTokenStore, (state) => state.token);
  const hasHydrated = useStore(accessTokenStore, (state) => state.hasHydrated);
  const setToken = accessTokenStore.getState().setToken;
  const clearToken = accessTokenStore.getState().clearToken;

  return {
    token,
    isAuthenticated: hasHydrated && Boolean(token),
    hasHydrated,
    setToken,
    clearToken,
  };
}
