# 序栈

> Coet — 技术栈上有序沉淀

基于 **Next.js 16** 构建的高性能技术博客，聚焦信息安全、Web 开发与前沿技术探索。

---

## 特性

### 写作体验
- **MDX 内容创作** — Markdown + JSX 混合写作，Callout、Grid、折叠块等丰富组件
- **Shiki 语法高亮** — 基于 tree-sitter 的精确着色，支持 16 种语言
- **自动目录生成** — 悬浮式 TOC，滚动联动与键盘导航

### 阅读体验
- **全站 SSG** — 构建时静态生成，毫秒级首屏加载
- **深色模式** — 系统跟随 + 手动切换，View Transitions 平滑过渡
- **Pagefind 搜索** — 无服务端依赖，构建时生成索引，毫秒级全文检索

### 互动功能
- **Twikoo 评论** — 面向静态博客的评论系统，支持邮件通知、管理面板与回复嵌套
- **访客分析** — 地理分布、浏览器/设备、来源追踪，纯前端收集无第三方依赖
- **联系表单** — 邮件直发，无需第三方服务

### 工程质量
- **TypeScript 严格模式** — 全项目类型覆盖，零 `any` 逃逸
- **Biome 一体化** — Lint + Format + Import 排序，Git Hooks 自动化
- **安全响应头** — CSP / HSTS / X-Frame-Options 等生产级配置
- **统一 API 格式** — `ApiResponse<T>` 类型系统，消除响应格式碎片化

---

## 技术栈

| 领域 | 技术 |
|------|------|
| 框架 | Next.js 16 (App Router) |
| 语言 | TypeScript 5.9 |
| 样式 | Tailwind CSS 4 |
| 内容 | MDX + Shiki |
| 搜索 | Pagefind |
| 动画 | Framer Motion |
| 评论 | Twikoo |
| 规范 | Biome + Husky |

---

## 快速开始

```bash
# 安装依赖
pnpm install

# 本地开发
pnpm dev

# 生产构建
pnpm build
```

> 搜索功能需完成一次完整构建后才能使用。

---

## 项目结构

```
src/
├── app/                      # Next.js App Router
│   ├── api/                  # API 路由
│   │   ├── comments/          # 评论 GET / POST
│   │   ├── contact/          # 联系表单邮件发送
│   │   ├── analytics/        # 页面追踪与快照
│   │   └── image/            # 图片代理（防盗链）
│   └── (site)/               # 站点页面路由
├── components/
│   ├── icons/                 # 矢量图标（navigation / social / misc）
│   ├── mdx/                  # MDX 渲染组件
│   ├── analytics/            # 分析追踪器
│   └── monitor/              # 数据看板
├── content/blog/             # 博客文章 (.md/.mdx)
├── features/
│   ├── comments/             # 评论系统（store + API + 组件）
│   └── analytics/             # 分析系统（store + monitor）
├── hooks/
│   ├── useTheme.ts           # 主题状态管理
│   ├── useSearch.ts         # Pagefind 搜索封装
│   └── useBackToTop.ts      # 返回顶部
├── lib/
│   ├── api.ts               # 统一 API 响应格式
│   ├── blog.ts              # MDX 解析与构建
│   ├── config.ts            # 站点配置
│   ├── seo.ts               # 元数据与 JSON-LD
│   ├── imageProxy.ts        # 图片代理规则
│   ├── request-meta.ts      # 请求元数据提取
│   └── html.ts              # HTML 转义工具
└── styles/
    ├── _variables.css       # CSS 变量与主题
    ├── _animations.css      # 动画定义
    └── _layout.css          # 布局样式
```

---

## 文章规范

每篇文章需在顶部包含以下元数据：

```yaml
---
title: "文章标题"
description: "用于 SEO 和搜索预览的简短描述"
pubDatetime: 2026-04-01T10:00:00+08:00
tags:
  - 安全
  - Web
url: "category/post-slug"     # 决定最终 URL
coverImage: "./covers/preview.png"
---
```

- 文章存放于 `src/content/blog/`，支持 `.md` 和 `.mdx`
- 图片建议放在文章同级或 `covers/` 目录下，使用相对路径
- `draft: true` 的文章仅在开发环境可见

---

## 架构亮点

### 评论系统
- 使用 Twikoo 作为静态博客评论后端
- 前端通过 CDN 挂载，支持 Vercel 地址或腾讯云环境 ID
- 评论按文章路径隔离，适配自定义 `url` 路由

## Twikoo 配置

在项目根目录创建 `.env.local`，至少填入以下变量：

```bash
NEXT_PUBLIC_TWIKOO_ENV_ID=https://your-twikoo-service.vercel.app
NEXT_PUBLIC_TWIKOO_LANG=zh-CN
NEXT_PUBLIC_TWIKOO_VERSION=1.7.7
```

- `NEXT_PUBLIC_TWIKOO_ENV_ID`
  腾讯云部署时填写环境 ID；部署到 Vercel / Netlify / 自建服务时填写完整服务地址
- `NEXT_PUBLIC_TWIKOO_REGION`
  仅腾讯云广州等非默认地域需要，例如 `ap-guangzhou`
- `NEXT_PUBLIC_TWIKOO_VERSION`
  需要与你部署的 Twikoo 后端版本保持一致

项目会自动判断加载哪种前端包：
- 腾讯云环境 ID：自动加载 `twikoo.all.min.js`
- Vercel / Netlify / 自建地址：自动加载 `twikoo.min.js`

Twikoo 官方文档：
- 前端接入：[twikoo.js.org/frontend](https://twikoo.js.org/frontend)
- 后端部署：[twikoo.js.org/backend](https://twikoo.js.org/backend)

### 图片代理
- 防盗链图片自动转发（支持知乎、微博、CSDN 等平台）
- DNS Rebinding 攻击防护
- 智能 Content-Type 检测与长期缓存

### 分析追踪
- 纯前端事件收集，无第三方依赖
- 支持页面浏览时长、跳出率追踪
- 数据看板展示访客分布与热门页面

---

## 部署

构建产物输出至 `out/` 目录，支持部署至：

- **Vercel** — 零配置部署（推荐）
- **Cloudflare Pages** — Edge 部署
- **任意静态托管** — Nginx / 对象存储

```bash
pnpm build
```

---

## License

代码基于 MIT 协议开源。
