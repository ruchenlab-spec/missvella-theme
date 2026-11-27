# Color & Fabric Guide

## 不等幅色块与浮雕题签 · HTML Demo

[新版独立 HTML](../demos/color-fabric-folio.html) 使用目录中的真实色值拼出桌面七块、手机五块的封面。中央棉纸题签上的标题是可选取的网页文字。点色块会进入相应色系并选中该色号。桌面目录以色样与礼服对开，手机目录以色带展开；商品按色系关联，面料入口保留八种面料的细节、垂感与实款。预览图片已内嵌，可离线打开。

<details><summary>题签素材制作记录</summary>

使用内置 imagegen 生成无字透明底素材，以 WebP 嵌入上述 HTML 的目录数据 `stock` 字段。生成提示词如下。

> Use case: product-mockup. A single blank rectangle of real warm ivory handmade cotton rag stationery, wide landscape proportion 1.55:1, photographed absolutely flat and face-on with no perspective, tightly framed with only 3% transparent space outside all four deckled hand-torn edges. Very fine irregular white paper fibers along the edges, subtly uneven natural thickness; the surface is warm bone white, tactile, quiet, uncreased fine cotton. Delicate fine uninked blind embossing of a slender herb stem with three or four leaves just on the lower left edge and a barely visible petal impression on the upper right edge. One small sprig per corner, NOT an ornate border. Leave the central 80% completely empty for typesetting with HTML. Absolutely no words, writing, numbers, motifs in center, stamps or logos, tape, props. Premium printer's sample photographed for a material archive in soft raking light from upper left. The impression reads by fine highlight and shadow on cream fibres. Transparent background with honest alpha, no tabletop. The whole sheet is visible, no curled corners. Soft contact shadow only.

</details>

## 纸纹样本卡 HTML Demo

[打开可交互 Demo](../demos/color-fabric-guide.html)。桌面左侧是色系索引，右侧样本板并列展示可选色块，下一行可横向浏览本色系的礼服。手机首张卡默认展开，点击露出的色带可切换卡片；色块和商品各有独立滑轨。Fabric library 以服装局部图、表面特征、垂感和手感展示 8 类面料。

示例内嵌目录快照中的 17 个色系、60 个颜色条目、商品缩略图和纸纹，保存单个 HTML 即可离线预览。商品链接指向店铺，礼服按色系关联；Multicolor & Custom 保留定制咨询入口。

2026-11-19：两个独立 section 增加店铺资料库模式。依据实际元字段和元对象制作内置内容，不修改商家模板、实例设置或原始元对象。

## 来源与已补齐内容

