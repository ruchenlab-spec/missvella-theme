# 踩坑点清单

> 每条格式：**症状 → 原因 → 解决**。按影响面排序，前几条是最容易造成事故的。

## 一、推送与内容安全（最高优先级）

### P1 · 推送后主题编辑器里的配置被还原（本项目已发生 3 次）
- **症状**：改了代码推送后，编辑器里配置的 Banner 图、文案、区块全部变回旧版本；或编辑过程中推送，未保存的编辑丢失。
- **原因**：`templates/*.json` 与 `config/settings_data.json` 保存的是商家在编辑器里配置的内容（图片、文案、区块结构与设置值）。Shopify 只把它们写回线上，不同步到本地。全量 `theme push` 用本地旧文件覆盖了线上新内容。
- **解决**：
  - 日常只推代码：`.\scripts\push-live.ps1`（仅 `assets/ sections/ snippets/ blocks/ layout/ locales/`）
  - 改模板结构：先 `theme pull --only "templates/*.json" --only "config/settings_data.json" --path theme`，再改再推
  - 已误覆盖时：无法从本地找回，只能重新在编辑器配置（本地应保持 pull 后的版本）
  - **不要为了修改某个设置值去推 `templates/*.json`**：拉取到的快照在你改动之后就已经过期，推回去会连带覆盖商家在这期间做的其他修改（文案、图片、区块）。默认值请改 schema，实例值请商家在编辑器里调整。
  - **即使只推 section 文件，也可能丢失编辑器中未保存的改动**：推送会触发热重载，商家正在编辑的内容可能被重载冲掉。推送前确认商家已保存且不在编辑状态。

### P2 · 模板推送失败：`设置"video"值未指向适用的 Shopify 托管的视频资源`
- **症状**：整个模板（如 `index.json`）上传失败，其他文件正常。
- **原因**：Shopify 严格校验 **video** 类型设置必须指向本店托管的视频；图片引用（`shopify://shop_images/...`）不校验，不会阻塞。
- **解决**：清空失效的 `video` 值后重推，再在编辑器里重新选视频。
  ```js
  // JSON 里视频引用形如 "video":"shopify:\/\/files\/videos\/xxx.mp4"
  json = json.replace(/shopify:\\\/\\\/files\\\/videos\\\/[^"]+/g, '');
  ```

### P3 · `theme dev` 报 `Can't start development mode on the live theme`
- **原因**：Shopify 保护机制，不允许在 live 主题上跑本地开发服务。
- **解决**：加 `--allow-live`（有风险），或换一个未发布/临时开发主题（`shopify theme dev` 不带 `--theme` 会自动创建临时 development 主题）。

### P4 · `theme pull` 下来的 JSON 无法 `JSON.parse`
- **症状**：`SyntaxError: Unexpected token '/', "/*\n * ----"`。
- **原因**：Shopify 在模板/设置 JSON 顶部写入 `/* ... */` 注释块（HJSON 风格），标准 JSON 不支持。
- **解决**：解析前剥离注释：
  ```js
  JSON.parse(raw.replace(/^\s*\/\*[\s\S]*?\*\/\s*/, ''))
  ```

### P26 · 推送 `templates/*.json` 后线上设置没变
- **症状**：修改 `templates/index.json` 里的某个设置值并推送成功，但 `theme pull` 回来发现线上仍是旧值。
- **原因**：主题编辑器保持打开时，编辑器会用自己内存里的模型自动保存并写回线上，覆盖 CLI 刚推送的值（并发写）。
- **解决**：
  - 推送模板前让商家在编辑器里完成保存并退出编辑状态（或关闭编辑器标签页）；
  - 推送后**立即** `theme pull` 校验；
  - 对单个数值型设置，直接让商家在编辑器里调整最可靠（编辑器是最后写入方）。

## 二、Shopify 主题架构限制

### P5 · `content_for 'block'` 报 `The 'id' argument should be a string`
- **原因**：`content_for 'block'` 的 `type` / `id` 必须是**字符串字面量**（编译期解析），不能传变量（`block.id`、`block.type`）。
- **解决**：不能用它做"动态列表渲染"。要么用固定 id 的静态区块（`preset` 里 `static: true` + 固定 id），要么放弃 theme blocks 改本地区块。

