import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import satori from "satori";
import sharp from "sharp";
import { Resvg } from "@resvg/resvg-js";

const ROOT = process.cwd();
const BLOG_DIR = path.join(ROOT, "src", "content", "blog");
const COVER_DIR = path.join(BLOG_DIR, "covers");

const TITLE_MAP = {
  ai001: "2026 AI 大模型竞争格局全景分析：国内外厂商、技术路线与应用趋势",
  algo001: "十大排序算法深度对比：原理、复杂度与适用场景",
  algo002: "动态规划从入门到精通：核心思想、状态设计与经典问题",
  algo003: "图算法全景解析：遍历、最短路径与最小生成树",
  sec001: "网络安全概论：威胁类型、攻击面与防护体系",
  sec002: "TCP/IP 协议栈安全分析：各层协议隐患与防护思路",
  sec003: "常见网络攻击手法详解：DDoS、中间人攻击、SQL 注入与 XSS",
  sec004: "密码学基础与应用：对称加密、非对称加密、哈希与 PKI",
  sec005: "网络安全法律法规与合规要求：等保 2.0、网络安全法与 GDPR",
  sec007: "入侵检测系统 IDS/IPS 部署实战：Snort、Suricata 与规则编写",
  sec008: "VPN 技术详解与搭建实战：IPSec、OpenVPN 与 WireGuard",
  sec009: "Web 应用防火墙 WAF 配置实战：ModSecurity 规则与防护策略",
  sec010: "网络流量分析与抓包实战：Wireshark、tcpdump 与协议排查",
  sec011: "堡垒机与零信任架构部署实践：访问控制、审计与最小权限",
  sec012: "威胁情报基础：IOC、TTPs 与 MITRE ATT&CK 框架",
  sec013: "日志分析与 SIEM 平台搭建：ELK Stack 实战与告警思路",
  sec014: "恶意软件分析基础：静态分析、动态分析与沙箱技术",
  sec015: "网络流量异常检测与态势感知平台构建：Zeek 实战",
  sec017: "应急响应流程与方法论：NIST、PICERL 与处置闭环",
  sec018: "Windows 应急响应实战：进程、日志、注册表与持久化排查",
  sec019: "Linux 应急响应实战：入侵排查、取证分析与痕迹还原",
  sec020: "漏洞扫描与风险评估：Nessus、OpenVAS 与整改流程",
  sec021: "安全加固清单：CIS Benchmark、基线核查与最小暴露面",
  sec022: "Kali Linux 环境搭建指南：渗透测试工具链与常用配置",
  sec023: "信息收集与目标侦察：Nmap、Recon-ng 与 OSINT 技术",
  sec024: "Linux 服务漏洞利用：SSH、FTP、Samba 与 Apache 攻击面",
  sec025: "提权技术详解：SUID、内核漏洞与 Cron 定时任务利用",
  sec026: "Linux 后渗透与持久化：反弹 Shell、SSH 隧道与 Rootkit",
  sec027: "Metasploit 框架深度实战：扫描、利用与 GetShell 流程",
  sec028: "Windows 渗透测试环境搭建与信息收集：主机发现到服务识别",
  sec029: "Windows 服务与端口攻击面：SMB、RDP 与 WinRM 利用",
  sec030: "Windows 提权技术：UAC 绕过、令牌窃取与服务路径劫持",
  sec031: "域渗透基础：AD 域攻击链、横向移动与权限扩展",
  sec032: "Windows 后渗透实战：Mimikatz、票据攻击与权限维持",
};

const FONT_REGULAR = fs.readFileSync("C:/Windows/Fonts/STXIHEI.TTF");
const FONT_BOLD = fs.readFileSync("C:/Windows/Fonts/simhei.ttf");
const FONT_MONO = fs.readFileSync("C:/Windows/Fonts/consola.ttf");

fs.mkdirSync(COVER_DIR, { recursive: true });

const postFiles = fs
  .readdirSync(BLOG_DIR)
  .filter(file => file.endsWith(".md"))
  .sort((left, right) => left.localeCompare(right));

const missingTitles = postFiles.filter(file => !TITLE_MAP[file.replace(/\.md$/, "")]);
if (missingTitles.length > 0) {
  throw new Error(`Missing optimized titles for: ${missingTitles.join(", ")}`);
}

