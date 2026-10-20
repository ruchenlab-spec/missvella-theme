# 主题架构

## 一、整体结构

本主题基于 Shopify **Horizon**（新版 theme blocks 架构），并在此之上叠加三批定制：

1. **jimiss 旧开发包定制**（21 个文件 + 5 处官方文件的手工合并）
2. **原生自研模块**：`circle-collections`（圆形集合轮播）
3. **集合页筛选重设计**（Filters 区块 + 颜色分面 + 色板条，2026-10-18 起）

```
theme/
├── assets/       # base.css（官方）、bq-shared.css（定制）、*.js
├── blocks/       # 区块：官方 ~90 个 + 定制 6 个
├── config/       # settings_schema.json（代码）/ settings_data.json（商家值）
├── layout/       # theme.liquid（含定制引用）、password.liquid
├── locales/      # 40+ 语言（官方）
├── sections/     # 官方 40+ + 定制 6 个
├── snippets/     # 官方 100+ + 定制 8 个
└── templates/    # 页面模板（JSON 结构 + 商家配置）
```

## 二、自研模块：圆形集合轮播

**文件**：`sections/circle-collections.liquid`（约 900 行，含 schema 与样式）

### 结构

```
section.circle-collections
├── heading 区块 × N        → {% render 'text', block: block %}（原生文本渲染）
└── slideshow-component      → 主题原生轮播组件
    ├── button[ref=previous] → 箭头（grid 第 1 列）
    ├── slideshow-container  → grid 第 2 列
    │   └── slideshow-slides
    │       └── slideshow-slide × N（每个 = 一个 circle_collection 区块）
    └── button[ref=next]     → 箭头（grid 第 3 列）
```

### 布局原理

- 三列 grid 直接作用于 `slideshow-component`：`var(--circle-arrow-size) minmax(0,1fr) var(--circle-arrow-size)`
- 箭头是 `slideshow-container` 的**兄弟节点**，因此不被容器裁剪、可独立放大、垂直居中于圆形行
- 圆形宽度：`min(var(--circle-size), calc((100% - gap*(n-1)) / n))`
  - `--circle-size = 100%` 时自动填满列宽；设为 200px 等值时限制直径
  - 圆形变小时整行居中（`justify-content: safe center`）

### 区块

| 区块类型 | 作用域 | 关键设置 |
|---|---|---|
| `heading` | section 本地 | 富文本、宽度/最大宽度、排版预设、字体/字号/行高/字距/大小写/换行、文本颜色、背景色+圆角、内边距（与原生文本区块一致） |
| `circle_collection` | section 本地 | 集合（链接+默认标题）、自定义图片、自定义视频（优先）、自定义标题 |

### Section 设置

`columns`（3–8）、`mobile_columns`（1/2）、`circle_gap`、`circle_size`（0=自动，≤320px）、`title_case` / `title_font_size` / `title_letter_spacing` / `title_color`（圆形下方文字）、`icons_style`（arrow/chevron/large/none）、`icons_shape`（none/circle/square）、`arrow_size`（32–72px）、`section_width`、`background_color`、上下内边距。

### 媒体优先级

`custom_video` > `custom_image` > `collection.featured_image` > 占位图

## 三、自研模块：集合页筛选与颜色分面

> 2026-10-18 ~ 10-20 落地，迭代轮次最多的一块。目标：把官方 Filters 区块改成「顶部色板条 + 左侧边栏」的统一布局。

### 文件清单

| 文件 | 作用 |
|---|---|
| `blocks/filters.liquid` | 官方 Filters 区块的重写版本（顶部色板条 + 左侧边栏 + 抽屉），1538 行起 |
| `snippets/cf-colour-bar.liquid` | 顶部色板条组件（色卡胶囊 + 展开面板 + 右侧排序/数量/密度 + 行为脚本），从 `filters.liquid` 抽出 |
| `snippets/cf2-item.liquid` | 单个色板项（Soft Minimal 风格，保留原生 checkbox 管道以兼容 `facet-inputs-component`） |
| `snippets/list-filter.liquid` | 列表 / 色板类筛选渲染（垂直或横向），商家自定义颜色分组在此生效 |
| `snippets/color-facet-swatch.liquid` | 颜色名 → hex 映射（内置色值表 + 自定义覆盖） |
| `blocks/color-facets.liquid` | 颜色快捷筛选行（独立区块，`flat` / `family` 双模式） |
| `snippets/collection-wrapper-styles.liquid` | 集合页/搜索页共享布局样式 + 全部 `cf-*` 色板样式 |
| `snippets/aboreto-font.liquid` + `assets/aboreto-regular.ttf` | 新增字体（`theme.liquid`、`password.liquid` 引入） |
| `snippets/breadcrumbs.liquid` | 面包屑，改为全局渲染并接入主题设置 |

### 布局结构

