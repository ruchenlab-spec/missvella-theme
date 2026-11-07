# Jimiss 品牌残留全站检查 · 2026-11-07

本次为商家要求的全站只读检查，目标为 Jimiss 的大小写变体、分隔写法、域名、邮箱和外链，包括常见 Unicode、HTML 实体和 URL 编码。检查结论区分线上页面、线上代码、本地代码与本地内容快照。

## 检查结论

本次请求检查 **442 个公开 URL**：**436 个 HTTP 200**，6 个 HTTP 404，无未解决的限流或网络错误。站点地图列出的 **374 个唯一页面地址全部覆盖且返回 HTTP 200**；其余地址来自页面内链、分页与补查入口。

| 范围 | 实际覆盖 | Jimiss 结果 |
|---|---|---|
| 线上商品 URL | 382 个，其中 380 个正常内容响应、2 个 404 | 正常响应未检出 |
| 线上集合 URL | 40 个，包含分页及集合总览 | 未检出 |
| 线上普通页面 | 7 个 URL，其中 6 个有效页面、1 个 404 | FAQ 命中；About、Contact、Size Guide、Data Sharing Opt Out、Review Submission 未检出 |
| 线上政策 URL | 7 个，其中 5 个有效政策、2 个补查入口 404 | 有效政策未检出 |
| 其他公开入口 | 首页、博客、空搜索、购物车、密码入口、404 入口 | 返回内容未检出；重定向目标逐条记录 |
| 站点元数据 | sitemap 主索引、5 个子地图、robots.txt | 未检出 |
| 本地主题 | 540 个文件，538 个文本文件；149 个 schema、78 个 JSON | 未检出，解析错误 0 |
| 线上主题代码 | 518 个文件，516 个文本文件；149 个 schema、60 个 JSON | 未检出，解析错误 0 |

**实际残留集中在 FAQ 的线上实例内容。About 当前公开 HTML 未检出 Jimiss。此次没有修改商家内容，也没有主题代码需要修复或推送。**

本地模板无残留与线上 FAQ 有残留并不矛盾：本地文件是旧快照，不是编辑器实例的实时镜像。

逐 URL 状态、命中证据和来源覆盖数据见 [检查明细 JSON](brand-residue-audit-2026-11-07.json)。

## 已确认的线上残留：FAQ

