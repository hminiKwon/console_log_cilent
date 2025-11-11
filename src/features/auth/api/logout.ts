import { httpClient } from "@/shared/api";
import { accessTokenStore } from "@/entities/session";

export async function logout() {
  try {
    await httpClient.post("/auth/logout");
  } catch (error) {
    // 서버 로그아웃 실패 시에도 클라이언트 세션은 정리한다.
    console.warn("Logout request failed:", error);
  } finally {
    accessTokenStore.getState().clearToken();
  }
}
