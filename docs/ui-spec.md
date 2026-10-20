# UI 规范

> 原则：**优先复用 Horizon 原生设计 token 与组件**，自定义模块只做必要的样式补充，保证与整站视觉一致。

## 一、设计 Token（CSS 变量）

### 颜色
| 变量 | 用途 |
|---|---|
| `--color-foreground` | 主文字色 |
| `--color-background` | 背景色 |
| `--color-primary-button-background` | 主按钮背景（箭头圆底也用此） |
| `--color-primary-button-text` | 主按钮文字/图标 |
| `--color-shadow` | 阴影 |

> 不要在自定义区块里写死品牌色；用上述变量，换主题配色时自动跟随。

### 字体
| 变量 | 用途 |
|---|---|
| `--font-heading--family` | 标题字体 |
| `--font-subheading--family` | 副标题字体 |
| `--font-body--family` | 正文字体 |
| `--font-accent--family` | 强调字体 |

### 动效
| 变量 | 默认 |
|---|---|
| `--hover-transition-duration` | 0.25s |
| `--hover-transition-timing` | ease-out |
| `--animation-speed` / `--animation-easing` | 主题全局动画 |

### 间距 / 尺寸
| 变量 | 说明 |
|---|---|
| `--page-margin` | 页面左右留白（移动 16px / 桌面 40px，含安全区） |
| `--padding-2xs / xs / sm / md / lg / xl` | 4px 基准间距序列 |
| `--minimum-touch-target` | 最小点击区（44px） |
| `--layer-heightened / --layer-overlay` | z-index 层级 |

## 二、间距规范

- 使用 `{% render 'spacing-style', settings: section.settings %}` 输出上下内边距，配合 schema 的 `padding-block-start/end` 设置项。
- 区块内边距用 `{% render 'spacing-padding', settings: block_settings %}`（支持四向）。
- 自定义 section 默认上下 36px（可与相邻区块视觉衔接）。
- 圆形之间默认 16px，可调 0–48px。

## 三、组件规范

### 轮播（slideshow）
- 统一使用主题原生 `<slideshow-component>` / `<slideshow-container>` / `<slideshow-slides>` / `<slideshow-slide>`。
- 翻页一次滚动一屏（scroll-snap + `scrollBy`），非无限循环时边界按钮 `disabled`。
- 箭头按钮规范：`width/height = var(--circle-arrow-size)`，图标 = 按钮 42%，`border-radius: 50%`（circle 形态），hover `scale(1.06)`，disabled `opacity: .25`。

### 文本块
- 复用 `snippets/text.liquid`（内部 `rte-formatter` + `text-block` 类），自动获得原生排版预设、宽度与内边距能力。
- 标题层级：区块标题用 `h2`，卡片标题 `h3`–`h4`，正文 `p`。

### 图片
- 统一 `image_url: width: 600 | image_tag: widths: '150, 300, 450, 600', sizes: '(max-width: 749px) 44vw, 20vw', loading: 'lazy'`。
- 图片比例：商品卡 `portrait_3_4`，圆形集合 `1:1`（`aspect-ratio: 1/1` + `border-radius: 50%` + `object-fit: cover`）。
- 无图时用 `placeholder_svg_tag`，填充色 `var(--color-foreground)`、透明度 0.35。

### 颜色筛选条（`cf-colour-bar`，极简线条风格）
- 色系项 = 14px 圆点 glyph + 0.18em 字距大写标签（`Jost`/主题正文体），**无填充无边框**；
- 选中态：标签细下划线（1px）+ 圆点双环（背景色 3px + 前景色 1px）。
- 展开面板：**细线风格**——透明背景 + 单条底部 1px 细线（无卡片/阴影/圆角），
  衬线组名 + `n selected of m` meta 行；色块 34px 圆横排（0.1em 大写名称），
  双环选中，超宽横向滚动（隐藏滚动条）。
- 质感：`swatch_texture` 设置（none/linen/satin/mesh/velvet）以 `::after` 叠加层作用于圆点。
- 面板为覆盖式（absolute，全行宽），z-index 12 高于产品网格。

### 按钮
- 优先使用原生 `button` / `link` 区块；自定义按钮复用 `button` 类族（`button-unstyled` 等）。

## 四、响应式断点

| 断点 | 用途 |
|---|---|
| `750px` | 主题主要断点（container query 与 media query 均用此值） |
| `990px` | 页头布局切换（Horizon 原生） |
| `screen and (min-width: 750px)` | 桌面样式 |

- 自定义 section 用 **container query**（`container-type: inline-size` + `@container`），避免依赖视口宽度。
- 每屏数量：桌面 3–8（默认 5），移动 1/2（默认 2）。

## 五、命名规范

- 自定义模块用 BEM-ish：`circle-collections__item`、`circle-collections__media`、`circle-collections__title`。
- 状态/变体用后缀：`--prev` / `--next`、`--shape-circle`、`--caret`。
- 定制 UI 统一使用 `mv-` 前缀（如 `mv-size-chart-drawer`、`mv-shared.css`），新代码沿用同一前缀，不要再引入其他前缀。
- 变量命名：CSS 自定义属性 `--circle-*`；Liquid 变量 snake_case。

## 六、无障碍与交互

- 箭头按钮必须有 `aria-label`（用主题翻译键 `accessibility.slideshow_previous/next`）。
- 图标装饰性元素加 `aria-hidden="true"`。
- 点击目标不小于 `--minimum-touch-target`（44px）。
- 尊重 `prefers-reduced-motion`（主题原生已处理平滑滚动）。
- 焦点可见：不要移除 `:focus-visible` 样式。

## 七、视觉验收清单

- [ ] 圆形图片为正圆，图片填满无留白（`object-fit: cover`）
- [ ] 圆形文字居中、大写、字距 1px（默认）
- [ ] 箭头为圆形底 + 白色箭头，不与圆形重叠，垂直居中于圆形行
- [ ] 箭头在首/末屏自动禁用并淡化
- [ ] 移动端每屏 2 个圆，箭头不遮挡圆形
- [ ] 换主题配色后所有元素跟随（无写死颜色）
- [ ] 编辑器中点击区块可正确定位（`block.shopify_attributes`）
