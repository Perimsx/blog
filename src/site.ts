interface SocialLink {
  href: string;
  label: string;
}

interface SiteConfig {
  website: string;
  author: string;
  profile: string;
  desc: string;
  title: string;
  ogImage: string;
  lightAndDarkMode: boolean;
  postPerIndex: number;
  postPerPage: number;
  scheduledPostMargin: number;
  showArchives: boolean;
  showBackButton: boolean;
  editPost: {
    enabled: boolean;
    text: string;
    url: string;
  };
  dynamicOgImage: boolean;
  lang: string;
  timezone: string;
}

interface SocialItem {
  name: string;
  href: string;
  linkTitle: string;
  icon: string;
  active: boolean;
}

interface ShareItem {
  name: string;
  href: string;
  linkTitle: string;
  icon: string;
}

export const SITE: SiteConfig = {
  website: "https://chenguitao.com/",
  author: "Perimsx",
  profile: "https://chenguitao.com/about",
  desc: "记录成长，分享价值。信息安全专业学生，Web 开发爱好者。",
  title: "Perimsx",
  ogImage: "og-image.jpg",
  lightAndDarkMode: true,
  postPerIndex: 10,
  postPerPage: 10,
  scheduledPostMargin: 15 * 60 * 1000,
  showArchives: false,
  showBackButton: false,
  editPost: {
    enabled: false,
    text: "Edit on GitHub",
    url: "https://github.com/your-username/your-repo/edit/main/",
  },
  dynamicOgImage: true,
  lang: "zh-CN",
  timezone: "Asia/Shanghai",
};

export const SITE_TITLE = SITE.title;
export const SITE_DESCRIPTION = SITE.desc;

export const NAV_LINKS: SocialLink[] = [
  {
    href: "/posts",
    label: "Posts",
  },
  {
    href: "/tags",
    label: "Tags",
  },
  {
    href: "/about",
    label: "About",
  },
];

export const SOCIAL_LINKS: SocialLink[] = [
  {
    href: "https://github.com/Perimsx",
    label: "GitHub",
  },
  {
    href: "mailto:1722288011@qq.com",
    label: "Email",
  },
  {
    href: "https://space.bilibili.com/9655855",
    label: "Bilibili",
  },
  {
    href: "https://v.douyin.com/HWMgjLaTtFk",
    label: "Douyin",
  },
  {
    href: "/rss.xml",
    label: "RSS",
  },
];

export const ICON_MAP: Record<string, string> = {
  GitHub: "github",
  Twitter: "twitter",
  BlueSky: "bsky",
  RSS: "rss",
  Email: "mail",
  Bilibili: "bilibili",
  Douyin: "douyin",
};

export const SOCIALS: readonly SocialItem[] = [
  {
    name: "Github",
    href: "https://github.com/Perimsx",
    linkTitle: ` ${SITE.title} on Github`,
    icon: "github",
    active: true,
  },
  {
    name: "X",
    href: "https://x.com/Perimsx",
    linkTitle: `${SITE.title} on X`,
    icon: "twitter",
    active: true,
  },
  {
    name: "Bilibili",
    href: "https://space.bilibili.com/9655855",
    linkTitle: `${SITE.title} on Bilibili`,
    icon: "bilibili",
    active: true,
  },
  {
    name: "Douyin",
    href: "https://v.douyin.com/HWMgjLaTtFk",
    linkTitle: `${SITE.title} on Douyin`,
    icon: "douyin",
    active: true,
  },
  {
    name: "Mail",
    href: "mailto:1722288011@qq.com",
    linkTitle: `Send an email to ${SITE.title}`,
    icon: "mail",
    active: false,
  },
] as const;

export const SHARE_LINKS: readonly ShareItem[] = [
  {
    name: "WeChat",
    href: "",
    linkTitle: "分享到微信",
    icon: "wechat",
  },
  {
    name: "QQ",
    href: "https://connect.qq.com/widget/shareqq/index.html?url=",
    linkTitle: "分享到QQ",
    icon: "qq",
  },
  {
    name: "X",
    href: "https://x.com/intent/post?url=",
    linkTitle: "分享到 X",
    icon: "twitter",
  },
  {
    name: "Telegram",
    href: "https://t.me/share/url?url=",
    linkTitle: "分享到 Telegram",
    icon: "telegram",
  },
  {
    name: "Facebook",
    href: "https://www.facebook.com/sharer.php?u=",
    linkTitle: "分享到 Facebook",
    icon: "facebook",
  },
] as const;
