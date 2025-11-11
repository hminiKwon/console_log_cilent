import type { Metadata } from "next";
import { LoginExperience } from "@/widgets/auth";

export const metadata: Metadata = {
  title: "Login · Console Log Lab",
  description: "Apple 감성 사이드바 기반 로그인 경험 프로토타입",
};

export default function LoginPage() {
  return <LoginExperience />;
}