### P6 · `ValidLocalBlocks: Sections cannot use static theme blocks together with locally scoped blocks`
- **原因**：一个 section 里不能同时使用「静态主题区块」和「section 本地区块」。
- **解决**：二选一。本项目圆形集合选「全本地区块」，因此放弃了原生 `group` 标头（见 `project.md` D5）。

### P7 · 模板 JSON 里配置的区块不渲染（`section.blocks` 为空）
- **原因**：在 Horizon 架构下，`templates/*.json` 的 `blocks` 必须写成**对象 + `block_order`**：
  ```json
  "blocks": { "heading_1": { "type": "heading", "settings": {} } },
  "block_order": ["heading_1"]
  ```
  写成数组 `"blocks": [{...}]` 时会被静默丢弃。
- **注**：section schema 里的 `blocks` 仍然是数组（那是类型声明，不是实例）。

### P8 · `Syntax error in 'render' tag`
- **原因**：`render` 标签的参数只接受字面量/变量/过滤器，不支持内联比较表达式：
  ```liquid
  {% render 'slideshow', show_arrows: section.settings.icons_style != 'none' %}  ← 报错
  ```
- **解决**：先 assign：
  ```liquid
  {% assign show_arrows = false %}
  {% if section.settings.icons_style != 'none' %}{% assign show_arrows = true %}{% endif %}
  {% render 'slideshow', show_arrows: show_arrows %}
  ```

### P9 · `The 'doc' tag can only be used within a snippet or block`
- **原因**：`{% doc %}` 只能用于 snippet 或 block，section 里不能用。
- **解决**：section 用 `{% comment %}`。

### P10 · 自定义 section 的箭头不生效 / 点击无反应
- **原因**：`slideshow-component` 通过 `ref="previous" / "next"` 查找按钮并绑定 `on:click="/previous"`，按钮必须在 `<slideshow-component>` 内部。
- **解决**：箭头放在 `slideshow-component` 内（可以与 `slideshow-container` 同级，用 grid 分列），并保留 ref 与 on:click。

### P11 · `theme check` 报 `Unknown filter 'applicable_disclosures'`
- **原因**：新版 Horizon 使用的官方新 filter，当前 theme-check 版本尚未收录（误报）。
- **解决**：忽略。这是本项目 2 个基线错误之一（另一个见下）。

### P12 · `theme check` 的基线错误与告警（已知，非本次改动引入）
**基线错误（2 个，判定标准：改动后仍是这 2 个即未引入新问题）**
1. `blocks/disclosures.liquid`：`applicable_disclosures` filter 误报
2. `snippets/cart-disclosure-tooltip.liquid`：`applicable_disclosures` filter 误报

> 曾经还有第 3 个基线错误 `templates/product.json` 的 `JSONMissingBlock`（第三方评价 app 区块），已在提交 `651abc0` 随编辑器移除该区块而消失。

**基线告警（18 个，全部来自官方 Horizon 文件，可不处理）**
- `ValidScopedCSSClass` × 11：官方文件之间互相引用 class
- `UnusedDocParam` × 5：`snippets/divider.liquid` 官方文档块声明了未使用的参数
- `ExcessiveSettingsCount` × 1：`sections/header.liquid`
- `DeprecatedTag` × 1：`sections/header.liquid`

**自研代码的判定标准**：改动后自研文件（`filters.liquid`、`cf-colour-bar.liquid`、`list-filter.liquid`、`cf2-item.liquid`、`color-facets.liquid`、`circle-collections.liquid`、`custom-sizes.liquid` 等）**不应出现任何 error 或 warning**。

## 三、CLI 与环境

### P13 · `shopify auth login` 报 `Flag not specified: --alias`
- **原因**：AI 侧执行环境非 TTY（输出被重定向），CLI 拒绝浏览器授权流程。
- **解决**：由开发者在自己终端执行 `shopify auth login`。

### P14 · `shopify store list` 报 `An organization ID is required`
- **解决**：`shopify organization list` 拿 ID，再 `shopify store list --organization-id <id>`。

### P15 · `Start-Process -FilePath "shopify"` 报 `%1 is not a valid Win32 application`
- **原因**：`shopify` 是 npm 生成的 `.cmd` 批处理，不是可执行文件。
- **解决**：`Start-Process cmd.exe -ArgumentList "/c","shopify theme dev ..."`。

### P16 · PowerShell 报 `无法加载文件 shopify.ps1，因为在此系统上禁止运行脚本`
- **解决**：`Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`；已开的终端需重开，或当前会话 `-Scope Process`。

