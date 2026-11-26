# Size Guide 页面预览

在本地浏览器打开 [Size Guide demo](../demos/size-guide.html) 即可体验，图片和样式均随仓库提供。

此方案采用黑白编辑排版，桌面并排展示尺码表与量体图，手机端上下排列，顶部链接可直接定位。尺码表用黑底表头和细分隔线，随页面滚动并固定表头，手机端五列同时展示。量体区展示商家提供的原色成品图，图下保留量体提示。

演示表格取自 `theme/snippets/size-chart-rows.liquid` 的 16 行厘米数据。页面初始显示英寸，按现有规则换算并四舍五入至一位小数。表头旁可切换 IN / CM。量体成品图位于 `demos/size-guide-assets/how-to-measure.png`。
