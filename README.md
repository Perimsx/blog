# Perimsx / 序栈

一个基于 **Next.js 15** 构建的极简、高性能技术博客。聚焦信息安全、Web 开发、算法笔记与个人知识沉淀。

本项目已由 Astro 架构全面迁移至 Next.js (Static Site Generation)，并在视觉密度、搜索体验与底层架构上进行了极致优化。

---

## 核心特性

- 🚀 **极致性能**：基于 Next.js 静态导出 (SSG)，全站预渲染，秒级首屏加载。
- 🎨 **精密视觉设计**：专注视觉密度与阅读节奏，支持深色模式切换、平滑的主题过渡动画（View Transitions）。
- 🔍 **智能检索引擎**：内置 **Pagefind** 全文搜索，支持毫秒级标题与章节索引，提供类 Spotlight 的交互体验。
- 📝 **深度 MDX 集成**：支持 Markdown/MDX 写作，集成 **Shiki** 高亮器、自动生成悬浮目录（TOC）、代码块复制功能。
- 🛠️ **稳健架构**：使用 Tailwind CSS 4 构建原子化样式系统，严格的类型检查与代码规范。
- 📈 **SEO 专家级优化**：自动生成 Sitemap、RSS、结构化数据 (JSON-LD)，支持 Canonical URL 与全量元数据控制。

## 技术栈

- **框架**: Next.js 15 (App Router)
- **样式**: Tailwind CSS 4
- **内容**: MDX + Shiki (Syntax Highlighting)
- **搜索**: Pagefind (Static Search Engine)
- **渲染**: Static Site Generation (SSG)
- **开发工具**: TypeScript, Biome (Linting & Formatting)

## 快速开始

### 1. 安装依赖

推荐使用 `pnpm` 以获得最佳的安装速度与依赖管理倾向。

```bash
pnpm install
```

### 2. 本地开发

```bash
pnpm dev
```

> **注意**：本地开发环境下，搜索功能需要先执行一次完整构建以生成索引。

### 3. 构建与部署

生成静态站点产物及其搜索索引：

```bash
pnpm build
```

构建结果将输出至 `out` 目录，可直接部署于 Vercel, Cloudflare Pages 或任何静态托管平台。

## 项目结构探照

```text
.
├── src/
│   ├── app/                # Next.js App Router (页面与全局配置)
│   ├── components/         # 核心 UI 组件
│   │   ├── icons/          # 向量图标库
│   │   ├── mdx/            # MDX 自定义渲染组件
│   │   └── ui/             # 通用基础组件
│   ├── content/
│   │   └── blog/           # 博客正文 (.md/.mdx) 与封面资源
│   ├── hooks/              # 自定义 React Hooks (Search, Scroll等)
│   ├── lib/                # 核心逻辑 (内容解析、配置、工具函数)
│   └── styles/             # Tailwind & 全局样式系统
├── public/                 # 静态公共资源
├── next.config.ts          # Next.js 配置 (含静态导出锁定)
└── package.json            # 项目依赖与脚本
```

## 写作规范

### Frontmatter 标准

每一篇文章均需在头部包含标准的元数据：

```yaml
---
title: "文章标题"
description: "精炼的文章摘要，将用于 SEO 与搜索预览"
pubDatetime: 2026-04-01T10:00:00+08:00
tags:
  - 标签1
  - 标签2
draft: false
url: "category/post-slug"
coverImage: "./covers/preview.png"
---
```

### 路由逻辑

- `url` 字段决定了文章的最终访问路径。
- 图片资源建议存放于文章同级或 `covers` 目录下，并使用相对路径引用。

## 维护建议

1. **原子化提交**：遵循 `feat(scope): message` 规范进行 Git 提交。
2. **构建验证**：在合并重大变更前，始终执行 `pnpm build` 以验证 SSG 与 Pagefind 索引的完整性。
3. **视觉一致性**：新增组件应严格遵循 `typography.css` 定义的垂直韵律与间距规范。

---

## 协议

本项目内容由 **Perimsx** 原创，遵循 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) 协议。代码部分基于 MIT 协议。