### P17 · `github.com` 连接被重置（`Recv failure: Connection was reset`）
- **现象**：`git clone`/`ls-remote` 失败，但 `api.github.com`、`codeload.github.com` 可达。
- **解决**：设代理 `$env:HTTP_PROXY / $env:HTTPS_PROXY = "http://127.0.0.1:7897"`；或用 `codeload.github.com/<org>/<repo>/tar.gz/refs/heads/main` 直接下载 tarball。

### P18 · `shopify theme dev` 意外创建了新的 `Development (...)` 主题
- **原因**：不带 `--theme` 时 CLI 会自动创建临时开发主题（停止时自动删除）。
- **解决**：需要固定主题时显式 `--theme <id>`。

## 四、PowerShell / Node 脚本坑

### P19 · 路径相对计算错位（出现 `port\assets\...` 这类怪异路径）
- **原因**：`$env:TEMP` 返回 **8.3 短路径**（`C:\Users\ADMINI~1\...`），而 `Get-ChildItem` 返回长路径，`Substring($prefix.Length+1)` 会错位。
- **解决**：统一用长路径：`(Get-Item $path).FullName`。

### P20 · `Compare-Object` 的 `SideIndicator` 方向判断反了
- **正确语义**：`Compare-Object $a $b` 中，`=>` 表示**只在 `$b`**，`<=` 表示**只在 `$a`**。
- **教训**：脚本里给输出加明确标签（`ONLY_A` / `ONLY_B`），不要靠箭头符号理解。

### P21 · PowerShell 5.1 下中文 `.ps1` 解析失败（乱码 + 语法错误）
- **原因**：UTF-8 无 BOM 的脚本被按 GBK 解析，中文字符串破坏语法。
- **解决**：脚本内只用 ASCII（注释也用英文），或用 `write_to_file` 写入后确认编码；本项目 `scripts/check-env.ps1` 即因此改为纯英文。

### P22 · `$LASTEXITCODE` 在管道后不可靠（原生命令被误判为失败）
- **症状**：`node -v` 明明有输出，检查却返回 `-1`。
- **原因**：`& $cmd 2>&1 | Select-Object -First 1` 会提前终止管道，`$LASTEXITCODE` 不更新。
- **解决**：用 `Get-Command $exe` 判断是否存在，再取输出；不要依赖 `$LASTEXITCODE`。

### P23 · `Get-Content` / `Out-File` 同文件不同编码被安全策略拦截
- **症状**：`Mixing GBK/UTF-8 style encodings in a same-file rewrite can corrupt text`。
- **解决**：用 `[System.IO.File]::ReadAllText/WriteAllText` + `UTF8Encoding($false)`，或改用文件编辑工具。

## 五、合并旧主题包的经验

### P24 · 无法直接判断哪些文件被改过
- **方法 1（精确）**：对比旧包与当前版本每个 liquid 的 `{% schema %}` 中 `"id"` 集合，缺失项即为用户新增设置（本项目用它定位到 `price.liquid` 的 13 个设置和 `variant-picker.liquid` 的 `show_size_chart`）。
- **方法 2（快速）**：按业务特征词扫描 diff（`dress|size.?guide|coupon|mv-` 等），但会误报/漏报，需配合方法 1。
- **方法 3（结构）**：`| 2 -` 这类极小差异多为官方版本演进，可保留新版。

### P25 · 整体覆盖某个 snippet 前先确认依赖
- 覆盖前检查：调用方（`render 'xxx'`）、它依赖的 snippet、传入参数是否一致。
- 本项目 `variant-main-picker.liquid` 因定制与官方重构深度耦合，选择整包采用旧版，前提是调用方补回 `block: block` 参数。

### P27 · snippet 里没有 `block` 作用域
- **症状**：把一段 block 内的代码搬进 snippet 后，`block.settings.xxx` 渲染成空值（着色器类名丢失、开关失效），但 Liquid 不报错，只在页面上"样式莫名其妙没了"。
- **原因**：`{% render %}` 创建**独立作用域**，snippet 内拿不到外层的 `block`、`block_settings`、`section` 等对象，只能用显式传入的参数。
- **解决**：把 `block.settings.*`、`section.id` 等在调用方（block 内）取出来，作为 render 参数传进去。例：
  ```liquid
  {% render 'cf-colour-bar',
    swatch_texture: block.settings.swatch_texture,
    enable_sorting: block_settings.enable_sorting,
    section_id: section.id
  %}
  ```
