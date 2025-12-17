export type NavItem = {
  label: string;
  desc: string;
  href?: string;
  requiresAuth?: boolean;
  hideWhenAuth?: boolean;
};

export type NavSection = {
  title: string;
  items: NavItem[];
};

export type SocialLink = {
  label: string;
  href: string;
  icon: string;
};

export const NAV_SECTIONS: NavSection[] = [
  {
    title: "메인",
    items: [{ label: "홈", desc: "전체 개요", href: "/" }],
  },
  {
    title: "운세",
    items: [
      {
        label: "오늘의 운세",
        desc: "생년월일로 점 보기",
        href: "/fortune",
      },
    ],
  },
  {
    title: "콘텐츠",
    items: [
      {
        label: "화상 통화",
        desc: "4인 WebRTC",
        href: "/rooms",
      },
      {
        label: "JSON 포맷터",
        desc: "입력 → 예쁘게 보기",
        href: "/json-formatter",
      },
      {
        label: "텍스트 암호화",
        desc: "선택 방식으로 인코딩",
        href: "/text-encoder",
      },
    ],
  },
  {
    title: "실험",
    items: [
      {
        label: "AI 챗봇",
        desc: "대화형 실험",
        href: "/ai-chatbot",
        requiresAuth: true,
      },
    ],
  },
];

export const NAV_ITEMS: NavItem[] = NAV_SECTIONS.flatMap(
  (section) => section.items
);

export const SOCIAL_LINKS: SocialLink[] = [
  // { label: "GitHub", href: "https://github.com", icon: "⌘" },
  // { label: "Velog", href: "https://velog.io", icon: "✦" },
];
