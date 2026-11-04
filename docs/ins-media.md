# INS 媒体展示

实现文件：`theme/sections/ins-media-grid-autoplay.liquid`。

## 宽度与版式（2026-11-04）

- 宽度使用主题原生 `section--page-width` / `section--full-width` 网格，编辑器选择「页面宽度／全宽」。页面宽度跟随全局布局，不再使用独立的最大宽度。
- 全宽模式提供独立左、右边距（0–100px），复用 `spacing-style` 的响应式缩放。页面宽度模式不叠加这两个边距。
- 引导文字、标题、副标题、账号、说明文字和按钮文字分别选择主题版式预设：段落、H1–H6。标题默认 H2，其他默认段落；字体、字号、字重、行高和大小写由主题预设控制。主题原生类负责渲染，不再保留像素字号和固定大写等覆盖。
- 悬停说明与媒体下方说明共用「说明文字版式」，保留各自颜色表现。已有文案、媒体、链接、颜色和网格设置的 ID 保持不变。
- 删除底部分页圆点及其 CSS、DOM 和 JavaScript。箭头和触摸滑动仍逐列切换；初始状态与响应式重建后会更新箭头禁用状态。

旧 `full_width`、`outer_padding`、`max_width` 和六个 `*_size` 设置退出使用。新设置通过 section schema 提供默认值，不迁移或推送模板实例数据。上线后若需其他宽度或版式，商家直接在主题编辑器选择。

## 验证与部署状态

- 2026-11-04 实际运行 Theme Check：修改前后均为 32 个 error、23 个 warning，无新增问题；INS 文件原有两条图标作用域 warning 保持不变。
- schema JSON、内联 JavaScript 语法和 `git diff --check` 通过。
- JavaScript 行为模拟通过：桌面箭头及边界、移动双行和滑动、跨断点重建、空网格及无需翻页的网格。
- **待上线**：已尝试只推送 `sections/ins-media-grid-autoplay.liquid`，Shopify CLI 返回当前账号无权访问店铺，上传未完成。需先恢复本机 CLI 的店铺授权，再精确推送并核对远端文件或前台效果。

```powershell
shopify theme push --store 6icwx6-yv.myshopify.com --theme 167137378374 --allow-live --path theme --only "sections/ins-media-grid-autoplay.liquid"
```

禁止将本地 `templates/*.json`、`sections/*.json` 或 `config/settings_data.json` 与本次代码一起推送。
