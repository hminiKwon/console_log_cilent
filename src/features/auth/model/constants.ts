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
    title: "Apple ID + 사내 계정",
    desc: "SSO 연동으로 한 번의 로그인으로 전체 서비스 이용",
  },
  {
    title: "기기 신뢰 관리",
    desc: "신규 기기 접근 시 추가 인증을 유연하게 안내",
  },
  {
    title: "세션 복원",
    desc: "게시판/사진 갤러리 이동 시 인증 컨텍스트 유지",
  },
];
