# 踩坑点清单

> 每条格式：**症状 → 原因 → 解决**。按影响面排序，前几条是最容易造成事故的。

## 一、推送与内容安全（最高优先级）

### P1 · 推送后主题编辑器里的配置被还原
- **症状**：改了代码推送后，编辑器里配置的 Banner 图、文案、区块全部变回旧版本。
- **原因**：`templates/*.json` 与 `config/settings_data.json` 保存的是商家在编辑器里配置的内容（图片、文案、区块结构与设置值）。Shopify 只把它们写回线上，不同步到本地。全量 `theme push` 用本地旧文件覆盖了线上新内容。
- **解决**：
  - 日常只推代码：`.\scripts\push-live.ps1`（仅 `assets/ sections/ snippets/ blocks/ layout/ locales/`）
  - 改模板结构：先 `theme pull --only "templates/*.json" --only "config/settings_data.json" --path theme`，再改再推
  - 已误覆盖时：无法从本地找回，只能重新在编辑器配置（本地应保持 pull 后的版本）
  - **不要为了修改某个设置值去推 `templates/*.json`**：拉取到的快照在你改动之后就已经过期，推回去会连带覆盖商家在这期间做的其他修改（文案、图片、区块）。默认值请改 schema，实例值请商家在编辑器里调整。

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
- **解决**：忽略。这是本项目 3 个基线错误之一（另外两个见下）。

### P12 · `theme check` 的 3 个基线错误（已知，非本次改动引入）
1. `blocks/disclosures.liquid` / `snippets/cart-disclosure-tooltip.liquid`：`applicable_disclosures` filter 误报（2 个）
2. `templates/product.json`：`JSONMissingBlock` — 引用 AliReviews app 区块（`shopify://apps/ali-reviews/...`），店铺未安装该 app（1 个）
- **判定标准**：改动后仍是这 3 个，即未引入新问题。

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
- **方法 2（快速）**：按业务特征词扫描 diff（`jimiss|dress|size.?guide|coupon|bq-` 等），但会误报/漏报，需配合方法 1。
- **方法 3（结构）**：`| 2 -` 这类极小差异多为官方版本演进，可保留新版。

### P25 · 整体覆盖某个 snippet 前先确认依赖
- 覆盖前检查：调用方（`render 'xxx'`）、它依赖的 snippet、传入参数是否一致。
- 本项目 `variant-main-picker.liquid` 因定制与官方重构深度耦合，选择整包采用旧版，前提是调用方补回 `block: block` 参数。
