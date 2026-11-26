# Size Guide 页面预览

在本地浏览器打开 [Size Guide demo](../demos/size-guide.html) 即可体验，图片和样式均随仓库提供。

现有独立页通过 `sections/size-guide.liquid` 的标签切换尺码表与量体说明。此方案把两者放在同一页，桌面并排，手机上下排列，顶部链接可直接定位。单位开关紧靠表格，五列在手机上也可同时阅读。量体区直接展示商家提供的成品图，图下可展开五项文字说明，方便手机阅读。

演示表格取自 `theme/snippets/size-chart-rows.liquid` 的 16 行厘米数据，英寸按现有规则换算。量体成品图位于 `demos/size-guide-assets/how-to-measure.png`，缎面照片复用 About Us demo 素材。页面使用黑白配色，两张图片均通过 CSS 显示为灰度。此版本仅供设计预览。落地时应继续引用共用尺码表，并保留主题编辑器中商家配置的标题、图片及说明。