- **附带**：`render` 参数名不能和 snippet 内需要保留的全局对象冲突；传对象（如 `results`）是安全的，传值即可。

### P28 · 抽取 HTML 片段时，标签必须整体搬移
- **症状**：把一段 markup 从 block 搬进 snippet 后，`theme check` 报 `LiquidHTMLSyntaxError: Attempting to end parsing before HtmlElement 'div' was closed` 或 `UnclosedHTMLElement`。
- **原因**：被搬走的片段的**闭合标签在原处**，只搬了开标签那一半，标签配对被拆散。
- **解决**：以**最外层元素的完整闭合**为边界切分，不要按"看起来是一个逻辑块"切。搬完用脚本逐行比对原文件与新文件（空白归一化后应完全一致），确认只差缩进。
- **附带**：`{% stylesheet %}` 里的 CSS 不必跟着搬 —— Shopify 的 stylesheet 是按渲染位置生效的，样式定义留在原处仍然作用得到新位置；但注意 class 作用域告警（`ValidScopedCSSClass`）。

### P29 · 注释里不要写字面的 `<script>` 标签
- **症状**：只是在 `<script>` 内的 JS 注释里写了 "separate `<script>` tags"，`theme check` 立刻多出一个 `error: LiquidHTMLSyntaxError: Attempting to end parsing before HtmlRawNode 'script' was closed`，指向该 `<script>` 的**开标签行**，看起来像是标签没闭合。
- **原因**：Liquid 的 HTML 解析器对 `script` / `style` 做的是**原始文本扫描**，只认 `</script>` 作为结束标记；注释里的 `<script>` 会被当成一个新的嵌套节点，于是外层节点永远等不到闭合。
- **解决**：注释里用 "script 标签" / "separate tags" 这类不含尖括号的写法。
- **附带**：同理，`{% style %}` / `{% stylesheet %}` 内的 CSS 注释里也不要写 `</style>`；JS 里拼接字符串用到标签时也尽量拆开写（`'<' + 'script'`）。

## 六、颜色组（跨产品色卡）功能开发中的坑

> 背景：让"同款不同颜色"各自成为独立产品（独立 URL / 独立首图 / 独立 Pin 落地页），并在产品页用一组色卡互相跳转，替代第三方 LinkOption app。相关文件：`snippets/color-group-collection.liquid`、`color-group-swatches.liquid`、`color-group-styles.liquid`、`variant-hidden-option-fieldset.liquid`、`assets/color-group-swatches.js`。

### P30 · metaobject 的"产品引用列表"在 Liquid 里读不出产品对象
- **症状**：metaobject 定义里 `Products` 字段选「产品引用 + 列表」，`product.metafields.custom.color_group.value.products.value` 拿到的是一串 GID：`["gid://shopify/Product/10264372019270", ...]`，无法遍历出产品。
- **原因**：Shopify Liquid **没有 GID → 对象的转换**。metaobject 的引用列表只暴露 GID 字符串数组（单值引用才是对象）。
- **解决**：成员一律从 **collection** 取（`collections[handle].products` 直接是产品对象）。metaobject / metafield / tag 只用来携带「组键」，由组键拼出 collection handle。
- **附带**：`all_products` 只能按固定 handle 取、且上限 20 个，无法用 handle 列表动态构造产品数组（Liquid 的 `concat` 也只接受数组，不能拼对象）。

### P31 · Liquid 的 `json` 过滤器只能序列化，不能解析
- **症状**：`{% capture data %}{% render 'x' %}{% endcapture %}{% assign obj = data | strip | json %}` 之后 `obj.foo` 全是 nil；`obj` 拿到的是被再次序列化的字符串。
- **原因**：Shopify Liquid 的 `json` 过滤器是**输出方向**（对象 → JSON 文本），没有 `from_json`。
- **解决**：不要用 capture + JSON 在 snippet 之间传结构化数据。改为：① 传**原始值**（字符串 handle），由接收方自己查；② 或把解析逻辑和渲染逻辑放同一个 snippet；③ 真正需要传对象时用 `render` 的具名参数直接传对象。

### P32 · Liquid 不支持内联数组字面量
- **症状**：`{% for key in 'a', 'b', 'c' %}` 报 `LiquidHTMLSyntaxError: Arguments must be provided in the format for in <array> ...`。
- **解决**：先 `assign` 字符串再 split：
  ```liquid
  {% assign keys = 'custom.a,custom.b,custom.c' | split: ',' %}
  {% for key in keys %} ... {% endfor %}
  ```