```
section.main-collection
├── collection-wrapper（snippets/collection-wrapper-styles.liquid 提供样式）
│   ├── 顶部：filters block
│   │   ├── cf-colour-bar（snippets/cf-colour-bar.liquid）
│   │   │   ├── cf-bar-pills      → 色卡胶囊 × N（每族一个）+ Other
│   │   │   ├── cf-bar-panel      → 展开该色系的色板（cf2-item）
│   │   │   └── cf-bar-right      → 结果数量 + 排序 + 网格密度
│   │   └── facets（左侧边栏）    → 非颜色类筛选（价格 / 尺码 …）
│   └── 商品网格
└── 移动端：同样的 filters block 以抽屉形式呈现
```

### Filters 区块设置项

| 设置 | 说明 |
|---|---|
| `enable_filtering` | 是否显示筛选 |
| `swatch_texture` | 色卡织物纹理（linen / satin / mesh / velvet） |
| `color_group_map` | **商家颜色分组文本域**，每行 `组名:#色值:成员1,成员2`；为空时回退内置色卡 |
| `text_label_case` | 标签大小写 |
| `show_swatch_label` / `show_filter_label` | 是否显示色板名 / 筛选名 |
| `enable_sorting` / `enable_grid_density` | 是否显示排序 / 网格密度控件 |
| `background_color` / `text_color` | 筛选区配色 |
| `facets_margin_bottom` | 筛选区与商品网格的间距 |

### color-facets 区块设置项

`grouping`（flat / family）、`layout`、标题与文案（`title` / `show_all` / `all_label` / `back_label` / `show_label`）、`swatch_size` / `gap` / `label_size` / `alignment` / `active_style` / `ring_width` / `hover_lift` / `label_case`、四向内边距、`text_color` / `bg_color` / `bg_image` / `bg_overlay`、`custom_map`。

### 颜色分组的三层来源（优先级从高到低）

1. `color_group_map` 文本域（商家在编辑器粘贴）→ `color_group_map_value`
2. 内置色卡标准（`filters.liquid` 顶部的 capture 兜底）
3. `color-facet-swatch.liquid` 的内置色值表（`builtin_pairs`，用于单个色板取色）

### 关键约束

- `color-facets` 的 `family` 模式是两步交互：先点色系胶囊 → 再选该色系的子色板 → 可返回。
- 顶部条走 `url_to_add` / `url_to_remove` 跳转（`cf2-item` 的 `navigate: true`），因此**不会清掉其他已选的筛选**；侧边栏仍用原生 facet 表单。
- 颜色筛选识别同时兼容 Shopify 分类法（`filter.v.t.shopify.color-pattern`）与自定义选项（`option.color` / `option.colour` / `颜色`）。
- `filters.liquid` 内的 `closest.collection` 在嵌套上下文里 filters 不完整，颜色筛选数据取自 `results.filters`。

## 四、jimiss 合并进来的模块

### 定制 Section

| 文件 | 名称 | 说明 |
|---|---|---|
| `sections/hero-slideshow.liquid` | Hero Slideshow | 首页轮播（slide 子区块：图/视频/文案/按钮） |
| `sections/icon-features.liquid` | Icon Features | 图标特性行（内联 SVG 图标） |
| `sections/ins-media-grid-autoplay.liquid` | INS 媒体展示 | Instagram 视频网格（传统 section + `for block in section.blocks`） |
| `sections/size-guide.liquid` | 尺码指南 | 独立尺码页区块 |

### 定制 Blocks

| 文件 | 说明 |
|---|---|
| `blocks/color-swatch-picker.liquid` | 颜色色板选择器（1151 行） |
| `blocks/coupon-codes.liquid` | 优惠券列表（776 行） |
| `blocks/custom-sizes.liquid` | 自定义尺寸输入（1325 行） |

### 定制 Snippets

| 文件 | 说明 |
|---|---|
| `snippets/fonts.liquid` | 字体引入（在 `theme.liquid` 中 render） |
| `snippets/hero-slide.liquid` | Hero 单个 slide 渲染 |
| `snippets/alireviews_aggregateRating.liquid` | AliReviews 评价结构化数据（在 `header.liquid` 末尾 include） |

### 定制资源

| 文件 | 说明 |
|---|---|
| `assets/bq-shared.css` | 定制样式总表（尺寸表抽屉、色板、优惠券等），在 `theme.liquid` 引入 |
| `assets/product-form copy.js` | 定制表单脚本副本（**注意：文件名含空格，未被引用，待清理或合并**） |
| `assets/custom-color-icon.svg` / `custom-size-icon.svg` / `size-chart-icon.svg` / `size-chart-how-to-measure.png` | 图标与尺码图 |

### 对官方文件的手工合并（5 处）

