# 主题架构

## 一、整体结构

本主题基于 Shopify **Horizon**（新版 theme blocks 架构），并在此之上叠加两批定制：

1. **jimiss 旧开发包定制**（21 个文件 + 5 处官方文件的手工合并）
2. **原生自研模块**：`circle-collections`（圆形集合轮播）

```
theme/
├── assets/       # base.css（官方）、bq-shared.css（定制）、*.js
├── blocks/       # 区块：官方 ~90 个 + 定制 3 个
├── config/       # settings_schema.json（代码）/ settings_data.json（商家值）
├── layout/       # theme.liquid（含定制引用）、password.liquid
├── locales/      # 40+ 语言（官方）
├── sections/     # 官方 40+ + 定制 6 个
├── snippets/     # 官方 100+ + 定制 3 个
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

## 三、jimiss 合并进来的模块

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

## 四、失效资源清单（jimiss 店铺资源，需在 Missvella 店重新配置）

> 合并时的记录。图片可在编辑器重新选择，或向 Missvella 店上传**同名文件**后自动生效。

| 位置 | 资源 |
|---|---|
| `templates/index.json` → hero-slideshow | `shop_images/Generated_Image_August_31__2026_-_4_30PM_b745783a….jpg`、`2_2_9c2e4dbe….jpg`、`hero1.jpg`、`hero1-mob.jpg` |
| `templates/index.json` → 商品链接 | `products/blushing-pink-satin-tulle-a-line-sweetheart-mini-dress`、`products/daffodil-chiffon-a-line-sweetheart-zipper-back-floor-length-dress` |
| `templates/index.json` → ins-media | 5 个视频（已清空引用，需在编辑器重选） |
| `templates/page.about.json` | 3 张图（`Generated_Image…5_28PM.jpg`、`1_1_3_8506faa5….jpg`、`jimiss_hero1.jpg`）、3 个视频（已清空） |
| `templates/product.json` | `shop_images/HTMSM.png`（尺码测量图）、`shop_images/coupon_1.svg`（优惠券图标） |
| `sections/footer-group.json` | `shop_images/j-logo-w_4x-8.png`（jimiss logo） |
| `templates/product.json` | `shopify://apps/ali-reviews/blocks/widget-box/…`（需安装 AliReviews app） |

## 五、数据流

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

## 六、依赖关系要点

- `circle-collections` 依赖：`snippets/slideshow.liquid`、`slideshow-slide`、`slideshow-styles`、`snippets/text.liquid`、`snippets/spacing-style.liquid`、`slideshow.js`（Web Component）。
- 箭头按钮必须位于 `<slideshow-component>` 内且带 `ref="previous" / "next"` + `on:click="/previous"`，否则不会与轮播组件绑定。
- `bq-shared.css` 与 `fonts.liquid` 必须在 `theme.liquid` 的 `<head>` 中被引用，否则定制样式与字体不生效。
