# Missvella 页脚关联页面优化计划

按下表顺序开七个独立对话。每次从「新对话开场指令」复制对应任务，并在本文件的进度表登记结果。运输与退货页面确认后，把最后的政策口径交给 FAQ 对话。Size Guide 和 How to Measure 分别验收，共用一个页面。

计划建立于 2026-11-18。页脚复核时，下表七个菜单项均指向首页 `/`。每项完成后，由商家在 Shopify 后台把对应菜单项连到正式目标。

## 任务与进度

| 顺序 | 页脚菜单项 | 目标 | 依赖 | 进度 |
|---|---|---|---|---|
| 1 | Processing & Shipping | 导读 Page `/pages/processing-shipping`（待商家创建）＋[正式运输政策](https://missvella.com/policies/shipping-policy) | 当前线上运输政策 | 代码已推送线上，待商家配置 |
| 2 | Returns & Refunds | [退货与退款政策](https://missvella.com/policies/refund-policy) | 当前线上退款政策 | 2026-11-26 已发布顶部速查表、仓库收件人和 48 小时退款处理时限 |
| 3 | FAQs | [FAQ](https://missvella.com/pages/faqs) | 第 1、2 项的最终政策口径和现有英文草案 | 43 问草案已完成，待核对和制作预设 |
| 4 | Size Guide | [尺码指南](https://missvella.com/pages/size-guide) | 当前尺码表和商品页入口 | 待开始 |
| 5 | How to Measure | [尺码指南里的测量标签](https://missvella.com/pages/size-guide) | 第 4 项确认的尺码页结构，待接入直达链接 | 待开始 |
| 6 | Our Story | [About Us](https://missvella.com/pages/about-us) | 已有内容方案与实际商品图 | 方案已完成，待确认素材和落地 |
| 7 | My Account | [Shopify 客户账户入口](https://missvella.com/account) | 验收订单视图时使用已授权的测试账户 | 已确认入口跳转，待配置和验收 |
| 补充 | Color & Fabric Guide | `/pages/color-fabric-guide`（待商家创建与关联） | 实拍色卡、面料／裙装图及确认后的内容 | Color Guide / Fabric Guide 代码已上线，待商家配置 |

进度表里的链接用于打开当前页面。第 5 项验收通过后，补上可直接打开测量标签的完整地址。

## 新对话开场指令

### 1 Processing & Shipping

> 读取 `docs/footer-page-optimization.md`，本对话只做第 1 项。先核对当前公开运输政策和目标市场的结账信息，再优化英文页面。首屏用一张表列出标准与加急的处理时间、发货后运输时间、预计总时长和费用。整理免邮计算方式、适用目的地、关税、急用日期、追踪和包裹异常。交付可直接填写的英文稿、排版方案与供 FAQ 引用的政策要点。发现页面与结账口径不一致时，记录差异及待核实项。

验收时，顾客能区分发货前处理和承运商运输，并能在同一处查到运费、免邮门槛和到货估算。2026-11-18 已确定使用独立 Page 承载可编辑 section：商家创建并验收后，页脚连到 `/pages/processing-shipping`，页面保留 `/policies/shipping-policy` 正式入口；配置完成前可先连到正式政策。

### 2 Returns & Refunds

> 读取 `docs/footer-page-optimization.md`，本对话只做第 2 项。核对线上退货与退款政策，整理可直接填写的英文稿。把申请期限、收到指引后的寄回期限、商品状态、寄回地点和运费承担方放在前面。分别写清普通退货与瑕疵、破损或错发的处理方式，补齐退款方式、处理时间、换货规则和申请所需资料。保留当前政策中适用的消费者权利说明，并输出供 FAQ 引用的最终口径。

验收时，顾客能区分两个期限，知道何时联系 `hello@missvella.com`、该用哪个退货地址，以及谁承担运费。页脚连到 `/policies/refund-policy`。

2026-11-26 已通过 Shopify Admin API 更新正式退款政策，并通过 Storefront API 回读确认。顶部速查表与正文第 1、3、6 节均写明，收到并检查退件后，已批准的退款在 48 小时内处理，银行或支付机构入账另需时间。收到货后 15 个自然日内可申请退货；因个人喜好退货由买家付寄回运费，原始运费原则上不退。因破损、质量问题、缺陷或错发退货，Missvella 承担寄回运费并退还原始运费。顾客可选补发或全额退款。退货收件人统一为 Missvella。

### 3 FAQs

> 读取 `docs/footer-page-optimization.md`、`docs/faq-content-2026-11-07.json` 和 `docs/faq-content-plan-2026-11-07.html`，本对话只做第 3 项。根据第 1、2 项最终确认的政策更新 6 类、43 个英文问答。支付使用信用卡和 PayPal，邮箱用 hello@missvella.com。按已有方案准备可在编辑器中添加的分类预设、高频入口及折叠问答，提供新模板创建、分区添加和页面关联步骤。先核对正式政策链接，再记录编辑器中的待办。

验收时，问答与政策页的数字和条件一致，手机端可以找到高频问题并展开答案。页面关联完成后，页脚连到 `/pages/faqs`。 [英文稿与页面方案](faq-content-plan-2026-11-07.html) · [结构化内容](faq-content-2026-11-07.json)

### 4 Size Guide

> 读取 `docs/footer-page-optimization.md`，本对话只做第 4 项。核对线上尺码页、商品页面板与当前尺码数据，检查 IN／CM 切换、表头、移动端滚动和商品页入口。写明两码之间如何判断、胸腰臀落在不同尺码时如何寻求帮助，以及不同款式以哪里为准。涉及尺码数值的调整，以商家确认的尺码数据为准。把可供 How to Measure 复用的标签结构或直达机制记入交接。

验收时，手机和桌面均能查看完整尺码表，切换单位后表头与数值对应，从商品页进入能找到该款适用的尺码信息。页脚连到 `/pages/size-guide`。

### 5 How to Measure

> 读取 `docs/footer-page-optimization.md` 和第 4 项的交接记录，本对话只做第 5 项。复用 Size Guide 页面内的 How to Measure 标签，核对测量图编号与胸围、腰围、臀围、锁骨凹点到地面、身高五项说明。优化英文步骤与手机端可读性，为测量标签提供稳定的直达链接。

验收时，从页脚和复制后的直达链接都能打开测量标签，并检查刷新后仍落在正确标签。将验证过的地址回填进度表并交给商家配置页脚。

### 6 Our Story

> 读取 `docs/footer-page-optimization.md`、`docs/missvella-about-plan-2026-11-07.html` 和 `docs/about-us-demo.md`，本对话只做第 6 项。核对当前 About Us 页面，沿用已拟定的杂志风方向，交付定稿英文文案、实拍素材清单和编辑器区块配置。按首屏、品牌介绍、选款理念、商品细节、场合集合和帮助入口整理，核实集合目标及商品图对应关系。

验收时，手机首屏能读懂 Missvella 的礼服定位，图片与文案对应，集合入口可用。页脚连到 `/pages/about-us`。 [About 内容方案](missvella-about-plan-2026-11-07.html) · [现有 Demo 说明](about-us-demo.md)

### 7 My Account

> 读取 `docs/footer-page-optimization.md`，本对话只做第 7 项。核对当前 Shopify 客户账户入口、页脚链接和账户品牌显示。先检查未登录跳转；获得测试账户后，核对登录、订单列表及详情、返回商店，以及手机端体验。记录确实可用的账户功能和仍需商家处理的配置。

验收时，页脚能进入店铺账户登录流程。登录及订单视图需使用已授权的测试账户验证，通过后再登记完整验收。页脚使用 `/account`，由 Shopify 处理跳转。

## 对话交接和上线

### Color & Fabric Guide 补充项 · 2026-11-19

- 两个可独立添加的 **Color Guide**、**Fabric Guide** section 已完成，延续极简细线、原生字体／配色和文字链接。颜色提供可选色系筛选、色卡选中大图、详情链接和编辑器区块联动；面料提供近景／裙装双图和 Finish / Drape / Feel 特征行，手机纵排。
- 2026-11-19 后续补充：资料库含原始 58 色、56 个原 HEX 色块、16 组色系示例图。按最新要求，面料仅显示 Satin、Chiffon、Tulle、Mesh、Lace、Crepe、Velvet、Sequin Fabric；均有字段一致的店内图片。面料改为两列图文卡片，细节主图配裙装小图，详细特征可展开；颜色保持名称左侧、色卡单行横排。商家开启 **Use store color/fabric catalog** 后生效；同名区块可覆盖图片与文案。未修改页面实例、原元字段或菜单。[配置与素材来源](color-fabric-guide.md)。
- 一次 Theme Check 对新增文件零问题，schema／设置引用和 JS 语法校验通过；现有 32 个翻译错误、21 个警告未变化。未做浏览器或截图回归。
- 确认 `167137378374` 仍为 live 后，仅精确推送两个 section、`assets/material-guides.css` 和 `assets/color-guide.js`，CLI 已返回成功。Page、模板 JSON、关联和页脚菜单均未代改；商家配置并验收后将页脚指向 `/pages/color-fabric-guide`。

### 第 1 项交接 · 2026-11-18

- **2026-11-19 新增配送时间轴**：独立 **Delivery timeline** section 已精确上传当前 live，编辑器中 Add section 即可添加。默认 `Order placed → Production 2–5 days → Dispatched → In transit 5–12 days → Arrival`，全部标签／时长可编辑；桌面横向，手机纵向，沿用极简细线风格。该数字来自本次组件需求，与原政策运输口径不同，不视为政策或 FAQ 数字已更新；商家装配时统一天数单位及适用服务。实现、检查及配置说明见[交接文档](shipping-page-handoff-2026-11-18.md)。仅新增代码上传，未代改模板或实例内容。

- [英文大纲、政策核对、FAQ 口径及商家配置步骤](shipping-page-handoff-2026-11-18.md)已完成。主来源为本次浏览器实际读取的公开 Shipping Policy §1–11，历史 FAQ 仅作对照，核心数字一致。
- 口径：处理均 2–5 工作日；标准运输 4–10、总计 6–15、$15 USD；加急运输 3–5、总计 5–10、$30 USD；折后、运费前商品小计 ≥ $180 USD 自动免标准运费，促销另有说明除外加急仍 $30。保留目的地／结账条件和非保证日期说明。
- 新增代码：`theme/sections/processing-shipping.liquid`、`theme/assets/processing-shipping.css`。主题编辑器预设 **Processing & Shipping**：可编辑表头、2 个运输方式块、8 个详情折叠块、免邮条件、客服／政策入口、H1/H2、颜色和间距；字体与颜色继承主题，详情复用原生 accordion 组件，无新增 JS。
- **极简风格优化（2026-11-18）**：按商家要求优先信息识别与传递。阅读宽度收敛至 56rem，标题与导语克制居中；比较表移除纵线、外框及底色，仅保留细横线，预计总时长以字重强调；免邮说明桌面采用标题／正文对齐、手机纵排；详情用原生加减号，客服改为下划线文字入口。继承原有字体和配色，正文及小字保留可读尺寸，链接至少 44px 点击高度和明确键盘焦点。未修改 schema 设置 ID、默认文案、政策数字或商家实例内容。一次 Theme Check 无新增问题（仍为现有 32 错误、21 警告）；仅精确推送上述两个代码文件，CLI 成功，未做浏览器视觉回归。已添加的 section 刷新即可应用样式，尚未添加的仍按交接装配。
- Shopify 政策页不提供普通 Page 的可分配 JSON 模板；采用独立 Page 的详细依据、模板创建、页面关联和菜单步骤见交接。正式政策及结账政策入口保持 `/policies/shipping-policy`。未创建／推送模板 JSON，未改政策、Page、菜单或线上实例内容。
- 必要静态检查：schema JSON、预设块引用与设置 ID 校验通过；一次 Theme Check，新增文件零错误／警告；全主题已有文件报告 32 个 MatchingTranslations 错误、21 个警告（不属于本次改动）。未做前台视觉回归或截图。
- **发布完成（2026-11-18）**：首次因 CLI 当前账号无店铺访问权限失败；后续在 PTY 中执行 `shopify auth login`，选择已有授权的 `ruchenlab@gmail.com` 会话后恢复访问。`theme list` 确认 `167137378374`（Missvella Dev）仍为 live，随后仅精确上传两个代码文件并收到 CLI `was pushed successfully` 成功回执。使用 `--nodelete`，未推送任何内容 JSON；代码未变化，未重复静态检查。
- 结账运费未实测：本次只确认浏览器会话购物车为空，没有完整目的地地址报价；没有已确认的政策／结账冲突，也不能宣称二者已验证一致。主要市场、折扣跨越 $180 边界、币种、税费和例外地址按交接表待核对。
- 第 3 项 FAQ 可使用交接中的公开政策口径，正式 Shipping Policy 链接保持不变。退货数字与退货条件等待第 2 项确认；不得将未核实结账条件写成保证。
- Git：实现提交 `81d04c8` 已同步 `origin/main`；恢复权限与发布结果另以文档提交同步。`.codebuddy/`、`.playwright-cli/`、`output/` 及检查缓存不纳入提交。

本次成功执行的精确发布命令（已先确认当前线上主题）：

```powershell
shopify theme list --store 6icwx6-yv.myshopify.com
shopify theme push --store 6icwx6-yv.myshopify.com --theme 167137378374 --allow-live --path theme --only "sections/processing-shipping.liquid" --only "assets/processing-shipping.css" --nodelete
```

代码已上传；下一步由商家按交接创建模板、添加 section、关联 Page、配置页脚和检查前台，随后将本项状态更新为待验收／已完成。

- 对话开始时读本计划和 [AGENTS.md](../AGENTS.md)，核对该项线上页面及上游交接。遇到政策数字、尺码数据或支持范围变化，记录最终确认的来源与口径。
- 每项结束后更新进度表，附交付物、正式链接、验收结果及下一项依赖。可用状态为待开始、内容已备、待商家配置、待验收、已完成。
- 政策正文、页面文案、图片、模板实例和菜单链接由商家在 Shopify 后台配置。主题代码按项目约定检查并以 `--only` 精确推送允许的代码文件。发布范围遵循 [项目工作流](workflow.md) 和 [AGENTS.md](../AGENTS.md) 的内容文件保护规则。