### P33 · HTML 注释不能写在 `{% liquid %}` 块内（会静默阻断文件同步）
- **症状**：调试用的 `<!-- DEBUG ... -->` 放进 `{% liquid %}` 块后：① `theme dev` 日志报 `Liquid syntax error (line 53): Unknown tag '  <!-- DEBUG ...'`；② **该文件不再被同步到预览主题**，页面继续用旧版本，表现为"改了没反应"。
- **原因**：`{% liquid %}` 内只接受 Liquid 语句，HTML 会被当成未知标签。
- **解决**：调试输出放在 HTML 上下文（`{% liquid %}` 块外）。
- **附带**：这类错误**不会**在页面上报错，只在 `theme dev` 日志里；改完文件务必看一眼同步日志（`Synced » update ...`）。

### P34 · CSS 权重：主题自带的规则会压过同权重的自定义规则
- **症状**：颜色组只排 2 列（预期 9 列）。真实渲染显示 fieldset 的 `display` 是 `grid` 而不是 `block`。
- **原因**：主题自带规则
  ```css
  variant-picker[data-block-id][data-template-product-match]
    .variant-option--buttons:not(.variant-option--swatches) {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  ```
  权重是 **(0,4,1)**（2 属性 + 1 类 + `:not()` 内 1 类 + 1 元素）。自定义的 `.color-group[data-color-group][data-group-handle].variant-option--buttons` 只有 **(0,4,0)**，**少一个元素权重** → 输。
- **解决**：把自定义规则提到 **(0,5,0)** 以上：多挂属性选择器（`.color-group[data-color-group][data-group-handle][data-mv-option-kind].variant-option--buttons`）。
- **教训**：用 class 复用主题样式时，必须先算权重再写；`(0,x,0)` 永远小于 `(0,x,1)`。

### P35 · 同权重的 CSS 规则会被编译器重排 → 用互斥变量避免顺序依赖
- **症状**：五种"选中样式"全部显示成实心描边；其中一条规则还"凭空消失"。
- **原因**：① 编译产物（Lightning CSS）会重排/合并同权重规则，写在后面的 `solid` 压过了其它样式的 `box-shadow`；② 规则可能被合并优化掉。
- **解决**：让各样式**互斥地设置同一个 CSS 变量**，基础规则用 `var()` 取值 —— 一个元素只会命中其中一条，天然不冲突：
  ```css
  .color-group[data-selected-style='solid'] { --color-group-selected-shadow: 0 0 0 2px ...; }
  .color-group[data-selected-style='bar']  { --color-group-selected-shadow: 0 0 0 1px ...; }
  .color-group__swatch--current { box-shadow: var(--color-group-selected-shadow, ...); }
  ```

### P36 · `::after` 的百分比定位基准不是"卡片"，气泡三角会歪
- **症状**：tooltip 三角偏左十几像素，看起来没对准色卡中心。
- **原因**：`::after` 的 `left: 50%` 基准是**其 containing block**（tooltip 自身）的 **content box**（不含 padding），不是色卡宽度。
- **解决**：把箭头做成**独立元素**（`.color-group__tooltip-arrow`），直接相对 `.color-group__swatch`（`position: relative`）定位 → 永远对准卡片中心。

### P37 · CSS transition 会污染自动化测试读到的 computed style
- **症状**：脚本里 `setAttribute('data-selected-style', 'bar')` 后立刻读 `getComputedStyle(el).boxShadow`，拿到的仍是旧值（实心描边）。
- **原因**：`box-shadow` 有 `transition: .2s`，读到的是**过渡中间值/起始值**。
- **解决**：切换后 `waitForTimeout(300~400)` 再读；或临时关掉 transition。
- **教训**：改完样式"没生效"时，先怀疑：① CSS 还没编译；② 过渡动画；③ 权重；再怀疑代码。

### P38 · `{% stylesheet %}` 编译成 CDN 产物后不会立刻更新
- **症状**：改了 CSS 后本地预览仍是旧样式；抓 `compiled_assets/styles.css` 发现内容是新的，但页面表现是旧的。
- **原因**：`{% stylesheet %}` 会被 Shopify 编译进 `compiled_assets/styles.css`（带 `?v=` 版本号），编译有延迟；同一 URL 还可能被 CDN/浏览器缓存。
- **解决**：改完 CSS 后等几秒再测；必要时给 URL 加随机 query 绕过缓存；核对**浏览器实际加载的** CSS（`document.styleSheets`）而不是自己 curl 的那份。

