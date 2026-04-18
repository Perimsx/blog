# 序栈

> 一个基于 Next.js 16 的中文技术博客，关注写作体验、阅读体验和可持续维护的工程细节。

## 项目简介

序栈是一个以内容为中心的博客项目，使用 `Next.js App Router + MDX + Tailwind CSS 4` 构建，兼顾静态页面的加载性能和动态能力的扩展空间。项目目前包含文章系统、标签页、悬浮目录、站内搜索、监控面板、图片代理和评论接入能力，并已经适配腾讯云 EdgeOne Pages 的 KV 统计存储方案。

## 亮点

- `MDX` 内容驱动：支持 Markdown 与 JSX 混写，适合技术文章、教程、说明文档等内容场景。
- `阅读体验优先`：提供目录联动、代码高亮、深浅色主题、文章分享、移动端悬浮操作按钮等细节体验。
- `静态站点 + 动态接口`：文章页与标签页可静态生成，分析接口、监控页、图片代理等能力走服务端路由。
- `站内搜索`：构建后自动生成 `Pagefind` 索引，无需额外搜索服务。
- `轻量统计监控`：支持页面浏览、停留时长、来源、设备、浏览器、地区等维度，并提供 `/monitor` 可视化面板。
- `腾讯云 Pages 友好`：生产环境统计优先写入 EdgeOne Pages KV，本地开发则回退到 `.data/analytics.local.json`。

## 技术栈

| 分类 | 方案 |
| --- | --- |
| 框架 | `Next.js 16` |
| 语言 | `TypeScript 5` |
| 样式 | `Tailwind CSS 4` |
| 内容系统 | `MDX` + `gray-matter` |
| 代码高亮 | `Shiki` |
| 动画 | `Framer Motion` |
| 图表 | `Recharts` |
| 搜索 | `Pagefind` |
| 评论 | `Twikoo` |
| PWA | `next-pwa` |
| 规范 | `Biome` + `Husky` |

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发环境

```bash
npm run dev
```

默认启动地址：

```text
http://127.0.0.1:3000
```

### 3. 生产构建

```bash
npm run build
```

说明：

- 构建完成后会自动执行 `postbuild`，为文章生成 `Pagefind` 搜索索引。
- 如果你只想做类型检查，可以运行 `npm run typecheck`。

## 常用脚本

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | 本地开发 |
| `npm run build` | 生产构建 |
| `npm run start` | 启动生产模式 |
| `npm run typecheck` | TypeScript 类型检查 |
| `npm run lint` | Biome lint |
| `npm run lint:fix` | 自动修复 lint 问题 |
| `npm run format` | 格式化源码 |
| `npm run check` | 运行 Biome check |

## 环境变量

项目当前提供以下环境变量入口：

```bash
NEXT_PUBLIC_TWIKOO_ENV_ID=https://your-twikoo-service.vercel.app
NEXT_PUBLIC_TWIKOO_REGION=
NEXT_PUBLIC_TWIKOO_LANG=zh-CN
NEXT_PUBLIC_TWIKOO_VERSION=1.7.7
ANALYTICS_KV_BINDING=cotovo
```

字段说明：

- `NEXT_PUBLIC_TWIKOO_ENV_ID`：Twikoo 服务地址或腾讯云环境 ID。
- `NEXT_PUBLIC_TWIKOO_REGION`：腾讯云非默认地域时可填写。
- `NEXT_PUBLIC_TWIKOO_LANG`：Twikoo 前端语言。
- `NEXT_PUBLIC_TWIKOO_VERSION`：Twikoo 前端版本。
- `ANALYTICS_KV_BINDING`：腾讯云 EdgeOne Pages KV 绑定变量名，默认使用 `cotovo`。

## 统计与监控

项目包含两条统计相关接口：

- `POST /api/analytics/track`
- `GET /api/analytics/snapshot`

当前存储策略：

- 本地开发：写入 `./.data/analytics.local.json`
- 腾讯云 EdgeOne Pages 生产环境：优先写入绑定的 KV 命名空间

如果你使用腾讯云 Pages 部署，需要先在控制台完成两件事：

1. 创建并绑定 KV 命名空间到项目。
2. 确认变量名与 `ANALYTICS_KV_BINDING` 一致，例如当前项目使用 `cotovo`。

说明：

- EdgeOne Pages KV 是最终一致性存储，监控面板数据可能存在短暂同步延迟。
- 监控页更适合轻量分析与运行观测，不建议把它当作严格财务口径的统计系统。

## 评论系统

评论功能基于 `Twikoo`，适合作为静态博客的轻量评论后端。

当前项目支持两种接法：

- 腾讯云环境 ID
- 自建 / Vercel / Netlify / 其他托管地址

如果未配置 `NEXT_PUBLIC_TWIKOO_ENV_ID`，前端会展示未开放提示，不会影响文章页正常访问。

## 目录结构

```text
src/
├── app/
│   ├── (site)/                # 站点页面
│   └── api/                   # API 路由
├── components/                # 通用组件
├── content/blog/              # 文章内容
├── features/
│   ├── analytics/             # 统计与监控
│   └── comments/              # 评论系统
├── hooks/                     # React Hooks
├── lib/                       # 配置、SEO、博客工具、请求工具等
└── styles/                    # 全局样式与变量
```

## 内容写作

文章位于 `src/content/blog/`，支持 `.md` 和 `.mdx`。

推荐 Frontmatter：

```yaml
---
title: "文章标题"
description: "用于列表页和 SEO 的简短摘要"
pubDatetime: 2026-04-01T10:00:00+08:00
tags:
  - 项目设计
  - Web
url: "category/post-slug"
coverImage: "./covers/preview.png"
draft: false
---
```

说明：

- `url` 决定文章最终路径。
- `tags` 会参与标签页与筛选逻辑。
- `draft: true` 的文章仅在开发环境展示。

## 部署说明

项目适合部署到支持 Next.js 全栈能力的平台，当前优先推荐：

- 腾讯云 `EdgeOne Pages`
- `Vercel`

如果你部署到腾讯云 EdgeOne Pages，建议同步确认：

- 已启用 Pages Functions
- 已绑定 KV 存储用于统计
- 已根据需要配置地理位置请求头透传

## 维护建议

- 提交前先运行 `npm run typecheck`
- 发布前至少运行一次 `npm run build`
- 如果修改了 PWA 或构建产物，记得确认 `public/sw.js` 是否需要随提交一起更新
- 如果监控统计部署在 EdgeOne Pages，请避免继续依赖本地 JSON 作为生产数据源

## License

本项目基于 `MIT` 协议开源。
