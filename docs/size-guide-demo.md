# Size Guide 页面预览

## 线上 Size Guide

2026-11-26 将 C 方案发布到 [Size Guide](https://missvella.com/pages/size-guide)。桌面侧栏和手机横排标签共用选中滑块及内容淡入，系统减少动态效果时直接切换。尺码表默认 IN。独立页和商品页继续从同一个尺码表片段读取 16 个尺码。

主题编辑器中的标题、副标题、表格标题、默认栏目、单位按钮、量体图与说明设置继续生效。量体区用原色静态图，编辑器选择的图片优先，未选图片时显示随主题提供的成品图。

Shopify CLI 确认当前线上主题 `167137378374` 上传成功。精确推送范围为 `sections/size-guide.liquid`、`snippets/size-chart-rows.liquid`、`assets/size-guide-how-to-measure.png`。

## 初版 Demo

在本地浏览器打开 [Size Guide demo](../demos/size-guide.html) 即可体验，图片和样式均随仓库提供。

页面沿用紧凑的双栏排版和缎面横幅。桌面并排展示尺码表与量体图，手机端上下排列，顶部链接可直接定位。表格用细线分隔，浅灰表头固定，手机端五列同时展示。量体图和缎面照片均以原色显示，图下保留一句量体提示。

演示表格取自 `theme/snippets/size-chart-rows.liquid` 的 16 行厘米数据。页面初始显示英寸，按现有规则换算并四舍五入至一位小数。表头旁可切换 IN / CM。量体成品图位于 `demos/size-guide-assets/how-to-measure.png`。

## 三套布局方案

打开 [Size Guide 预览](../demos/size-guide-concepts.html) 直接查看选定的 C 方案。顶部按钮可回看 A、B。

- **A · 尺码表优先**。居中标题下展开完整尺码表，量体图放在下方。
- **B · 量体图优先**。黑底首屏展示原色量体图，尺码表放在下方白底区。
- **C · 分页切换**。缩小 Size Guide 标题。桌面侧栏的选中指示上下滑动，手机上左右滑动。切换后内容淡入，系统减少动态效果时直接切换。

三套方案共用原色量体图、16 个尺码及 IN / CM 开关。首次打开显示 IN。