- 2026-11-24 通过 Shopify Liquid Console 读取 `shopify--color-pattern`，按条目总数和名称核对全部 60 条。58 条有 HEX，Rainbow 使用原图 `rainbow.jpg`，Custom Color 保留咨询入口。
- 相比 11 月 19 日新增 Fuchsia（`#E6007E`）和 Peach（`#F8C3AF`）。Fuchsia 的分类引用依次为 Red 和 Pink，指南沿用首个分类 Red；Peach 归入 Pink。两色沿用对应色系的示例照片和图注。
- 集合与搜索筛选、快速颜色筛选、独立 Collection Filters 和商品页 Color Swatch Picker 共用店铺色表。筛选只展示 Shopify 返回的筛选值；商品定制色抽屉默认采用 58 个单色色号。商家自定义列表继续生效，原版完整默认列表和 `Store catalog` 使用当前资料库。独立 Collection Filters 仍可清空字段来关闭色系栏。
- 按原 taxonomy 分组，16 个常规色系各选一张店内商品图并逐张核对。图片标注 **Color family reference — shown in …**，不是每个色号的实物色样。60 条英文说明已补齐。
- Fabric：来源 `dress.fabric` → `dress_std_fabric`，原 13 类型保留在数据档案。按商家最新要求，当前仅展示 **Satin、Chiffon、Tulle、Mesh、Lace、Crepe、Velvet、Sequin Fabric**，严格按该顺序生成资料库。8 类均有与商品元字段一致的店内图片、说明及商品链接。
- 面料双图为商品局部放大＋完整裙装，局部标注 **Garment detail**，不是独立面料实拍。拼接款注明具体部位：蕾丝上身、绉纱裙摆、欧根纱裙摆、丝绒上身等。没有生成、购买或上传外部素材。
- 初始资料库核验过 26 张店内图片；当前颜色＋8 类面料实际引用 24 张不同图片，均来自已核验来源。使用 Shopify 响应式图片和懒加载，不依赖 `all_products` 对象数量限制。
- 读取公开目录 1,020 款用于候选筛选；并非每件都验证面料字段。入选的 11 类面料商品已逐项核对字段。图片只称店内商品图，不承诺其摄影来源。
- 一般术语参考 [Mood Fabric Dictionary](https://www.moodfabrics.com/pages/fabric-dictionary) 和 [Dress and Textile Specialists](https://www.dressandtextilespecialists.org.uk/wp-content/uploads/2025/08/Identifying-Fibres-and-Fabrics.pdf)。不承诺统一成分、弹性比例、里布或护理方式；Satin 不等于 Silk，Sequin Fabric 不等于零星亮片装饰。

### 原始资料缺口留档（不在当前 8 类展示范围内）

| 类型 | 核实结果 | 当前处理 |
|---|---|---|
| Stretch Satin | 标题写 Stretch Satin 的候选原字段为 Satin；两款 Elastic Satin 婚纱字段为空 | 类型及文案齐全，暂缺图，待核实实际面料 |
| Taffeta | 两款标题写 Taffeta 的候选原字段均为 Satin | 类型及文案齐全，暂缺图，待核实实际面料 |

未把冲突候选误归类，也未修改原字段。Stretch Satin、Taffeta 及 Organza、Stretch Crepe、Knit 已退出当前页面展示；源数据仍保留。Custom Color 无统一实物色样，使用定制咨询提示。

原色值 Navy `#282099`、Slate Blue `#6a5acd` 偏紫，Mauve 为 `#9289bc`。保留原值，并在英文描述中提示数字参考，不根据名称重新染色。

## 编辑器启用与修改

现有页面：在 **Color Guide** 开启 **Use store color catalog**，在 **Fabric Guide** 开启 **Use store fabric catalog**，保存。新开关默认关闭，保护原手动配置。

新增页面：可直接添加 **Color Guide — Catalog** 和 **Fabric Guide — Catalog** 预设；已开启资料库并填好介绍。原空白预设继续保留。

1. 要改某条内容，添加 Color / Fabric 区块，名称填写原名称，例如 `Dusty Blue`、`Stretch Satin`。匹配忽略大小写及首尾空格，同名只使用首个区块。
2. 非空图片、说明、特征、链接覆盖默认内容；留空继续用默认值。颜色的 Fabric or style reference 可填写新图说明。
3. **Remove built-in catalog photograph** 移除内置图，上传图仍优先；**Hide this catalog entry** 隐藏条目。
4. Fabric 自填 Fabric close-up 替换默认放大图；自填 Dress photograph 后停止使用原图局部，避免误认为同一套图。
5. 不匹配名称的区块在资料库模式下不输出。颜色关闭资料库后可自行增补和重排。面料在资料库和手动模式下均只允许上述 8 种（忽略首尾空格与大小写）；其余已保存区块保留设置但不输出。手动模式仍按区块顺序展示允许的类型。

60 色超过 Shopify 单 section 50 区块上限，所以完整列表由代码渲染，最多 50 个 Color 区块用于覆盖。Fabric 最多 16 块以保留既有 schema 容量，但仅输出当前允许类型。资料库顺序固定为颜色名称顺序及 `fabricDisplayOrder`，不随覆盖区块重排。

独立页面模板、Page 关联、唯一 H1 和菜单由商家配置。页内入口默认 `#colors`、`#fabrics`；重复 section 使用不同 anchor。若页脚仍指向 `/`，需在后台改为 `/pages/color-fabric-guide`。

颜色保留筛选、详情切换、深链接、编辑器区块联动及无 JS 降级。2026-11-19 按商家反馈改为紧凑色系行：JavaScript 按最终 Color family（含区块覆盖）合并同色系卡片；分组及组内顺序按首次出现顺序。每个色系独占一行，名称固定在左侧（桌面 132px、手机 88px），右侧色卡单行横排；较多色卡在本行横向滚动，不撑宽页面。未填色系的卡片保留空名称列，色卡与其他组对齐。

色块默认 48px，可通过 **Color chip size** 调至 32–72px；取代旧的桌面／手机列数设置。名称为 12px，同行色卡间距 10px，每组上下各 6px（手机 4px），组间不额外留白。色卡可点击宽高至少 44px；滚动区内留 8px，容纳选中边框与键盘焦点。缩略图采用最高 144px 的响应式图片。筛选时同时隐藏空组，深链接和编辑器选择可恢复对应组。没有 JavaScript 时仍显示紧凑平铺列表及全部详情，不输出分组标题。

面料按最新反馈重新设计为两列图文卡片（990px 以下单列）：每张卡片左侧为面料局部主图与右下角小幅裙装图组合，右侧为轻量编号、20px 面料名称和 14px 简短说明。图片区宽 160px（手机 112px），双图时主图约 136px（手机 96px），保持紧凑；有一张图时正常单图显示，无图时文字占满。

Finish / Drape / Feel、图片部位说明及补充提示收进原生 **Fabric details** 折叠区域，默认收起；点击、键盘或无 JavaScript 环境均可展开。面料名称、说明和商品链接始终可见，未删减正文。Details label 可在 section 中修改。折叠入口与链接保持至少 44px 点击高度，名称较长时自然换行。颜色区的单行色系布局不变。

## 代码与维护

- `data/material-guide-catalog.json`：原始字段记录、HEX、分类、图片 URL、商品 handle、文案与素材缺口；`fabricDisplayOrder` 指定当前 8 类展示范围和顺序。
- `scripts/build-material-guide-catalog.cjs`：生成颜色和面料指南，以及筛选与选色器共用的 `color-catalog.liquid`。同时校验名称、HEX、分组及 Liquid 参数。
- `theme/snippets/guide-color-catalog.liquid`、`guide-fabric-catalog.liquid`：自动生成的内容代码。
- `theme/snippets/guide-color-entry.liquid`、`guide-fabric-entry.liquid`：渲染及同名区块覆盖。
- `theme/snippets/guide-custom-color-contact.liquid`：Custom Color 专属英文客服引导，提示提供裙装链接与目标颜色，订购前咨询 `hello@missvella.com`；可点击邮件链接预填主题 Custom Color Inquiry。资料库和手动模式共用，仅匹配 Custom Color（忽略大小写及首尾空格），不代发邮件。
- `theme/sections/color-guide.liquid`、`fabric-guide.liquid`：开关、schema、预设。
- `theme/assets/material-guides.css`：共用样式；`color-guide.js`：色系分组、筛选、详情与编辑器联动。

颜色资料库记录 2026-11-24 的核对快照，面料沿用 2026-11-19 快照。源条目、图片或商品 URL 变化时，更新数据文件，运行 `node scripts/build-material-guide-catalog.cjs`，精确推送修改代码；不要改写实例 JSON。

## 检查与交付

2026-11-24 已逐项核对线上 60 条原始记录、指南条目、筛选分组、58 个纯色 HEX 和选色器旧默认值的兼容路径。Theme Check 维持原有 32 项翻译错误及 21 项警告。Shopify CLI 已确认 13 个 Liquid 代码文件精确上传到 live 主题 Missvella Dev（167137378374）。

2026-11-20 Custom Color 联系入口：新增共用客服引导 snippet 并接入两种颜色展示模式，不覆盖商家文案或配置。邮件地址、mailto 主题、双模式接入与 diff 静态检查通过，确认 live 后仅精确推送 Color Guide section、颜色条目 snippet 和客服引导 snippet，CLI 返回 `was pushed successfully`。代码及文档提交并同步 origin/main，未启动浏览器或截图回归。

2026-11-20 居中修复：依据商家截图，将颜色详情图片改为等比自适应尺寸、水平居中；图注文字与详情标题居中。保留图片最大高度、完整显示及正文可读性，只改 `assets/material-guides.css`，不改任何实例内容。CSS 结构和 diff 检查通过，确认 live 后通过 `--only assets/material-guides.css --nodelete` 精确推送，CLI 返回 `was pushed successfully`。文档及代码提交并同步 origin/main，未启动浏览器或截图回归。

本轮一次 Theme Check：改动文件零问题；原有 32 个 MatchingTranslations 错误、21 个警告未增加。验证了 58 色／13 面料、全部名称和 HEX、26 张图片解析、两个 schema 及默认开关／预设。局部放大增量另检查 Liquid 分支和 `git diff --check`，未重复全主题扫描。

未运行浏览器或截图回归，商家启用资料库后检查前台。发布范围仅两个 section、四个 snippet、一个 CSS；不含模板、section group 或 settings_data JSON，不改变原元对象、商品字段、菜单或线上实例。

发布状态：`theme list` 确认当前 live 为 `167137378374`（Missvella Dev）。仅精确上传上述 7 个代码文件，使用 `--only` 和 `--nodelete`；CLI 已返回 `was pushed successfully`。内容库待商家开启开关，另外两类面料待核实补图。数据、代码和文档纳入本次本地 Git 提交并同步 origin/main，临时素材下载和缓存不纳入提交。

紧凑分组后续调整：一次 JS 语法、schema JSON／设置引用与 diff 静态检查通过。确认 live 后，仅用 `--only` 精确推送 Color Guide section、颜色条目 snippet、共享 CSS 和颜色 JS，CLI 返回 `was pushed successfully`。未启动浏览器或新增渲染测试，未推送内容 JSON。代码及本说明提交并同步 origin/main。

面料紧凑布局后续调整：一次 Theme Check 对改动文件零问题，原有 32 个翻译错误、21 个警告未增加，`git diff --check` 通过。确认当前 live 后，用 `--only` 与 `--nodelete` 仅推送 Fabric Guide section、面料条目 snippet、共享 CSS，CLI 已返回 `was pushed successfully`。未改内容数据或实例设置；文档及代码提交并同步 origin/main。按快速交付规范未做浏览器或截图回归。

颜色单行布局后续调整：仅修改共享 CSS 中颜色分组的布局规则，不改 JavaScript、数据或实例设置。CSS 括号结构、diff 空白检查及规则审阅通过；确认 live 后仅用 `--only assets/material-guides.css` 和 `--nodelete` 精确上传，CLI 已返回 `was pushed successfully`。未启动浏览器或截图回归；代码和文档提交并同步 origin/main。

8 类面料卡片改版：一次 Theme Check 对改动文件零问题，原有 32 个翻译错误／21 个警告未增加。静态验证生成列表恰为指定 8 类且顺序一致，手动模式允许名单一致、图片引用已存在、schema 设置引用和 diff 检查通过。确认当前 live 后，仅精确推送 Fabric Guide section、两个面料 snippet 及共享 CSS，CLI 返回 `was pushed successfully`；数据档案与生成脚本仅进入 Git，不上传内容 JSON。代码、数据和文档提交并同步 origin/main。前台由商家检查，未启动浏览器或截图回归。
