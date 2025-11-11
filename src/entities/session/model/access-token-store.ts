import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type AccessTokenState = {
  token: string | null;
  hasHydrated: boolean;
  setToken: (token: string | null) => void;
  clearToken: () => void;
  setHydrated: (value: boolean) => void;
};

export const accessTokenStore = create<AccessTokenState>()(
  persist(
    (set) => ({
      token: null,
      hasHydrated: false,
      setToken: (token) => set({ token }),
      clearToken: () => set({ token: null }),
      setHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: "console-log-access-token",
      storage: createJSONStorage(() => sessionStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
      partialize: (state) => ({ token: state.token, hasHydrated: true }),
    }
  )
);