for (const file of postFiles) {
  const slug = file.replace(/\.md$/, "");
  const fullPath = path.join(BLOG_DIR, file);
  const raw = fs.readFileSync(fullPath, "utf8");
  const parsed = matter(raw);
  const nextData = buildFrontmatter(slug, parsed.data);
  const heroRelativePath = `./covers/${slug}-cover.webp`;
  const ogRelativePath = `./covers/${slug}-og.webp`;

  const heroOutputPath = path.join(COVER_DIR, `${slug}-cover.webp`);
  const ogOutputPath = path.join(COVER_DIR, `${slug}-og.webp`);

  await generateCover({
    title: nextData.title,
    description: nextData.description,
    tags: nextData.tags,
    slug,
    outputPath: heroOutputPath,
    width: 1600,
    height: 900,
    variant: "hero",
  });

  await generateCover({
    title: nextData.title,
    description: nextData.description,
    tags: nextData.tags,
    slug,
    outputPath: ogOutputPath,
    width: 1200,
    height: 630,
    variant: "og",
  });

  nextData.heroImage = heroRelativePath;
  nextData.ogImage = ogRelativePath;

  const output = matter.stringify(parsed.content.trimStart(), nextData);
  fs.writeFileSync(fullPath, output.endsWith("\n") ? output : `${output}\n`, "utf8");
  console.log(`updated ${file}`);
}

function buildFrontmatter(slug, currentData) {
  const nextData = {};
  const orderedEntries = [
    ["pubDatetime", currentData.pubDatetime],
    ["title", TITLE_MAP[slug] ?? currentData.title],
    ["featured", currentData.featured],
    ["draft", currentData.draft],
    ["unlisted", currentData.unlisted],
    ["tags", currentData.tags ?? ["others"]],
    ["description", currentData.description],
    ["heroImage", currentData.heroImage],
    ["ogImage", currentData.ogImage],
    ["modDatetime", currentData.modDatetime],
    ["timezone", currentData.timezone],
    ["canonicalURL", currentData.canonicalURL],
    ["hideEditPost", currentData.hideEditPost],
    ["source", currentData.source],
    ["AIDescription", currentData.AIDescription],
  ];

  for (const [key, value] of orderedEntries) {
    if (value !== undefined && value !== null && value !== "") {
      nextData[key] = value;
    }
  }

  for (const [key, value] of Object.entries(currentData)) {
    if (key === "author") {
      continue;
    }
    if (nextData[key] === undefined && value !== undefined) {
      nextData[key] = value;
    }
  }

  return nextData;
}

function getTheme(slug) {
  if (slug.startsWith("ai")) {
    return {
      label: "AI",
      accent: "#10b981",
      accentSoft: "rgba(16, 185, 129, 0.18)",
      gradient: "linear-gradient(135deg, #06121a 0%, #123b36 42%, #0f766e 100%)",
    };
  }

  if (slug.startsWith("algo")) {
    return {
      label: "ALGORITHM",
      accent: "#f59e0b",
      accentSoft: "rgba(245, 158, 11, 0.18)",
      gradient: "linear-gradient(135deg, #15110b 0%, #3a250a 42%, #b45309 100%)",
    };
  }

  return {
    label: "SECURITY",
    accent: "#38bdf8",
    accentSoft: "rgba(56, 189, 248, 0.18)",
    gradient: "linear-gradient(135deg, #07111f 0%, #0f2744 42%, #1d4ed8 100%)",
  };
}

async function generateCover({
  title,
  description,
  tags,
  slug,
  outputPath,
  width,
  height,
  variant,
}) {
  const theme = getTheme(slug);
  const isHero = variant === "hero";
  const svg = await satori(
    createCoverMarkup({
      title,
      description,
      tags,
      slug,
      theme,
      width,
      height,
      isHero,
    }),
    {
      width,
      height,
      embedFont: true,
      fonts: [
        { name: "Microsoft YaHei", data: FONT_REGULAR, weight: 400, style: "normal" },
        { name: "Microsoft YaHei", data: FONT_BOLD, weight: 700, style: "normal" },
        { name: "Consolas", data: FONT_MONO, weight: 400, style: "normal" },
      ],
    }
  );

  const pngBuffer = new Resvg(svg).render().asPng();
  await sharp(pngBuffer).webp({ quality: isHero ? 88 : 86 }).toFile(outputPath);
}

