# 开发工作流与开发习惯

## 一、环境

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

```powershell
.\scripts\push-live.ps1
```

- 推送范围：`assets/ sections/ snippets/ blocks/ layout/ locales/`
- **不会**触碰 `templates/*.json` 与 `config/settings_data.json`，编辑器里的 Banner、图片、区块配置全部保留
- 推送后刷新主题编辑器即可看到效果

### 3.2 需要修改页面结构（`templates/*.json`）

```powershell
# 1) 先把线上最新版本拉回本地（含商家在编辑器里的配置）
shopify theme pull --store 6icwx6-yv.myshopify.com --theme 167137378374 --only "templates/index.json" --path theme

# 2) 修改本地文件（用 node 处理 JSON，见 5.2）

# 3) 推送
.\scripts\push-live.ps1 -IncludeContent
```

### 3.3 修改全局设置（`config/settings_schema.json`）

设置 **schema**（可用选项定义）属于代码，可以随代码推送；**settings_data**（商家选的值）属于内容，不要推。

```powershell
shopify theme push --store ... --theme 167137378374 --allow-live --path theme --only "config/settings_schema.json"
```

## 四、禁止事项

1. ❌ **不要执行全量 `shopify theme push`**（无 `--only`）——会覆盖商家配置。必须全量时用 `.\scripts\push-live.ps1 -PullContent` 或 `-IncludeContent`。
2. ❌ 不要在主题编辑器里改**代码**（`sections/`、`snippets/` 等），后台改动不会回流本地，下次推送即覆盖。
3. ❌ 不要把 `theme_export_*.zip`、临时脚本提交进仓库。
4. ❌ 不要在没有 `--allow-live` 的情况下对 live 主题执行 `theme dev/push`（CLI 会拒绝，属保护机制）。
5. ⚠️ 推送前先 `shopify theme check --path theme`，确认没有新增错误。

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
- 结构验证：`shopify theme check --path theme`（已知 3 个基线错误，见 pitfalls）。
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
