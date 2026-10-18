# 项目概览：现状、进度与决策

> 最后更新：2026-10-18

## 一、基本信息

| 项 | 值 |
|---|---|
| 店铺 | `6icwx6-yv.myshopify.com`（Missvella，组织 ID `236239148`，Grow 套餐） |
| 主题基线 | Shopify 官方 [Horizon](https://github.com/Shopify/horizon)（2026-10 版本，tarball 导入） |
| 线上主题（live） | **Missvella Dev** `#167137378374` |
| 本地代码 | `e:/Missvella_theme_shopify/theme/` |
| 登录账号 | `ruchenlab@gmail.com`（Shopify CLI 已授权） |
| 工作方式 | 开发者在 **Shopify 主题编辑器**里实时预览；代码改动由 AI 通过安全推送脚本同步 |

## 二、当前进度

### 已完成

| # | 事项 | 状态 |
|---|---|---|
| 1 | 环境搭建（Git / Node 24 / Shopify CLI 4.9.4） | ✅ |
| 2 | 基于 Horizon 初始化项目，`theme/` 子目录隔离上线文件 | ✅ |
| 3 | 合并旧 jimiss 开发包（21 个定制文件 + 5 处手工合并） | ✅ |
| 4 | 上线（主题已发布为 live） | ✅ |
| 5 | 新增「圆形集合轮播」section（多轮迭代至 v6） | ✅ |
| 6 | 箭头布局重构（独立三列、可调大小 32–72px） | ✅ |
| 7 | 圆形直径可调（0=自动，最大 320px） | ✅ |
| 8 | 安全推送工作流 + `scripts/push-live.ps1` | ✅ |
| 9 | 从线上回拉编辑器配置（`templates/index.json`、`config/settings_data.json`） | ✅ |

### 待办 / 待配置

| # | 事项 | 说明 |
|---|---|---|
| 1 | 20 处失效资源重新配置 | jimiss 店铺资源在 Missvella 店不存在，清单见 `architecture.md` 第 4 节 |
| 2 | AliReviews app 集成 | `product.json` 引用 `shopify://apps/ali-reviews/...`，需在 Missvella 店安装 app，或移除该区块 |
| 3 | 首页圆形集合上传自定义图 | 编辑器 → 圆形集合轮播 → 每个圆形区块上传图片/选集合 |
| 4 | 旧主题副本清理（可选） | 主题库里 4 个旧 Horizon / jimiss 副本未动 |

## 三、决策记录（ADR）

### D1 · 采用 Shopify CLI 而非 GitHub 自动同步
- **背景**：用户最初询问 GitHub 插件能否自动同步。
- **结论**：以 CLI 为主。GitHub 集成是单向同步（GitHub → Shopify）、push 即部署无质量门禁，且与 CLI 不能混用于同一主题。
- **影响**：发布流程为本地验证 → 安全推送 → live 即时生效。

### D2 · 主题文件集中在 `theme/` 子目录
- **结论**：项目根目录只放开发配置（`.gitignore`、脚本、文档），`theme/` 是唯一上线目录。
- **原因**：避免开发附件（zip、脚本、文档）混入主题上传。

### D3 · jimiss 主题采用「分层合并」
- **背景**：旧开发包基于较早期 Horizon，310 个文件与新版不同，混有官方版本差异与用户定制。
- **结论**：
  - 第 1 层：旧包独有定制文件（21 个）→ 全部并入；
  - 第 2 层：用户的实质修改（约 5 处手工合并）→ 并入当前新版；
  - 第 3 层：Horizon 官方版本演进（locales、多数 assets js、header/footer liquid）→ 保留新版。
- **判定手段**：schema 设置项差异对比（精确找出被改过的官方文件）+ 定制特征词扫描。

### D4 · 失效资源「先合并，后配置」
- **结论**：合并 jimiss 资源引用（图片/集合/视频）后，在主题编辑器里重新选资源；视频引用会导致模板上传失败，已清空。

### D5 · 圆形集合轮播：放弃原生分组标头，保留原生文本设置
- **背景**：原生 `group` 标头需要静态主题块，而 Shopify 限制「静态主题块不能与 section 本地块混用」（`ValidLocalBlocks`），且 `content_for 'block'` 的 `type`/`id` 必须是字符串字面量，无法动态渲染商家添加的区块。
- **结论**：标头用**自定义 `heading` 区块**，schema 完整复刻原生「文本」区块的设置项，渲染时调用主题原生 `render 'text'`，视觉与交互与原生一致。
- **取舍**：不追求「分组」的多子元素能力，换取「每个圆形可直接在编辑器传图」。

### D6 · 圆形项用 section 本地区块（非 metafield）
- **结论**：每个圆形是一个 `circle_collection` 区块（集合 / 自定义图片 / 自定义视频 / 自定义标题），在主题编辑器里直接配置。
- **放弃方案**：collection_list + 集合元字段（`custom.circle_image`）覆盖——虽然架构更「官方」，但配置入口分散在后台自定义数据里，体验差。

### D7 · 安全推送：只推代码，不推内容
- **背景**：全量 `theme push` 会把本地旧版 `templates/*.json`、`config/settings_data.json` 覆盖到线上，导致编辑器里配置的 Banner/图片丢失。
- **结论**：日常推送仅包含 `assets/ sections/ snippets/ blocks/ layout/ locales/`；改模板结构必须先 pull 线上版本。
- **落地**：`scripts/push-live.ps1`。

### D8 · 不启用本地预览服务
- **结论**：开发者以主题编辑器实时预览为主，不常驻 `shopify theme dev`（会占用端口并创建临时开发主题）。
- **影响**：代码改动通过安全推送同步到 live 主题，编辑器刷新即见。

## 四、变更时间线

| 日期 | 事件 |
|---|---|
| 2026-10-17 | 环境安装；Horizon 项目初始化；Git 仓库建立（`theme/` 结构） |
| 2026-10-17 | 创建 Missvella Dev 开发主题；开发者发布为 live |
| 2026-10-17 | 合并 jimiss 旧开发包（21 定制文件 + 5 手工合并），清理失效视频引用 |
| 2026-10-17 | 新增圆形集合轮播 v1（collection_list + 简化 heading） |
| 2026-10-17 | 圆形集合轮播 v2–v6 迭代（per-block → group 标头 → theme blocks → 本地块 + 原生文本样式） |
| 2026-10-17 | 箭头布局重构（三列 grid、独立列、尺寸可调）；圆形直径可调 |
| 2026-10-18 | 定位并修复「推送覆盖编辑器配置」问题；回拉线上内容；新增安全推送脚本与项目文档 |

## 五、Git 提交约定

- 提交信息用英文，首行概括，正文列要点（与历史提交风格一致）。
- 提交前确认 `git status` 干净、`theme check` 无新增错误。
- 不要提交：`theme_export_*.zip`、临时脚本、构建产物（已在 `.gitignore`）。