### P39 · Windows 上 Edge 无头截图不可用，用 playwright-core 复用系统 Edge
- **症状**：`msedge --headless=new --screenshot=... ` 报一堆 ERROR 且不产出文件；`--dump-dom` 输出为空。
- **解决**：装 `playwright-core`（不下载浏览器），用 `executablePath` 指向系统 Edge：
  ```js
  const { chromium } = require('playwright-core');
  const browser = await chromium.launch({ executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe' });
  ```
  可直接读 `getComputedStyle`、用 CDP `CSS.getMatchedStylesForNode` 看命中规则 —— 比截图更适合定位 CSS 问题。
- **附带**：`page.goto` 用 `waitUntil: 'domcontentloaded'` + 固定等待，别用 `networkidle`（页面有长连接会超时）。

### P41 · 文件里的 BOM 会在 flex 容器里撑出空白（间距永远调不准）
- **症状**：某个区块上下多出 30~40px 空白，margin/padding/gap 全部调成 0 也消不掉；隐藏该区块后空白依旧（说明不是它自己的间距），但父容器里多出一个"看不见的节点"。
- **原因**：文件以 **UTF-8 BOM**（`EF BB BF`）开头时，Liquid 会把 BOM 原样输出为第一个文本节点。**BOM (U+FEFF) 不是 collapsible whitespace**，在 flex 容器里不会被忽略，而是生成一个**匿名 flex item**（行高约 17px）→ 额外空白 = 匿名项高度 + 一次 row-gap。
- **定位方法**（Playwright）：遍历父容器的 `childNodes`，对文本节点用 `Range.getBoundingClientRect()` 量盒子，能看到那个"看不见的节点"：
  ```js
  [...parent.childNodes].forEach((node) => {
    if (node.nodeType === 3) {
      const r = document.createRange();
      r.selectNodeContents(node);
      console.log(JSON.stringify(node.textContent.slice(0, 20)), r.getBoundingClientRect());
    }
  });
  ```
- **解决**：去掉文件头 BOM。**本项目的教训**：用 PowerShell `Set-Content -Encoding UTF8` 改 liquid 文件会写入 BOM（PS 5.1 的 UTF8 带 BOM），改文件一律用编辑器工具或 `[System.IO.File]::WriteAllText($p, $text, (New-Object System.Text.UTF8Encoding($false)))`。
- **排查脚本**（全主题扫 BOM）：
  ```powershell
  Get-ChildItem -Recurse -Path theme -Include *.liquid,*.json,*.js,*.css | ForEach-Object {
    $b=[System.IO.File]::ReadAllBytes($_.FullName)
    if($b[0] -eq 0xEF -and $b[1] -eq 0xBB -and $b[2] -eq 0xBF){ $_.FullName }
  }
  ```

### P42 · 隐藏元素后仍有空白，别急着归因给"主题机制"
- **症状**：一段空白在隐藏可疑元素后依然存在，容易误判为"主题既有的吸顶预留/间距机制"，从而放弃修复。
- **教训**：先做**对照实验**（隐藏候选元素 → 重测坐标），把空白归属确定到具体节点再动手；隐藏后仍在 = 不是它的责任，但还要继续用 Range/childNodes 找出真正的占位者（见 P41）。
- **附带**：本项目最终靠"逐个 childNode 量盒子"才抓到 BOM 节点 —— 常规的 `getComputedStyle` 全部显示 0px/正常，**DOM 层面查不出 flex 匿名项**。

### P40 · 跨产品跳转要带尺码，必须自己算变体映射
- **症状**：点色块跳到另一颜色的产品页，尺码被重置。
- **原因**：不同产品的变体 id 不同，`?variant=` 不能跨产品复用。
- **解决**：渲染时把每个成员产品的「尺码名 → 变体 id」映射以 JSON 放进 `data-sizes`，前端按当前选中的尺码名查表拼 `?variant=`：
  ```liquid
  assign size_value_json = variant_size | json
  assign size_pairs = size_pairs | append: '{"size":' | append: size_value_json | append: ',"variant":' | append: member_variant.id | append: '},'
  ```
- **附带**：取尺码值不要用 `variant['option2']` 动态索引（不可靠），按 position 显式取 `option1/option2/option3`。
