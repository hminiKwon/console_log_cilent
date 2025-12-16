import type { Metadata } from "next";
import { VideoRoomsExperience } from "@/widgets/video-rooms";

export const metadata: Metadata = {
  title: "화상 통화 · Console Log Lab",
  description: "6자리 방번호로 4인 WebRTC 방을 생성하고 참여하세요.",
};

export default function RoomsPage() {
  return <VideoRoomsExperience />;
}
