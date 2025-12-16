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
    title: "콘텐츠",
    items: [
      {
        label: "일반 게시판",
        desc: "타임라인",
        href: "/board",
      },
      {
        label: "사진 게시판",
        desc: "Masonry",
        href: "/gallery",
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
      {
        label: "화상 통화",
        desc: "4인 WebRTC",
        href: "/rooms",
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
