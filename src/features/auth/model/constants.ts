export type SocialProvider = {
  label: string;
  icon: string;
};

export type LoginHighlight = {
  title: string;
  desc: string;
};

export const AUTH_SOCIAL_PROVIDERS: SocialProvider[] = [
  { label: "Apple ID", icon: "" },
  { label: "Google", icon: "◎" },
];

export const LOGIN_HIGHLIGHTS: LoginHighlight[] = [
  {
    title: "One ID, All Access",
    desc: "한 번 로그인으로 실험실·콘텐츠 전체를 이동해도 인증 유지",
  },
  {
    title: "기기 신뢰 관리",
    desc: "새 기기 접근 시 추가 인증을 안내해 안전하게 보호",
  },
  {
    title: "끊김 없는 세션",
    desc: "페이지 전환과 새로고침에서도 로그인 상태를 매끄럽게 유지",
  },
];
