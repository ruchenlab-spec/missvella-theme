# 开发工作流与开发习惯

## 一、环境

> Git 远端：`origin` → `https://github.com/ruchenlab-spec/missvella-theme.git`，默认分支 `main`。Shopify 主题推送与 Git 推送是两个步骤，收工时都应完成。

| 组件 | 版本 | 备注 |
|---|---|---|
| OS | Windows | PowerShell 5.1 |
| Git | 2.55.0 | 已配置仓库级 user.name/email |
| Node.js | 24.20.0 | 用于处理 JSON、脚本 |
| Shopify CLI | 4.9.4 | `npm i -g @shopify/cli` |
| 代理 | `http://127.0.0.1:7897` | 仅在访问 GitHub 等受限网络时使用 |

**PowerShell 执行策略**：已设为 `CurrentUser = RemoteSigned`（否则 `shopify.ps1` 被禁止运行）。新开的终端若仍报错，在当前窗口执行：

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

## 二、登录授权

Shopify CLI 使用浏览器 OAuth。**必须在开发者自己的交互终端执行**（AI 侧执行环境非 TTY，会被拒绝并提示 `Flag not specified: --alias`）：

```powershell
shopify auth login      # 浏览器授权
shopify auth logout     # 切换账号时使用
```

令牌保存在本机，后续免登录。

## 三、日常开发流程（最重要）

### 3.1 只改代码（绝大多数情况）

自 2026-10-31 起，商家授权代码修改检查通过后直接推送，不再逐次询问推送或保存确认。编辑器中的修改由商家自行及时保存；若商家明确要求暂缓某次推送，遵从当次指示。

```powershell
.\scripts\push-live.ps1
```

- 推送范围：`assets/ sections/ snippets/ blocks/ layout/ locales/`
- **不会**触碰 `templates/*.json` 与 `config/settings_data.json`，编辑器里的 Banner、图片、区块配置全部保留
- 推送后刷新主题编辑器即可看到效果
- 优先使用 `shopify theme push --only "具体代码路径"` 精确推送本次改动；推送后核对远端文件或前台行为，再更新文档、提交 Git 并执行 `git push origin main`。

### 3.2 需要修改页面结构或实例内容

由商家在主题编辑器或 Shopify 后台操作。禁止推送 `templates/*.json`、`sections/*.json`、`config/settings_data.json`，也不要使用「pull → 修改 → push」更新实例设置。旧脚本的 `-IncludeContent` / `-PullContent` 选项不属于允许工作流，禁止使用。

### 3.3 修改全局设置（`config/settings_schema.json`）

设置 **schema**（可用选项定义）属于代码，可以随代码推送；**settings_data**（商家选的值）属于内容，不要推。

```powershell
shopify theme push --store ... --theme 167137378374 --allow-live --path theme --only "config/settings_schema.json"
```

## 四、禁止事项

1. ❌ **不要推送 `theme/templates/*.json` 与 `theme/config/settings_data.json`**——它们保存商家在编辑器里配置的文案/图片/区块，本地副本永远是过期快照，推送即覆盖。
2. ❌ **不要用「pull → 改一个值 → push」修改实例设置**——拉取到推送之间商家的改动会一并被旧快照覆盖。默认值改 schema，实例值让商家在编辑器调。
3. ❌ 不要执行全量 `shopify theme push`（无 `--only`）——同样会覆盖商家配置。
4. ❌ 不要在主题编辑器里改**代码**（`sections/`、`snippets/` 等），后台改动不会回流本地，下次推送即覆盖。
5. ❌ 不要把 `theme_export_*.zip`、临时脚本提交进仓库。
6. ⚠️ 推送前先 `shopify theme check --path theme`，确认没有新增错误。

## 四之二、推送前检查清单（每次推送都要过一遍）

- [ ] 本次推送的 `--only` 列表仅包含代码；`config/` 只允许精确的 `config/settings_schema.json`
- [ ] 按商家长期授权直接推送，不再逐次询问保存状态；商家明确要求暂缓时遵从
- [ ] 没有为了改某个设置值而拉取/推送模板
- [ ] 推送后将对应代码拉到临时目录核对，或验证前台行为；不覆盖本地商家内容快照
- [ ] 更新相关文档、提交本地 Git、同步 `origin/main`；不提交临时截图或缓存

