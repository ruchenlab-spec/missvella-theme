# Color & Fabric Guide

2026-11-19：按商家确认的页面方案实现两个独立 section。代码已上传当前线上主题 `167137378374`（Missvella Dev）；图片、内容、页面模板实例及菜单由商家配置。

## 文件及设计

| 文件 | 用途 |
|---|---|
| `theme/sections/color-guide.liquid` | Color Guide；色卡、可选色系、对应大图及商品／集合／客服链接 |
| `theme/sections/fabric-guide.liquid` | Fabric Guide；近景图＋裙装图、说明及 Finish / Drape / Feel |
| `theme/assets/material-guides.css` | 共用极简样式：主题字体／配色、细线、统一图幅、文字链接、明确焦点 |
| `theme/assets/color-guide.js` | 渐进增强色系筛选、详情切换、深链接、编辑器区块选择及事件清理 |

不预填任何颜色名称、面料特性、商品链接或实物照片；只有结构性英文标题和字段标签。新预设分别包含 4 个空 Color 区块和 3 个空 Fabric 区块。未填写名称的区块只在编辑器展示，前台不输出；编辑器中的图片占位说明不对顾客显示。空说明、事实字段及未配置链接不输出。

## 商家配置步骤

1. **Online Store → Themes → 当前主题 → Edit theme → Pages → Create template**：创建 `color-fabric-guide`，基于 Default page，避免修改共用默认模板。
2. 使用原生 Page 标题或 Heading/Text 区块设置唯一 H1：**Color & Fabric Guide**。两个 Guide section 自身使用 H2，区块名称用 H3。
3. 在新模板主体中添加 **Color Guide**，然后添加 **Fabric Guide**。
4. Color Guide 的每个 Color 区块配置准确名称、色系、色卡实拍图、大图、面料／款式说明、正文和链接。未填链接时没有空按钮；可使用商品、集合或客服入口。不要添加不存在的色样购买入口。
5. Fabric Guide 的每个 Fabric 区块配置准确名称、面料近景与对应裙装图、可选图片说明、正文，以及经过确认的 Finish（表面效果）、Drape（垂坠／轮廓）、Feel（触感／厚薄）。额外注意事项可填入 Specific style or care notes；留空的特征不显示。
6. 给图片填写准确 alt 文本。未设置 alt 时回退区块名称。Color 的大图默认完整显示，不裁切；缩略图为方形裁切。Fabric 图片默认 Show full image（完整显示），也可在 section 设置里选择 Fill image area（填满 4:5 图框）。
7. 可在两个 section 的 Introduction / guidance 中填写色差和选购说明，或添加原生 Text/Accordion/Contact 区块完成 **Before You Choose / Need Help Choosing?**。这些内容未由代码自动写入。
8. 在 **Online Store → Pages** 创建 `Color & Fabric Guide`，handle 设置为 `color-fabric-guide`，关联新模板。正文是否显示取决于所保留的原生 Page 区块，避免重复标题或说明。
9. 配置图片和文案并检查后，在 **Content → Menus** 中将页脚 **Color & Fabric Guide** 从 `/` 指向该 Page。菜单和页面关联由商家完成，代码任务没有代改。

## Color Guide 使用细节

- 支持最多 40 个颜色；桌面每行 4–6 个，默认 5；手机每行 2–3 个，默认 2。顺序按编辑器区块顺序。
- Color family 填写相同文本的区块归为同组；字段首尾空白会去除，大小写不同视为不同名称。配置后自动生成色系筛选，未配置色系时不显示筛选器。无色系区块仍在 All colors 中展示。
- 点击色卡会显示对应大图／说明并跳转到详情位置；当前色卡有细线选中边框和名称下划线。链接为真实片段地址，可复制、刷新及使用浏览器返回。
- 筛选后若原选择不在该色系，显示该色系首个颜色。打开其他色系的详情深链接或在编辑器选中被筛掉的区块时，恢复 All colors 并展示目标颜色。
- 可只提供一张图片：缺少大图时使用色卡图；缺少色卡图时使用大图。两者都没有时，不虚构实物纹理；可配置 Fallback navigation color 作为纯色导航提示，大图区域省略。
- 不加载 JavaScript 时所有已配置详情正常显示，色卡链接直接跳转到对应详情，筛选器不显示。
- 每个 section 实例独立运行；编辑器重载／重新连接时重新初始化，并清理旧事件监听。

## Fabric Guide 使用细节

- 支持最多 16 种面料；桌面为左侧双图、右侧说明，手机先双图再说明。所有面料默认直接展开，便于连续比较。
- 只配置一张照片时，前台显示单图；两张都没有时使用纯文字版式。编辑器始终保留缺图提示，便于继续配置。
- 字段名 Finish / Drape / Feel 可在 section 设置中修改；内容在每个 Fabric 区块中修改。不要根据面料名称推断或承诺纤维成分、弹性、里布、透明度或统一护理方式。

## 页内入口与风格设置

- 默认页内地址：`/pages/color-fabric-guide#colors`、`/pages/color-fabric-guide#fabrics`。可用原生文本或按钮区块配置两个页内入口。
- Page anchor 会转为适合 URL 的格式；同页添加多个同类 section 时，为各实例设置不同的 anchor。颜色详情 ID 自带 section/block ID，不会跨实例冲突。
- 留空背景和文字颜色继承主题配色；每个 section 都有独立上下间距。使用当前 Horizon 的 `contrast-override`，未新增不存在的 color scheme。
- 本页用实拍细节传达颜色和面料，不使用 AI 图片或 CSS 纹理冒充实物色卡。图片和描述需与实际商品对应。

## 检查与发布记录

- 一次 Theme Check：新增文件零错误／警告；全主题仍为现有 32 个 MatchingTranslations 错误、21 个警告。
- 两个 schema JSON、区块预设和设置引用通过校验；`node --check theme/assets/color-guide.js` 通过。
- 未进行浏览器交互／视觉回归或截图；商家配置后检查色系筛选、选择大图、链接和手机排版。
- `theme list` 已确认目标主题为 live；以下精确上传收到 Shopify CLI `was pushed successfully` 回执，未推送 `templates/*.json`、`sections/*.json` 或 `config/settings_data.json`。

```powershell
shopify theme push --store 6icwx6-yv.myshopify.com --theme 167137378374 --allow-live --path theme --only "sections/color-guide.liquid" --only "sections/fabric-guide.liquid" --only "assets/material-guides.css" --only "assets/color-guide.js" --nodelete
```

状态：代码已上线，待商家配置内容、关联页面和菜单后检查前台。Git 提交及同步回执见本次对话。
