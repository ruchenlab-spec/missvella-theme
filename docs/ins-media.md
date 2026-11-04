# INS 媒体展示

实现文件：`theme/sections/ins-media-grid-autoplay.liquid`、`theme/snippets/ins-media-text.liquid`。

## 宽度与版式（2026-11-04）

- 宽度使用主题原生 `section--page-width` / `section--full-width` 网格，编辑器选择「页面宽度／全宽」。页面宽度跟随全局布局，不再使用独立的最大宽度。
- 全宽模式提供独立左、右边距（0–100px），复用 `spacing-style` 的响应式缩放。页面宽度模式不叠加这两个边距。
- 排版使用可重复添加的本地「文本样式」区块，每个区块通过「应用于」选择引导文字、标题、副标题、账号、说明文字或按钮文字。布局、排版、外观、内边距设置直接沿用 `blocks/text.liquid` 的原生定义，仅排除内容输入框；一套 schema 服务所有文字位置，不在 section 里重复六组字体控件。
- `ins-media-text` 仅匹配样式区块，并把已有文案作为 `fallback_text` 传给主题原生 `render 'text'`。字体变量、自定义字号响应式计算和样式全部复用 `text` → `typography-style`、`text-block-styles`、`spacing-padding` 和 `base.css`；未修改这些公共组件，未新增字体 CSS。
- 原生排版完整提供「默认、段落、标题 1–6、自定义」；自定义字体、字号、行高、字距、大小写和换行沿用原生条件显示。外观、背景及内边距同样由原生文本渲染器处理。删除上一版六个简化预设下拉框，以及文字透明度和颜色 CSS 覆盖。
- 未添加样式区块时，已有内容以主题默认语义排版显示（标题为 H2，其余为段落／按钮内文字）。悬停说明和媒体下方说明可共用一个说明文字样式。原有颜色作为后备值，原生文本颜色设置可覆盖它。
- 删除底部分页圆点及其 CSS、DOM 和 JavaScript。箭头和触摸滑动仍逐列切换；初始状态与响应式重建后会更新箭头禁用状态。
- 构建媒体模板时只遍历 `media_item`；`text_style` 不产生空白媒体卡片，也不影响轮播列数。

section 中没有最大宽度设置，宽度定义与原生 `product-list` 完全相同。原生文本样式区块自身的「最大宽度」是文本行宽设置，不控制 section 宽度。

旧 `full_width`、`outer_padding`、`max_width`、六个 `*_size` 和上一版六个 `*_preset` 设置退出使用。已有文案、媒体、链接、颜色和网格设置的 ID 保持不变；不迁移或推送模板实例数据。

## 编辑器使用

1. section 的「分区布局 → 宽度」选择「页面／全宽」。
2. 添加「文本样式」区块，在「应用于」选择需要设置的文字位置。
3. 使用区块中原生「排版 → 预设」及「自定义」等控件。内容仍在 section 原有文案字段中修改，无需复制文案。

每个文字位置使用一个样式区块；重复选择同一位置时，以区块顺序中的第一个为准。样式区块没有文本输入框，避免出现两份内容来源。Shopify 不允许 section 本地区块和静态主题区块混用，因此在本地样式区块中声明原生控件，并直接复用原生渲染器。

## 验证与部署状态

- 2026-11-04 实际运行 Theme Check：修改前后均为 32 个 error、23 个 warning，无新增问题；INS 文件原有两条图标作用域 warning 保持不变。
- schema JSON、内联 JavaScript 语法和 `git diff --check` 通过。
- Liquid 渲染验证通过：宽度 schema 与原生 section 完全相同，样式控件与原生 text block 完全相同；9 种预设、默认内容、自定义流式字号、样式区块不混入网格和空媒体网格均通过。使用 LiquidJS 执行本地模板验证，未操作线上实例数据。
- 上一版 JavaScript 行为模拟通过：桌面箭头及边界、移动双行和滑动、跨断点重建、空网格及无需翻页的网格；本次轮播 JavaScript 未修改。
- **已上线（2026-11-04）**：仅推送 section 和新适配 snippet 到线上主题 `Missvella Dev`（`167137378374`）。两个远端文件拉取至独立临时目录，与本地 SHA256 完全一致；未推送模板或商家设置数据，也未代商家添加样式区块。

远端 SHA256：section `04C5C1073A714E4AE07D3C51D82B29651379269FACEE20A3707D074FA61B9131`；snippet `5B95B868B553EB65780C3418351264FAA710B50FF6ED78FA935142797902C904`。

```powershell
shopify theme push --store 6icwx6-yv.myshopify.com --theme 167137378374 --allow-live --path theme --only "sections/ins-media-grid-autoplay.liquid" --only "snippets/ins-media-text.liquid"
```

禁止将本地 `templates/*.json`、`sections/*.json` 或 `config/settings_data.json` 与本次代码一起推送。
