# INS 媒体展示 · Film strip

当前实现采用商家选定的 [Demo 02](https://missvella-social-concepts.abloom-elk-2020.chatgpt.site/02-afterhours.html) **下半部分**：标题与圆形翻页按钮、FRAME 编号横向画廊和标题上方的社交账号／图标。没有横幅、电影主视觉或独立站导航。

## 文件与复用

- `theme/sections/ins-media-grid-autoplay.liquid`：设置 schema、内容渲染、翻页与视频同步。
- `theme/assets/ins-media.css`：本 section 共用的布局和媒体 CSS；不再为每个实例输出整套重复 CSS。
- `theme/snippets/ins-media-text.liquid`：将原有内容交给原生 `text` 渲染器，继续复用 `typography-style`、`text-block-styles`、`spacing-padding` 和主题字体 CSS。
- 社交图标复用 `snippets/icon.liquid`；背景复用原生 `contrast-override` 的仅背景模式与 `section-background`。文字颜色通过原生文本变量传递。

## 编辑器控制

section 继续使用原生「页面／全宽」选择器和 `spacing-style`；没有 section 最大宽度项。全宽画廊额外沿用主题 `--page-margin` 作为内容留白，背景仍覆盖整个 section。页面宽度模式不叠加这层内容留白。

| 设置 | 默认值／行为 |
|---|---|
| 背景色 `background_color` | `#19110e` |
| 文字颜色 `text_color` | `#eee3d4`，用于副标题和媒体说明 |
| 标题与社交链接颜色 `accent_color` | `#d9af95`，同时用于翻页按钮及细线 |
| 桌面／手机媒体宽度 | 29%／75%，保留下一张的露出 |
| 桌面／手机媒体间距 | 22px／16px |
| 社交账号文字 `instagram_handle` | 保留原字段 ID；新 section 默认 `@missvella` |
| 社交图标 `social_platform` | Instagram／Pinterest／Facebook；默认 Instagram |
| 社交链接 `social_link` | 单独设置目标地址；图标选择不会改写链接 |

Instagram 链接留空时，代码回退到商家明确提供的 `https://www.instagram.com/missvella/`。Shopify 不接受将该外链直接写为 URL 设置的 schema 默认值，因此 schema 不含此默认值。Pinterest／Facebook 需在编辑器填写对应链接；未填写时只渲染账号和图标，不生成错误跳转。

所有颜色都可在 section 的「颜色」分组修改。原生「文本样式」区块的显式文本颜色仍可覆盖该位置的 section 后备颜色，遵循主题原生控制方式。

## 原生排版

添加「文本样式」本地区块，通过「应用于」选择标题、副标题、社交账号或媒体说明。布局、排版、外观、内边距沿用 `blocks/text.liquid` 的原生定义，仅排除内容输入框。一套控件服务所有文字位置，不重复六组字体逻辑。

排版完整提供「默认、段落、标题 1–6、自定义」；自定义字体、字号、行高、字距、大小写、换行按原生条件显示。内容继续在 section／媒体项目原有字段编辑，无需复制。重复选择同一文字位置时，以第一个样式区块为准。

引导文字与收尾文案已删除，对应 schema 设置、排版目标、渲染分支和 CSS 一并移除。社交账号文字与所选平台图标移至标题上方的原引导位置，底部不再重复显示。账号、平台和链接沿用原设置 ID，无需重新填写。标题始终原样渲染。

社交行按「图标 → 账号文字」排列，间距为 6px；编辑器分组名为「社交账号与图标」。当前 schema 不含「底部文案与社交链接」或收尾文案字段；若编辑器仍显示旧分组，刷新整个编辑器页面以重新加载设置定义。

## 横向画廊与媒体

- 单行浏览器原生滚动与 scroll-snap；触摸、触控板和可聚焦滚动区可直接操作。按钮每次滚动一张，尊重 reduced-motion 偏好，并兼容 RTL 方向。
- 卡片直接输出到 DOM，不再依赖 template 克隆、JavaScript 网格重建或 translateX。JavaScript 不可用时仍可原生滚动媒体。
- 翻页按钮移到标题右侧；无溢出时隐藏，到达边界时禁用。ResizeObserver 及窗口尺寸变化同步状态。
- 只渲染 `media_item` 为卡片；样式区块不会形成空卡片。独立媒体计数生成连续 `FRAME 01` 等编号，顺序跟随商家媒体区块。
- 说明行保留 FRAME 编号；「显示媒体说明文字」控制已有 caption 是否在编号旁显示。媒体悬停说明继续工作。
- 图片尺寸提示随桌面／手机媒体宽度更新；比例、裁切、悬停和 Shopify 托管视频设置继续使用原有内容和设置。
- 视频可见性、切后台暂停、手动暂停锁和控制条行为保留。开启原生视频控制条时不生成覆盖控件的整卡链接。

原多行／列数／网格间距控制被单行画廊宽度与间距控制替代；旧标题／说明颜色被上表颜色项替代；旧独立 CTA 按钮样式被标题上方的社交链接替代。旧实例值仍留在线上模板中，代码不再使用它们。图片、视频、现有标题等内容保留原字段和区块，不拉取或推送模板做迁移。新 section 的标题默认 `Scenes to keep.`，不会覆盖已保存的标题。

## 快速交付（2026-11-04）

本次仅进行 schema JSON 解析、针对性代码核对与 Shopify CLI 上传校验。不运行浏览器、截图、多尺寸回归或远端文件哈希比对，前台由商家自行检查。持续开发规范见 AGENTS.md「快速交付规范」和 workflow.md §3.1.1。

本次推送范围仅限 section 与 CSS；图片、媒体顺序及商家内容配置不推送。

已按此流程推送到 live 主题 `Missvella Dev`（`167137378374`），Shopify CLI 返回成功；未运行浏览器或截图验证。

```powershell
shopify theme push --store 6icwx6-yv.myshopify.com --theme 167137378374 --allow-live --path theme --only "sections/ins-media-grid-autoplay.liquid" --only "assets/ins-media.css"
```

不推送 `templates/*.json`、`sections/*.json` 或 `config/settings_data.json`。临时文件不纳入 Git 提交。
