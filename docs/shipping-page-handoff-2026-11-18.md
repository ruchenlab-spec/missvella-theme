# Processing & Shipping：内容大纲与实施交接

## 现有 Processing & Shipping 页面 · 2026-11-26

在现有 `processing-shipping` 模板的 **Processing & Shipping** 分区启用正式政策视图。数据来源为店铺 **Settings → Policies → Shipping policy**；发布前已通过 Storefront API 核对实际正文、25 个目的地以及美国地址限制。页面每次渲染取 `shop.shipping_policy.body`，处理时间、费率、免邮条件、收件限制与运输异常说明均来自同一正文。制作包含在周一至周六处理的 2–5 个工作日内；表格里的天数从发货起算。

- **目的地查询**支持国家名、部分拼写和 US／USA、GB／UK、UAE 等简称。清空搜索可回到完整表。不在表内的地址按结账可用方式确定，不推算缺失时效。关闭 JavaScript 时仍可阅读政策及完整表格。
- **页内 Shipping FAQs** 把政策中的活动日期、追踪、延误、错址退回和丢损包裹说明整理为可展开的问答。若政策标题或结构改变而无法识别，对应正文仍正常展示。独立 `/pages/faqs` 不在此次改动范围。
- 编辑器 **Use the published Shipping Policy** 默认开启。标题、客服与外观仍可在原分区调整；关闭该开关会显示商家原先手填的比较表与区块，其中的数值需要按政策另行核实。
- 已用正式政策正文验证 25 行时效、简称与部分名称查询、无匹配、清空以及 6 个页内问答。Theme Check 对本次文件零问题。Shopify CLI 已确认在当前 live 主题 `167137378374` 精确上传分区、政策视图片段、CSS 与 JS 四个代码文件。
- **页面交互更新。** Overview、Destinations、FAQs 使用图标标签。桌面采用左侧导航、右侧内容；窄屏使用横向标签，运费卡片按空间排列。国家查询入口可从 Standard 卡片和 FAQ 直接打开；追踪按钮取正式政策中的物流链接。切换保留搜索与已展开的问题，支持键盘方向键、Home／End、浏览器返回和直接链接。面板与折叠答案带短促淡入动效，并跟随系统减少动态效果偏好。已验证这批交互、两个运费金额、25 行国家表及 6 个答复；三个相关代码文件已精确上传 live。

- 目的地搜索框获得焦点时仅加深现有细边框。Shipping FAQs 复用主题的 `accordion-custom-component`、`icon-plus.svg` 和展开动效，收起为加号，展开为减号。该页底部以客服邮箱和政策链接结束，两种显示模式均省略原先的政策摘要段落。本次四个主题代码文件经 Theme Check 检查无新增问题，已精确上传线上主题。

## 完整英文运输政策 · 2026-11-26

[完整英文 Shipping Policy 正文（含内联样式及逐国表格）](shipping-policy-country-transit.html)。在 Shopify 后台 **Settings → Policies → Shipping policy** 的 HTML 模式中，用完整源码替换现有正文并保存。页面标题由 Shopify 提供。当前交付为商家发布稿。

正文使用 6px 段后距；大标题上方留 14px，小标题上方留 12px，标题下方留 4px。间距写在政策正文的内联样式中。