| 文件 | 合并内容 |
|---|---|
| `layout/theme.liquid` | 加回 `{% render 'fonts' %}` 与 `{{ 'bq-shared.css' | asset_url | stylesheet_tag }}` |
| `blocks/variant-picker.liquid` | 加回「尺码表」header + `show_size_chart` 设置；render 时传 `block: block` |
| `snippets/variant-main-picker.liquid` | **整体采用旧包版本**（尺码表抽屉、颜色选择器、自定义尺寸与该文件结构深度耦合） |
| `assets/product-form.js` | 移植加购时捕获 `properties[...]` 并随批量加购提交 |
| `sections/header.liquid` | 末尾追加 `{% include 'alireviews_aggregateRating' %}` |

## 五、失效资源清单（jimiss 店铺资源，需在 Missvella 店重新配置）

> 合并时的记录。图片可在编辑器重新选择，或向 Missvella 店上传**同名文件**后自动生效。

| 位置 | 资源 |
|---|---|
| `templates/index.json` → hero-slideshow | `shop_images/Generated_Image_August_31__2026_-_4_30PM_b745783a….jpg`、`2_2_9c2e4dbe….jpg`、`hero1.jpg`、`hero1-mob.jpg` |
| `templates/index.json` → 商品链接 | `products/blushing-pink-satin-tulle-a-line-sweetheart-mini-dress`、`products/daffodil-chiffon-a-line-sweetheart-zipper-back-floor-length-dress` |
| `templates/index.json` → ins-media | 5 个视频（已清空引用，需在编辑器重选） |
| `templates/page.about.json` | 3 张图（`Generated_Image…5_28PM.jpg`、`1_1_3_8506faa5….jpg`、`jimiss_hero1.jpg`）、3 个视频（已清空） |
| `templates/product.json` | `shop_images/HTMSM.png`（尺码测量图）、`shop_images/coupon_1.svg`（优惠券图标） |
| `sections/footer-group.json` | `shop_images/j-logo-w_4x-8.png`（jimiss logo） |
| ~~`templates/product.json`~~ | ~~`shopify://apps/ali-reviews/blocks/widget-box/…`~~ → **已在编辑器移除**（提交 `651abc0`）。`snippets/alireviews_aggregateRating.liquid` 仍保留，但只在商品页输出 |

## 六、数据流

```
商家在主题编辑器改内容
        ↓
Shopify 写回线上主题的 templates/*.json、config/settings_data.json
        ↓
（本地不同步）→ 推送前必须 `theme pull` 这两类文件
        ↓
开发者/AI 改代码（sections/snippets/blocks/assets/layout/locales）
        ↓
scripts/push-live.ps1（只推代码）
        ↓
live 主题更新 → 编辑器刷新可见 → 前台即时生效
```

## 七、横向（左右）边距能力

- 全局页面宽度仍由「主题设置 → 布局 → 页面宽度」控制（narrow 1440px / normal 1920px / wide 2400px）。
- **全宽模式下的左右留白**：以下 16 个 section 已支持「左/右边距」独立设置（0–100px，默认 0），走主题原生 `spacing-style` → `.spacing-style` 的 `padding-inline`：
  `carousel, collection-links, collection-list, featured-blog-posts, footer-utilities, footer, hero, logo, main-404, main-cart, main-collection-list, media-with-content, password, product-hotspots, product-list, product-recommendations`
- `circle-collections` 单独实现：左右边距设置默认 40px，且**仅在 full-width 模式生效**（page-width 模式保持 0，避免与 `--page-margin` 双重留白）。
- 不支持该设置的 section（`header`、`header-announcements`、`slideshow`、`layered-slideshow`、`section`、`custom-liquid`、`divider`、`_blocks`）未使用 `spacing-style`，全宽边距需单独改 CSS；其中 header / slideshow 的全宽铺满属于设计意图。

## 八、依赖关系要点

- `circle-collections` 依赖：`snippets/slideshow.liquid`、`slideshow-slide`、`slideshow-styles`、`snippets/text.liquid`、`snippets/spacing-style.liquid`、`slideshow.js`（Web Component）。
- 箭头按钮必须位于 `<slideshow-component>` 内且带 `ref="previous" / "next"` + `on:click="/previous"`，否则不会与轮播组件绑定。
- `bq-shared.css` 与 `fonts.liquid` 必须在 `theme.liquid` 的 `<head>` 中被引用，否则定制样式与字体不生效。
- 色板条依赖链：`filters.liquid` → `cf-colour-bar.liquid` → `cf2-item.liquid` → `color-facet-swatch.liquid`；`cf-colour-bar` 内的色板项又依赖 `list-filter.liquid` 传下来的 `builtin_pairs`。
- **`cf-colour-bar.liquid` 内没有 `block` 作用域**：snippet 只能拿到显式 `render` 传入的参数，涉及 `block.settings` 的取值必须在 `filters.liquid` 侧取出后传入（见 `swatch_texture` / `enable_sorting` / `enable_grid_density` / `section_id`）。
- `collection-wrapper-styles.liquid` 承载全部 `cf-*` 样式与集合页布局，它由 `sections/main-collection.liquid` 渲染，色板条样式依赖它先被渲染。
