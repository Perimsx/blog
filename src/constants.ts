import { SITE } from "./consts";

export const SOCIALS = [
  {
    name: "Github",
    href: "https://github.com/Perimsx",
    linkTitle: ` ${SITE.title} on Github`,
    icon: "github",
    active: true,
  },
  {
    name: "X",
    href: "",
    linkTitle: `${SITE.title} on X`,
    icon: "twitter",
    active: false,
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
    href: "mailto:Perimsx@qq.com",
    linkTitle: `Send an email to ${SITE.title}`,
    icon: "mail",
    active: true,
  },
] as const;

export const SHARE_LINKS = [
  {
    name: "WeChat",
    href: "",
    linkTitle: `分享到微信`,
    icon: "wechat",
  },
  {
    name: "QQ",
    href: "https://connect.qq.com/widget/shareqq/index.html?url=",
    linkTitle: `分享到QQ`,
    icon: "qq",
  },
  {
    name: "X",
    href: "https://x.com/intent/post?url=",
    linkTitle: `分享到 X`,
    icon: "twitter",
  },
  {
    name: "Telegram",
    href: "https://t.me/share/url?url=",
    linkTitle: `分享到 Telegram`,
    icon: "telegram",
  },
  {
    name: "Facebook",
    href: "https://www.facebook.com/sharer.php?u=",
    linkTitle: `分享到 Facebook`,
    icon: "facebook",
  },
] as const;