页面：[FAQs](https://missvella.com/pages/faqs)。

共 13 个文案块，含 15 次可读文本提及；HTML 原文共 22 次命中，其中还包括重复的链接地址与 title 属性。不能把这三个口径相加。

- 品牌名：7 个文案块，其中一段提及两次。
- 旧客服邮箱 `support@jimiss.com`：3 个文案块。
- 旧站外链：3 个文案块，包含 4 个不同目标地址。

建议优先处理旧邮箱与外链，避免顾客联系旧商家或跳转旧站。品牌文字按照商家要求使用 `Brand`；不要机械生成 `support@brand.com` 或 `brand.com` 等未经确认的目标。

| # | 编辑器查找位置或原文 | 残留 | 建议替换 |
|---|---|---|---|
| 1 | `Is my payment secure on Jimiss Dress website?` | 问题中的品牌名 | `Is my payment secure on the Brand website?` |
| 2 | `I'm missing a product from my order, what do I do?` 的回答 | `support@jimiss.com` | 改为引导至已存在的 [Contact Us](https://missvella.com/pages/contact)，或由商家填写已确认的客服邮箱 |
| 3 | `What is the return policy?` 的回答 | `https://www.jimiss.com/policies/refund-policy` | 链接与可见文字一并改为站内 `/policies/refund-policy`，标签可用 `Return & Refund Policy` |
| 4 | `What if i need help with my return?` 的回答 | `support@jimiss.com` | 改为站内 `/pages/contact`，或真实客服邮箱 |
| 5 | `How long will it take until I receive my order?` 的回答 | `https://www.jimiss.com/policies/shipping-policy` | 链接、title 和可见文字一并改为站内 `/policies/shipping-policy`，标签可用 `Shipping Information` |
| 6 | `What is the best way to choose my size?` 的回答 | `https://www.jimiss.com/pages/measurement-guide`、`https://www.jimiss.com/pages/size-chart-1` | 合并引导至已存在的 `/pages/size-guide`，删除旧链接及 title；保留产品页对应尺码表说明 |
| 7 | 分区标题 `About Jimiss Dress` | 品牌名 | `About Brand` |
| 8 | `Is jimiss dresses legit？` | 品牌名 | `Is Brand legit?` |
| 9 | 上述问题的回答：`Jimiss Dress is a legitimate and reputable dress manufacturing company.` | 品牌名与旧公司的制造商表述 | 以 `Brand` 替换名称，并由商家按真实业务重写；不能默认继承旧品牌的制造商身份 |
| 10 | `How can i contact you？` 的回答 | `support@jimiss.com` | 改为站内 `/pages/contact`，或真实客服邮箱 |
| 11 | `Do you have any store locations?` 的回答 | `Jimiss Dress` 提及两次 | 品牌名改为 `Brand`；是否仅线上经营由商家核实后保留或重写 |
| 12 | `Why choose Jimiss Dress?` | 问题中的品牌名 | `Why choose Brand?` |
| 13 | 上述问题的回答，以 `At Jimiss Dress, your go-to source...` 开头 | 品牌名 | 改为 `At Brand, ...`，并核实后续商品品类表述 |

对应线上分区后缀：`section_mfkwQc`、`section_ninURy`、`section_9aCDyx`、`section_WiPjji`；完整 section ID 与原文保存在 JSON 证据中。

修改入口：[线上主题编辑器 · FAQ](https://6icwx6-yv.myshopify.com/admin/themes/167137378374/editor?previewPath=%2Fpages%2Ffaqs)。

以上是商家在编辑器保存的实例内容。本地 `page.faqs.json` 已经不含旧品牌，不能拿它覆盖线上。遵循 `AGENTS.md` 与 `docs/workflow.md`，本次没有修改线上实例、没有上传模板或 `settings_data.json`，也没有用前端脚本遮蔽残留。

## 代码与默认值

检查包括文件路径、文本源码、Liquid schema、presets、所有语言文件、全局设置定义及本地 JSON 快照中的字符串；JSON/JSONC 与 schema 已解析，不只做原文搜索。线上代码通过 Shopify CLI 下载至独立临时目录，仅包含允许的代码目录和精确的 `config/settings_schema.json`。

本次代码中未找到 Jimiss，因此没有需要发布的品牌替换代码。项目历史记录和本检查文档中为解释问题而出现的 Jimiss，不属于前台品牌暴露。今后的通用默认品牌占位继续使用 `Brand`。

## 范围与限制

- 以全站 sitemap 为入口，逐页跟随同站公开内容链接，补查政策页、集合分页、首页、集合总览、空搜索、购物车、密码及 404 入口。商品集合上下文 URL 归一为商品主 URL，避免重复；筛选、排序、跟踪参数和商品变体参数不重复穷举。
- 检查初始 HTML 中的可读文本、隐藏折叠内容、元数据、内联代码、链接、资源地址和图片替代文本；主题文本代码另行全量扫描。
- 这不包含图片／视频像素内的文字识别，也不包含只在运行 JavaScript 后出现的第三方应用内容。
- 未登录的公开检查无法枚举账户内页面、结账状态、草稿、未公开或完全无链接的页面；也未穷举未在站点地图中列出的全部国家／语言版本。不能据此宣称 Shopify 后台所有数据库字段或所有图像均已清理。
- HTTP 404 与限流／错误响应不作为正常内容页的“无残留”证据；每个 URL 的状态单独记录，限流请求补查后再判断。
- 检查结果反映检查时的公开响应；商家继续在编辑器修改后，页面内容可能变化。

## 附带发现

部分商品详情页链接到 [Attention Care](https://missvella.com/pages/attention-care)，该目标返回 404。它属于失效链接问题，未发现其中包含 Jimiss；本次仅记录，没有修改商品内容。

首页还链接到以下两个返回 404 的商品地址，本次只记录，不修改商家集合或菜单内容：

- [Blushing Pink Satin Tulle A-Line Sweetheart Mini Dress](https://missvella.com/products/blushing-pink-satin-tulle-a-line-sweetheart-mini-dress)
- [Daffodil Chiffon A-Line Sweetheart Zipper Back Floor-Length Dress](https://missvella.com/products/daffodil-chiffon-a-line-sweetheart-zipper-back-floor-length-dress)

`/404` 为主动检查的错误页入口；`/policies/subscription-policy`、`/policies/legal-notice` 为补查入口，若返回 404，不代表站内一定存在指向它们的失效链接。具体来源见 JSON。

## 复查方式

脚本：`node scripts/audit-brand-residue.cjs`。结果保存在 `.tmp-brand-audit/result.json`，进度保存在同目录的 `progress.json`。脚本默认从已有成功记录续查；需要一次全新检查时，先将旧进度文件重命名留档。线上代码应在独立目录 `.tmp-brand-live-code` 中准备，不从内容快照推送任何设置。

本次只提交检查脚本、结果文档与项目记录；不提交下载的远端代码、缓存或临时响应文件，不执行 Shopify theme push。