### 4.1 内容类文件（`templates/*.json`、`sections/*.json`）只改本地副本

- 本地副本是**快照**，不是线上真相。改它们只为让仓库保持整洁、避免第三方内容残留。
- 改完**不要推送**。线上对应内容必须由商家在主题编辑器里改，开发者不代劳。
- 已知的待商家在编辑器同步的项：
  - `page.faqs` / `page.about` 的品牌文案与外链（本地已替换为 Missvella 文案 + 站内相对路径）
  - `page.about` 的旧站 hero 图（本地已清空）
  - `footer-group` 的旧站 logo 与社交账号（本地已清空，Instagram 改为 `@missvella`）
- 不推送模板；后续线上结构调整继续由商家在编辑器完成。

## 五、开发习惯

### 5.1 改代码
- 所有主题文件在 `theme/` 下，路径即上线路径。
- 新增 section/snippet 后立即跑 `theme check`，Liquid 语法错误会导致整站或区块白屏。
- 中文字面量在 schema 里可直接用（如 `"label": "圆形直径"`），无需翻译键；官方已有翻译键（`t:settings.xxx`）优先复用。

### 5.2 处理 JSON 模板
- Shopify 模板 JSON 是**压缩单行**，且 `pull` 回来的文件顶部带 `/* ... */` 注释，`JSON.parse` 前必须剥离：
  ```js
  const raw = fs.readFileSync(p, 'utf8');
  const json = JSON.parse(raw.replace(/^\s*\/\*[\s\S]*?\*\/\s*/, ''));
  fs.writeFileSync(p, JSON.stringify(json));  // 回写时注释会丢，Shopify 可接受
  ```
- 区块必须用 **对象 + `block_order`** 格式；数组格式在 Horizon 架构下会被丢弃（见 pitfalls #12）。

### 5.3 Git
- 提交信息英文，首行 ≤ 72 字符，正文列要点。
- 每次改完即提交，保持工作区干净，便于回滚。
- `.gitattributes` 已统一 LF，避免 Windows CRLF 污染 diff。

### 5.4 验证
- 结构验证：`shopify theme check --path theme`。2026-10-31 基线为 34 个错误、23 个警告（含其他语言缺失翻译等既有问题）；要求本次改动无新增问题，旧版基线记录见 pitfalls。
- 渲染验证：`curl http://<预览地址>` 检查关键 class/文案是否出现（无浏览器时）。
- 视觉验证：开发者在主题编辑器里确认。

## 六、常用命令速查

| 命令 | 用途 |
|---|---|
| `shopify organization list` | 列出组织（拿组织 ID） |
| `shopify store list --organization-id 236239148` | 列出组织下店铺（非交互必须带 ID） |
| `shopify theme list --store <s>` | 主题列表与 ID |
| `shopify theme pull --store <s> --theme <id> --only "templates/*.json" --path theme` | 拉取线上内容 |
| `shopify theme push --store <s> --theme <id> --allow-live --path theme --only "sections/*"` | 精准推送 |
| `shopify theme publish --store <s> --theme <id>` | 设为 live |
| `shopify theme check --path theme` | 静态检查 |
| `shopify theme delete --store <s> --theme <id> --force` | 删除主题 |

## 七、故障排查

| 现象 | 处理 |
|---|---|
| `shopify auth login` 报 `--alias` required | AI 侧非 TTY 限制，改由开发者在自己终端执行 |
| 模板推送失败：`设置"video"值未指向适用的 Shopify 托管的视频资源` | 该模板里有失效视频引用，清空后重推（图片引用不会阻塞） |
| 编辑器配置被还原 | 曾用全量 push 覆盖；从线上 pull 回来，改用安全推送脚本 |
| 端口 9292 被占用 | 停止 `theme dev` 进程，或 `--port 9293` |
| `shotify` 无法加载 `shopify.ps1` | 执行策略问题，见第一节 |
