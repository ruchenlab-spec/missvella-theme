# Missvella Shopify 主题开发项目

基于 Shopify 官方 **Horizon** 主题的深度定制，服务于 Missvella 店铺（`6icwx6-yv.myshopify.com`）。

> **新会话接手必读**：按顺序阅读 `docs/` 下的文档，尤其是 `docs/project.md`（现状与决策）和 `docs/workflow.md`（推送流程与禁止事项）。

## 目录结构

```
.
├── theme/                     # ★ 唯一上线到 Shopify 的内容
│   ├── assets/                # 样式、脚本、图片
│   ├── blocks/                # 主题区块
│   ├── config/                # ★ 店铺设置（编辑器写入，推送时勿覆盖）
│   ├── layout/                # 页面骨架
│   ├── locales/               # 多语言
│   ├── sections/              # 页面区块容器
│   ├── snippets/              # 可复用片段
│   ├── templates/             # ★ 页面模板与区块配置（编辑器写入，推送时勿覆盖）
│   └── .shopifyignore         # 上传到店铺时忽略的文件
├── scripts/
│   └── push-live.ps1          # 安全推送脚本（默认只推代码）
├── docs/                      # 项目文档（不上传店铺）
├── .gitignore
└── .gitattributes             # 统一 LF 换行
```

## 常用命令

```powershell
# 改完代码 → 安全推送（不覆盖编辑器里的配置）
.\scripts\push-live.ps1

# 需要改页面结构时：先拉线上最新，再改，再推
shopify theme pull --store 6icwx6-yv.myshopify.com --theme 167137378374 --only "templates/index.json" --path theme

# 主题静态检查（已知 3 个基线错误，见 docs/pitfalls.md）
shopify theme check --path theme
```

## 文档索引

| 文档 | 内容 |
|---|---|
| [docs/project.md](docs/project.md) | 项目概览、当前进度、决策记录（ADR）、变更时间线 |
| [docs/workflow.md](docs/workflow.md) | 环境、登录授权、推送与发布流程、开发习惯与禁止事项 |
| [docs/architecture.md](docs/architecture.md) | 主题架构、自定义模块清单、区块依赖关系 |
| [docs/ui-spec.md](docs/ui-spec.md) | UI 规范：设计 token、组件约定、间距字号、响应式断点 |
| [docs/pitfalls.md](docs/pitfalls.md) | 踩坑点清单（症状 / 原因 / 解决方案） |