function createCoverMarkup({ title, description, tags, slug, theme, width, isHero }) {
  const paddingX = isHero ? 88 : 72;
  const paddingY = isHero ? 78 : 58;
  const titleFontSize = isHero ? 82 : 68;
  const titleLineHeight = isHero ? 1.22 : 1.18;
  const descriptionFontSize = isHero ? 30 : 24;
  const badgeFontSize = isHero ? 24 : 20;
  const footerFontSize = isHero ? 24 : 19;
  const titleMaxWidth = isHero ? width - paddingX * 2 - 160 : width - paddingX * 2 - 120;
  const tagText = Array.isArray(tags) && tags.length > 0 ? tags.slice(0, 2).join(" / ") : theme.label;

  return {
    type: "div",
    props: {
      style: {
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        overflow: "hidden",
        fontFamily: "Microsoft YaHei",
        background: theme.gradient,
        color: "#f8fafc",
      },
      children: [
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              inset: "0",
              background:
                "radial-gradient(circle at top right, rgba(255,255,255,0.22), transparent 34%), radial-gradient(circle at bottom left, rgba(255,255,255,0.12), transparent 36%)",
            },
          },
        },
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              top: "-18%",
              right: "-8%",
              width: isHero ? 420 : 320,
              height: isHero ? 420 : 320,
              borderRadius: "999px",
              background: theme.accentSoft,
              border: `2px solid ${theme.accent}`,
            },
          },
        },
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              bottom: isHero ? 54 : 42,
              right: isHero ? 68 : 52,
              width: isHero ? 220 : 180,
              height: isHero ? 220 : 180,
              borderRadius: "28px",
              border: `2px solid ${theme.accent}`,
              opacity: "0.88",
            },
          },
        },
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              inset: "28px",
              borderRadius: "34px",
              border: "1px solid rgba(255,255,255,0.16)",
            },
          },
        },
        {
          type: "div",
          props: {
            style: {
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              padding: `${paddingY}px ${paddingX}px`,
            },
            children: [
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  },
                  children: [
                    {
                      type: "div",
                      props: {
                        style: {
                          display: "flex",
                          alignItems: "center",
                          gap: "14px",
                          padding: isHero ? "14px 24px" : "12px 20px",
                          borderRadius: "999px",
                          background: "rgba(2, 6, 23, 0.32)",
                          border: `1px solid ${theme.accent}`,
                          color: "#e2e8f0",
                          fontSize: badgeFontSize,
                          fontWeight: 700,
                          letterSpacing: "1px",
                        },
                        children: [
                          {
                            type: "span",
                            props: {
                              style: {
                                color: theme.accent,
                              },
                              children: theme.label,
                            },
                          },
                          {
                            type: "span",
                            props: {
                              style: { opacity: "0.8" },
                              children: tagText,
                            },
                          },
                        ],
                      },
                    },
                    {
                      type: "div",
                      props: {
                        style: {
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-end",
                          gap: "8px",
                          color: "rgba(226,232,240,0.88)",
                          fontSize: isHero ? 22 : 18,
                          fontFamily: "Consolas",
                          textAlign: "right",
                        },
                        children: [
                          { type: "span", props: { children: `/${slug}` } },
                          { type: "span", props: { children: "chenguitao.com" } },
                        ],
                      },
                    },
                  ],
                },
              },
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    flexDirection: "column",
                    gap: isHero ? "28px" : "20px",
                    maxWidth: titleMaxWidth,
                  },
                  children: [
                    {
                      type: "div",
                      props: {
                        style: {
                          fontSize: titleFontSize,
                          lineHeight: titleLineHeight,
                          fontWeight: 700,
                          letterSpacing: "-1px",
                          maxHeight: isHero ? "300px" : "246px",
                          overflow: "hidden",
                        },
                        children: title,
                      },
                    },
                    {
                      type: "div",
                      props: {
                        style: {
                          maxWidth: isHero ? width - paddingX * 2 - 220 : width - paddingX * 2 - 160,
                          color: "rgba(226,232,240,0.86)",
                          fontSize: descriptionFontSize,
                          lineHeight: 1.5,
                          maxHeight: isHero ? "92px" : "74px",
                          overflow: "hidden",
                        },
                        children: description,
                      },
                    },
                  ],
                },
              },
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    color: "rgba(226,232,240,0.86)",
                    fontSize: footerFontSize,
                  },
                  children: [
                    {
                      type: "span",
                      props: {
                        style: {
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        },
                        children: [
                          {
                            type: "span",
                            props: {
                              style: {
                                width: isHero ? "14px" : "12px",
                                height: isHero ? "14px" : "12px",
                                borderRadius: "999px",
                                background: theme.accent,
                              },
                            },
                          },
                          { type: "span", props: { children: "Perimsx / 记录成长，分享价值" } },
                        ],
                      },
                    },
                    {
                      type: "span",
                      props: {
                        style: {
                          padding: isHero ? "12px 20px" : "10px 16px",
                          borderRadius: "999px",
                          background: "rgba(15, 23, 42, 0.34)",
                          border: "1px solid rgba(255,255,255,0.14)",
                        },
                        children: isHero ? "Article Cover" : "Social Preview",
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
      ],
    },
  };
}
