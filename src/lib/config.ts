// Site configuration - migrated from Astro src/site.ts

export const SITE = {
  website: "https://blog.cot.wiki/",
  author: "Perimsx",
  avatar: "https://img1.tucang.cc/api/image/show/634a56a76f7455df0e2fb5419533e0cf",
  profile: "https://blog.cot.wiki/about",
  desc: "记录成长，分享价值。信息安全专业学生，全栈开发爱好者。",
  title: "Cotovo",
  email: "1722288011@qq.com",
  qq: "1722288011",
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
  comments: {
    enabled: true,
    autoApprove: true,
    backend: "twikoo",
  },
} as const;

export const SOCIALS = [
  {
    name: "Github",
    href: "https://github.com/Perimsx",
    linkTitle: `${SITE.title} on Github`,
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
    href: `mailto:${SITE.email}`,
    linkTitle: `Send an email to ${SITE.title}`,
    icon: "mail",
    active: false,
  },
] as const;

export const SHARE_LINKS = [
  { name: "WeChat", href: "", linkTitle: "分享到微信", icon: "wechat" },
  {
    name: "QQ",
    href: "https://connect.qq.com/widget/shareqq/index.html?url=",
    linkTitle: "分享到QQ",
    icon: "qq",
  },
  { name: "X", href: "https://x.com/intent/post?url=", linkTitle: "分享到 X", icon: "twitter" },
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
