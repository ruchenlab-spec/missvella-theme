# Processing & Shipping：内容大纲与实施交接

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

代码及预设完成；schema/预设校验通过，一次 Theme Check 对新增文件零错误／警告（现有文件 32 个翻译错误、21 个警告）。未进行视觉回归。

仅精确尝试上传 `sections/processing-shipping.liquid` 与 `assets/processing-shipping.css`，Shopify CLI 返回店铺访问权限错误，**尚未上线**。恢复正确账号的店铺权限、确认当前 live 后即可按主计划中命令重新上传。Page、模板关联与菜单仍由商家配置；结账实测待办不变。Git 提交和远端同步结果见本次对话，完整交接记录于 `docs/footer-page-optimization.md` 第 1 项。
