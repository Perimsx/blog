# Perimsx / 序栈

一个基于 Astro 构建的中文技术博客，聚焦信息安全、Web 开发、算法笔记与个人知识沉淀。

当前仓库已经围绕发文效率、搜索体验、SEO、封面资源、本地字体与文章路由做了较多定制，适合作为个人博客长期维护，而不是直接照搬模板使用。

## 项目定位

- 面向中文技术写作，内容以信息安全、渗透测试、应急响应、流量分析、算法与工程实践为主。
- 支持 Markdown / MDX 发文、自定义文章 URL、草稿与非公开文章控制。
- 内置 Pagefind 站内搜索、RSS、Sitemap、结构化数据、动态 OG 图与 PWA。
- 视觉与交互层做了定制，包括搜索弹窗、联系弹窗、深色模式动画与移动端适配。

## 技术栈

- Astro 5
- Tailwind CSS 4
- MDX
- Pagefind
- React 19
- Biome
- EdgeOne Astro Adapter
- Astro PWA

## 目录结构

```text
.
├── public/                     # 静态资源、PWA 配置、主题切换脚本
├── src/
│   ├── assets/                 # 站点图标与通用图片资源
│   ├── components/             # UI 组件与交互组件
│   ├── content/
│   │   └── blog/               # 博客正文与文章封面
│   │       ├── *.md            # 博客文章
│   │       └── covers/         # 本地封面资源
│   ├── layouts/                # 页面布局与文章详情布局
│   ├── pages/                  # 路由页面、API、RSS、OG 图入口
│   ├── styles/                 # 全局样式与排版样式
│   └── utils/                  # 路由、校验、搜索、OG 等工具函数
├── astro.config.mjs            # Astro 主配置
├── biome.json                  # 代码检查与格式化配置
├── package.json                # 依赖与脚本
└── README.md
```

## 常用命令

| 命令 | 说明 |
| --- | --- |
| `npm install` | 安装依赖 |
| `npm run dev` | 启动本地开发服务，默认端口 `3000` |
| `npm run build` | 生产构建并生成 Pagefind 搜索索引 |
| `npm run build:check` | 类型检查 + 构建 + 生成搜索索引 |
| `npm run preview` | 本地预览构建产物 |
| `npm run check` | 使用 Biome 检查代码 |
| `npm run format` | 使用 Biome 格式化源码 |

## 发文流程

### 1. 新建文章

在 [src/content/blog](/Users/Chen/Desktop/blog/src/content/blog) 下创建一篇 `.md` 或 `.mdx` 文件。

建议文件名直接使用文章标题，便于维护；真正的访问路径由 frontmatter 里的 `url` 决定。

### 2. 编写 frontmatter

最常用字段如下：

```md
---
title: 零信任落地实践
description: 从身份、设备、网络和审计四个维度梳理零信任落地路径。
pubDatetime: 2026-03-28T10:00:00+08:00
tags:
  - 零信任
  - 安全运营
draft: false
unlisted: false
featured: false
url: security/zero-trust-practice
coverImage: ./covers/your-cover.webp
---
```

字段规则以 [src/content.config.ts](/Users/Chen/Desktop/blog/src/content.config.ts) 为准。

### 3. 路由与可见性规则

- `url` 为必填，用于生成文章实际访问路径。
- `url` 必须唯一，不能包含非法路径段，也不能与分页等保留路径冲突。
- `draft: true` 的文章不会进入公开构建结果。
- `unlisted: true` 的文章会生成详情页，但不会出现在公开列表、首页与 RSS 中。
- 发布时间受 `pubDatetime` 控制，项目支持定时发布。

### 4. 封面规范

- 封面统一放在 [src/content/blog/covers](/Users/Chen/Desktop/blog/src/content/blog/covers)。
- 优先使用本地图片，不保留外链。
- 推荐比例为 `16:9`，便于列表页、详情页和分享图裁切。
- 每篇文章应使用独立封面，避免视觉重复。

### 5. 本地检查

发文前至少执行：

```bash
npm run build:check
```

如果要验证搜索、RSS、OG 图和 PWA，推荐再执行一次：

```bash
npm run preview
```

## 搜索与 SEO

- 搜索底层使用 Pagefind，构建后索引输出到 `dist/pagefind`。
- 头部搜索入口默认使用弹窗搜索；`/search` 页面作为兜底入口保留。
- 文章详情页支持 canonical、OG、Twitter Card、JSON-LD。
- 首页、归档页、标签页、404/500 均有单独标题和描述。

## 部署说明

当前仓库使用 [@edgeone/astro](https://www.npmjs.com/package/@edgeone/astro) 适配器，部署目标以 EdgeOne Pages 配置为准。

构建命令：

```bash
npm run build
```

如果你切换部署平台，优先检查这些文件：

- [astro.config.mjs](/Users/Chen/Desktop/blog/astro.config.mjs)
- [src/consts.ts](/Users/Chen/Desktop/blog/src/consts.ts)
- [src/pages/rss.xml.ts](/Users/Chen/Desktop/blog/src/pages/rss.xml.ts)
- [src/components/StructuredData.astro](/Users/Chen/Desktop/blog/src/components/StructuredData.astro)

## 常见排查

### 搜索弹窗没有结果

- 先执行 `npm run build`
- 再重启 `npm run dev`
- 如果只是想验证构建产物，直接用 `npm run preview`

### 文章打开 404

- 检查 frontmatter 的 `url` 是否正确
- 检查访问地址是否多了尾斜杠
- 检查是否误带了旧的 `/client/` 前缀

### 文章不显示在首页或归档

- 检查 `draft`
- 检查 `unlisted`
- 检查 `pubDatetime`
- 检查首页是否有额外年份筛选

### OG 图或封面异常

- 检查 `coverImage` 是否存在
- 检查图片路径是否仍在 `src/content/blog/covers`
- 检查构建时是否有图片处理警告

## 维护建议

- 每次批量改内容、封面或路由后，都执行一次 `npm run build:check`
- 搜索、封面和路由相关改动最好一起回归首页、文章页、归档页和 `/search`
- Git 提交尽量保持原子化，便于回滚和排查

## 说明

这个仓库基于 Astro 生态持续改造，但 README、结构和功能说明都以当前仓库实际实现为准，不对应任何第三方模板仓库的默认文档。