- **国家范围。** Shopify Storefront API 的 `localization.availableCountries` 返回 28 个国家和地区，与[店铺前台](https://missvella.com/)的地区选择器一致。按商家要求，顾客表格仅列出其中有顺丰 CD 时效的 25 个目的地，按前台英文名排序，每地一行。中国香港、以色列和韩国在原表中缺少时效，已从顾客稿省略。具体邮编可选的运输服务由结账决定。
- **时效来源。** 逐国区间取自桌面文件《时效.xlsx》的「国际电商专递-CD」工作表（2026-11-19 生效），按 E 列目的地代码核对 F 列。商家最终指定美国改为 5–10 天，并将运输方式表和国家表的时效单位统一为 days。其余 24 个目的地沿用原区间数字。
- **处理、时效与费用。** 导语提示顾客将制作与处理时间加上发货后的运输时间。订单处理的 2–5 个工作日已含制作，从订单确认且付款成功后起算，处理日为周一至周六。顺丰 CD 对应 Standard Shipping。美国地址限制见《时效.xlsx》B226：阿拉斯加、夏威夷、波多黎各、关岛等美国属地、PO Box 和 APO/FPO 军邮地址均不在该线路范围。其他可选方式以完整地址的结账结果为准。标准运费为 15 美元，折后、运费前的商品小计满 180 美元自动免标准运费。Express 发货后预计 3–5 天，运费 30 美元，各订单金额均适用。
- **物流超时与错址退回。** 超过对应的预计运输时限仍未收到，或物流轨迹停止更新，顾客可凭订单号和已有的追踪号联系客服，由店铺联系承运商跟进。地址错误或不完整导致退回的，顾客提供订单号及更正后的完整地址。包裹退回店铺后，先与顾客确认可用配送方式及可能产生的重寄费，再安排重寄。
- **追踪与包裹异常。** 顾客可使用发货邮件或商家指定的[自助追踪入口](https://missvella.com/apps/ordertracker)。丢失、到货破损或标记送达但找不到包裹时，顾客可选择补发或退款。一般退货条件、退货邮费及退款期限已从运输政策稿中移除。

## 2026-11-18 导读页交接记录

核对日期：2026-11-18（Asia/Shanghai）。任务范围：页脚优化第 1 项。

## 来源与核对结果

- 主来源：[当前公开 Shipping Policy](https://missvella.com/policies/shipping-policy)，本次通过浏览器读取完整正文 §1–11。HTTP/搜索读取被连接验证阻断，浏览器读取成功；未修改网页、购物车、政策或后台内容。
- 历史对照：`docs/faq-content-2026-11-07.json` 的 Shipping & Delivery 10 问。处理、运输、总时长、价格、免邮门槛与当前公开政策一致；旧草案不是事实来源。
- 结账核验边界：读取到当前会话购物车为空，未获得含完整目的地地址的运费报价。没有已验证的“结账与政策冲突”，也不能认定二者一致。具体国家、邮编、偏远地区、PO Box、税费预收、优惠叠加、非 USD 换算及免邮边界仍待商家核对。
- 不预填全球可达、包税、指定承运商、保证活动日前到货、加急制作、固定追踪更新时间或客服回复时限。

## 英文内容大纲（实施前确定）

1. **Processing & Shipping**：短导语；直接进入标准与加急对照。
2. **Compare shipping options**：三列表格（项目 / Standard / Express），四个数据行（处理 / 发货后运输 / 总时长 / USD 费用）。手机仍保留并排比较，不把标准与加急拆到不同折叠项里。
3. **Free Standard Shipping from $180 USD**：折后商品小计、运费前计算；仅标准免邮；加急仍 $30，适用促销另有说明除外。紧接可配送地区与结账条件。
4. **Shipping details**：预填可编辑、可排序的折叠行：处理起算；急用日期；目的地；关税；确认与追踪；地址更正／退回；延误；丢失／损坏／显示送达未收到。
5. **Need help with your delivery?**：客服邮箱、订单号资料提示、正式 Shipping Policy 与 Return & Refund Policy 入口；保留法定权利说明。

## 首屏英文定稿

**Processing & Shipping**

Plan your delivery with processing and shipping times in one place.

| Compare shipping options | Standard Shipping | Express Shipping |
|---|---|---|
| Processing before dispatch | 2–5 business days | 2–5 business days |
| Transit after dispatch | 4–10 business days | 3–5 business days |
| Estimated total delivery | 6–15 business days | 5–10 business days |
| Shipping cost (USD) | $15 USD; free on qualifying orders | $30 USD |

Processing starts after order confirmation and successful payment. Business days exclude weekends and public holidays. These are estimates, not guaranteed arrival dates. Available shipping methods, rates and destinations are shown at checkout.

**Free Standard Shipping from $180 USD**

Free Standard Shipping is applied automatically when the merchandise subtotal reaches $180 USD after discounts and before shipping charges. Express Shipping remains $30 USD unless an applicable promotion states otherwise.

For supported destinations only. Enter your complete delivery address at checkout to see the available options and any destination-specific differences.

其余完整英文正文以 `theme/sections/processing-shipping.liquid` 的 schema defaults / preset 为实现源；下方 FAQ 交接列明全部政策口径，新增区块自动预填，无需粘贴整页 HTML。

## 给第 3 项 FAQ 的政策口径（可直接引用）

以下为已核对的**公开政策口径**，不表示结账配置已通过实测。

| FAQ 主题 / 现有 ID | 确认口径 | 正式政策来源 |
|---|---|---|
| processing-time | Standard processing: 2–5 business days after confirmation and successful payment; excludes weekends/public holidays; separate from transit. | §1 |
| shipping-cost | Standard: $15 USD, 4–10 business days after dispatch. Express: $30 USD, 3–5 business days after dispatch. Supported destinations; available rates/options shown at checkout. | §2、§6 |
| delivery-time | Standard estimated total: 6–15 business days. Express estimated total: 5–10 business days. Neither is a guaranteed arrival date. | §3 |
| free-shipping | Automatic free **Standard** shipping at merchandise subtotal ≥ $180 USD **after discounts and before shipping charges**. Express remains $30 USD unless an applicable promotion says otherwise. | §2 |
| international-shipping | Only countries/regions and services available for the complete destination address at checkout; no verified exhaustive country list. | §6 |
| duties-taxes | Import duties, customs charges and local taxes may apply; customer's responsibility and not included unless checkout states otherwise. Charges collected by Missvella are disclosed at checkout. Customs can delay delivery. | §7 |
| urgent-event | Contact hello@missvella.com before purchase. Allow time for delivery, fitting and alterations. Express retains the same processing time. No date guarantee or rush-production promise. | §1–3 |
| track-order | Confirmation email after order; shipping email with available tracking after dispatch; carrier updates may take time, no fixed hour/day promise. Contact support with order number. | §4 |
| address changes | Contact promptly; pre-dispatch update only when operationally possible; after dispatch may not be available. | §5 |
| undeliverable-parcel | Contact support. Additional reshipping charges may apply for incorrect/incomplete/undeliverable addresses where legally permitted; no automatic refund promise. | §5 |
| delivery-problem: delays | If unable to ship within the promised timeframe, notify customer and provide appropriate options under applicable law, including revised shipment date or cancellation/refund where required. After dispatch, send order/tracking details to support. | §8 |
| delivery-problem: lost/damaged/delivered-not-received | Email order number, tracking number, issue description, photos if damaged. Missvella reviews and works with carrier; appropriate remedy where applicable. Mandatory rights remain unaffected. | §9 |
| returns cross-link | Link to `/policies/refund-policy`; §10 currently mentions 15 calendar days, standard international return shipping to China at customer's cost, original outbound fee exceptions under law. Final returns wording belongs to task 2; this Shipping section links out instead of duplicating deadlines. | §10 |

建议 FAQ 保留正式政策链接 `/policies/shipping-policy`。新增导读页面上线后可以另加导读入口，不能取代正式政策引用。历史草案中的“检查安全投递位置”“提供商品链接与活动日期”等是实用建议，不是新增服务承诺。

## Shopify 页面实现与商家配置

### 视觉规范更新 · 2026-11-18

商家要求参考 LV、Chanel 一类克制风格，首要目标为清晰的信息识别与传递。本次采用现有主题字体和颜色，不新增品牌标志或装饰素材：56rem 阅读宽度、适度留白、细横线对照表、清楚的数字字重层级；取消表格底色、完整格线、免邮卡片框及客服按钮。小标题使用轻微字距，正文保持正常大小写；运输选项始终并排可比。详情复用原生加减号折叠，链接保留 44px 点击高度、下划线及键盘焦点。手机免邮区域自动纵排，不增加横向表格滚动。

本轮仅改 section 标记及 scoped CSS，不更换设置 ID 或改动已有文案；已装配的 section 刷新即可生效，无需删除重加。代码已经精确上传成功；前台视觉由商家自行检查。

Shopify 官方 [模板类型清单](https://shopify.dev/docs/storefronts/themes/architecture/templates) 没有可分配的 `policy` JSON 模板。官方 [政策管理说明](https://help.shopify.com/en/manual/checkout-settings/refund-privacy-tos) 将政策正文放在 Settings → Policies，并单独支持创建 Pages。结合本主题结构，`/policies/shipping-policy` 不能像普通 Page 一样直接通过“Add section”装配本 section。不得为此上传 `policy.json` 或将 section 混进全站 layout。

采用独立导读 Page，保留正式政策页：

1. 代码上传成功后，进入 **Online Store → Themes → 当前线上主题 → Edit theme**。
2. 顶部模板选择器 **Pages → Create template**，名称 `processing-shipping`，基于 Default page。只编辑这个新模板，避免影响其他 Pages。
3. 在新模板中隐藏原有 Page 主 section（避免重复标题／正文），添加 **Processing & Shipping** section。预设包含标准与加急数据和八条详情。默认 H1；若保留另一个页面 H1，则把本 section 的 Heading level 改为 H2。
4. 在 section 设置中修改表头、说明、免费运输、客服、正式政策入口、颜色与间距；在 Standard / Express 区块中修改对应数值；Shipping detail 区块可编辑正文、排序及默认展开。选择折叠行时可开启其 Open by default 来预览内容。留空颜色继承主题全局配色，不使用不存在的 color scheme。
5. **Online Store → Pages → Add page**：标题 `Processing & Shipping`，URL handle `processing-shipping`；正文可留空，内容由 section 提供。关联模板 `processing-shipping`，保存并设为可见。创建及关联均由商家操作。
6. 检查 `https://missvella.com/pages/processing-shipping`：标准／加急同处显示、展开项、邮箱、正式政策及退货入口可用；手机无整页横向溢出；确认仅有一个 H1。
7. **Content → Menus → 实际供页脚使用的菜单**：将 **Processing & Shipping** 从 `/` 改为新 Page `/pages/processing-shipping`。在页面未创建或未验收前，可以先指向现有 `/policies/shipping-policy`。正式政策入口始终保留 `/policies/shipping-policy`，可在 Terms and Policies 中继续显示；不要重定向或删除它。
8. 正式政策正文及结账关联仍在 **Settings → Policies → Shipping policy** 管理。若要添加新导读页链接，由商家在正式政策正文中自行添加。更新政策时同步导读 section 和 FAQ 实例，schema 默认值更新不会覆盖已添加实例。

此方案将原计划“页脚直接指向政策页”调整为“导读 Page + 正式政策入口”，以满足可编辑 section 的需求。所有 Page、模板 JSON、模板关联、菜单及政策内容均未由代码任务代改或推送。

## 结账待核对表

商家按实际目标市场使用合法测试地址检查，无需支付或下单：

| 条件 | 公开政策预期 | 当前状态 |
|---|---|---|
| 支持目的地，折后商品小计 < $180 USD | 标准 $15、加急 $30（目的地/促销例外需明确） | 未实测 |
| 折后商品小计 = $180 USD / > $180 USD | 标准免邮；加急通常 $30 | 未实测 |
| 折前满 $180，折后不足 $180 | 不因折前金额而自动获得此标准免邮资格 | 未实测 |
| 实际主要市场、邮编、偏远地址、PO Box | 以地址对应服务为准；公开政策没有完整名单或统一例外承诺 | 未实测 |
| 非 USD 结账、税费／关税预收、特定促销 | 不额外推断换算门槛、包税或促销兼容规则 | 未实测 |

若发现差异，应记录国家／邮编、商品折后小计、货币、优惠、结账显示服务及费用，由商家统一 Shipping and delivery 配置、正式政策、导读与 FAQ 后发布内容。不能把未核对项目写成已验证承诺。

## 检查、发布及 Git

### 独立 Delivery timeline section · 2026-11-19

- 商家要求新增「下单 → 生产 2–5 天 → 开始运输 → 运输 5–12 天 → 抵达」进度说明组件。新增 `theme/sections/delivery-timeline.liquid` 和 `theme/assets/delivery-timeline.css`；这是预计流程示意，不读取实际订单状态，也不显示虚假的完成进度。
- 在主题编辑器的页面主体选择 **Add section → Delivery timeline**。可添加到普通页面、首页或商品模板主体，不允许放入 header/footer。沿用全局字体、配色和 `contrast-override`；提供背景／文字颜色与上下间距设置。
- 英文默认标题 `From order to arrival`；节点 `Order placed` → `Dispatched` → `Arrival`，阶段 `Production / 2–5 days`、`In transit / 5–12 days`。标题、导语、三个节点、两段阶段名称／时长及底部说明均可编辑。桌面横向细线和三个空心圆点，时长置于线段上方；599px 及以下纵排，避免手机挤压。语义使用有序列表，装饰线／点不作为实际状态朗读，无新增 JS 或动画。
- 数字依据为本次商家给出的组件需求，**不自动更新正式运输政策、现有 Shipping guide 或 FAQ**。`days` 没有擅自改成 `business days`；现有公开政策中处理为 2–5 工作日，标准运输 4–10 工作日，加急 3–5 工作日。新组件的运输 5–12 天及“生产”口径与原政策不同，商家在添加实例前需统一适用服务及日历日／工作日定义。底部默认 `Estimated timeframes only. Arrival dates are not guaranteed.`，不计算或承诺具体抵达日期。
- schema 与设置引用校验通过；一次 Theme Check 新增文件零错误／警告，现有基线仍为 32 个翻译错误、21 个警告。确认主题 `167137378374` 为 live 后，仅对两个新文件使用精确 `--only` 和 `--nodelete`，Shopify CLI 已返回上传成功。未修改内容文件或页面模板实例，未做浏览器／截图验证；由商家添加并检查前台。

代码及预设完成；schema/预设校验通过，一次 Theme Check 对新增文件零错误／警告（现有文件 32 个翻译错误、21 个警告）。未进行视觉回归。

2026-11-18 已恢复 CLI 权限：在交互 PTY 中执行 `shopify auth login` 并选择已有授权的 `ruchenlab@gmail.com` 会话；主题列表确认 `167137378374` 仍为 live。随后仅通过两个精确 `--only` 路径及 `--nodelete` 上传 `sections/processing-shipping.liquid` 与 `assets/processing-shipping.css`，收到 Shopify CLI 成功回执，**代码已上线**。未推送内容 JSON。Page、模板关联与菜单仍由商家配置，完整页面尚待商家装配；结账实测待办不变。实现提交 `81d04c8` 已同步 Git，发布记录另以文档提交同步。完整交接记录于 `docs/footer-page-optimization.md` 第 1 项。
