# Color & Fabric Guide

2026-11-19：两个独立 section 增加店铺资料库模式。依据实际元字段和元对象制作内置内容，不修改商家模板、实例设置或原始元对象。

## 来源与已补齐内容

- Color：`shopify.color-pattern` → `shopify--color-pattern`，共 58 条。保留 56 个原始 HEX；Custom Color 不虚构色块；Rainbow 使用条目原有 `rainbow.jpg`。
- 按原 taxonomy 分组，16 个常规色系各选一张店内商品图并逐张核对。图片标注 **Color family reference — shown in …**，不是每个色号的实物色样。58 条英文说明已补齐。
- Fabric：`dress.fabric` → `dress_std_fabric`，按原 sort_order 展示 13 类型，补齐说明、Finish / Drape / Feel 及选购提示。11 类配有与商品面料元字段一致的店内图及商品链接。
- 面料双图为商品局部放大＋完整裙装，局部标注 **Garment detail**，不是独立面料实拍。拼接款注明具体部位：蕾丝上身、绉纱裙摆、欧根纱裙摆、丝绒上身等。没有生成、购买或上传外部素材。
- 共引用 26 张不同店内图片，已逐张通过 Liquid `images[filename].width` 确认可读取。使用 Shopify 响应式图片和懒加载，不依赖 `all_products` 对象数量限制。
- 读取公开目录 1,020 款用于候选筛选；并非每件都验证面料字段。入选的 11 类面料商品已逐项核对字段。图片只称店内商品图，不承诺其摄影来源。
- 一般术语参考 [Mood Fabric Dictionary](https://www.moodfabrics.com/pages/fabric-dictionary) 和 [Dress and Textile Specialists](https://www.dressandtextilespecialists.org.uk/wp-content/uploads/2025/08/Identifying-Fibres-and-Fabrics.pdf)。不承诺统一成分、弹性比例、里布或护理方式；Satin 不等于 Silk，Sequin Fabric 不等于零星亮片装饰。

### 素材缺口与原数据问题

| 类型 | 核实结果 | 当前处理 |
|---|---|---|
| Stretch Satin | 标题写 Stretch Satin 的候选原字段为 Satin；两款 Elastic Satin 婚纱字段为空 | 类型及文案齐全，暂缺图，待核实实际面料 |
| Taffeta | 两款标题写 Taffeta 的候选原字段均为 Satin | 类型及文案齐全，暂缺图，待核实实际面料 |

未把冲突候选误归类，也未修改原字段。Custom Color 无统一实物色样，使用定制咨询提示。

原色值 Navy `#282099`、Slate Blue `#6a5acd` 偏紫，Mauve 为 `#9289bc`。保留原值，并在英文描述中提示数字参考，不根据名称重新染色。

## 编辑器启用与修改

现有页面：在 **Color Guide** 开启 **Use store color catalog**，在 **Fabric Guide** 开启 **Use store fabric catalog**，保存。新开关默认关闭，保护原手动配置。

新增页面：可直接添加 **Color Guide — Catalog** 和 **Fabric Guide — Catalog** 预设；已开启资料库并填好介绍。原空白预设继续保留。

1. 要改某条内容，添加 Color / Fabric 区块，名称填写原名称，例如 `Dusty Blue`、`Stretch Satin`。匹配忽略大小写及首尾空格，同名只使用首个区块。
2. 非空图片、说明、特征、链接覆盖默认内容；留空继续用默认值。颜色的 Fabric or style reference 可填写新图说明。
3. **Remove built-in catalog photograph** 移除内置图，上传图仍优先；**Hide this catalog entry** 隐藏条目。
4. Fabric 自填 Fabric close-up 替换默认放大图；自填 Dress photograph 后停止使用原图局部，避免误认为同一套图。
5. 不匹配名称的区块在资料库模式下不输出。要新增其他类型、按区块重排或完全手动配置，关闭资料库模式。

58 色超过 Shopify 单 section 50 区块上限，所以完整列表由代码渲染，最多 50 个 Color 区块用于覆盖。Fabric 最多 16 块。资料库顺序固定为颜色名称顺序及面料 sort_order，不随覆盖区块重排。

独立页面模板、Page 关联、唯一 H1 和菜单由商家配置。页内入口默认 `#colors`、`#fabrics`；重复 section 使用不同 anchor。若页脚仍指向 `/`，需在后台改为 `/pages/color-fabric-guide`。

颜色保留筛选、详情切换、深链接、编辑器区块联动及无 JS 降级。2026-11-19 按商家反馈改为紧凑色系分组：JavaScript 按最终 Color family（含区块覆盖）合并同色系卡片，显示色系标题；分组及组内顺序按首次出现顺序。桌面两列分组、手机单列，每组色卡自动换行。未填色系的卡片放在无标题的一组。

色块默认 48px，可通过 **Color chip size** 调至 32–72px；取代旧的桌面／手机列数设置。名称为 12px，色卡间距 12px／16px，保留至少 44px 可点击宽高。缩略图采用最高 144px 的响应式图片。筛选时同时隐藏空组，深链接和编辑器选择可恢复对应组。没有 JavaScript 时仍显示紧凑平铺列表及全部详情，不输出分组标题。

面料保持桌面双图＋说明、手机纵排。继承原主题字体和配色，使用细线与克制间距。

## 代码与维护

- `data/material-guide-catalog.json`：原始字段记录、HEX、分类、图片 URL、商品 handle、文案与素材缺口。
- `scripts/build-material-guide-catalog.cjs`：生成两个资料库调用文件，并验证重名和 Liquid 参数。
- `theme/snippets/guide-color-catalog.liquid`、`guide-fabric-catalog.liquid`：自动生成的内容代码。
- `theme/snippets/guide-color-entry.liquid`、`guide-fabric-entry.liquid`：渲染及同名区块覆盖。
- `theme/sections/color-guide.liquid`、`fabric-guide.liquid`：开关、schema、预设。
- `theme/assets/material-guides.css`：共用样式；`color-guide.js`：色系分组、筛选、详情与编辑器联动。

资料库是 2026-11-19 的核对快照，不是元对象实时同步。源条目、图片或商品 URL 变化时，更新数据文件，运行 `node scripts/build-material-guide-catalog.cjs`，精确推送修改代码；不要改写实例 JSON。

## 检查与交付

本轮一次 Theme Check：改动文件零问题；原有 32 个 MatchingTranslations 错误、21 个警告未增加。验证了 58 色／13 面料、全部名称和 HEX、26 张图片解析、两个 schema 及默认开关／预设。局部放大增量另检查 Liquid 分支和 `git diff --check`，未重复全主题扫描。

未运行浏览器或截图回归，商家启用资料库后检查前台。发布范围仅两个 section、四个 snippet、一个 CSS；不含模板、section group 或 settings_data JSON，不改变原元对象、商品字段、菜单或线上实例。

发布状态：`theme list` 确认当前 live 为 `167137378374`（Missvella Dev）。仅精确上传上述 7 个代码文件，使用 `--only` 和 `--nodelete`；CLI 已返回 `was pushed successfully`。内容库待商家开启开关，另外两类面料待核实补图。数据、代码和文档纳入本次本地 Git 提交并同步 origin/main，临时素材下载和缓存不纳入提交。

紧凑分组后续调整：一次 JS 语法、schema JSON／设置引用与 diff 静态检查通过。确认 live 后，仅用 `--only` 精确推送 Color Guide section、颜色条目 snippet、共享 CSS 和颜色 JS，CLI 返回 `was pushed successfully`。未启动浏览器或新增渲染测试，未推送内容 JSON。代码及本说明提交并同步 origin/main。
