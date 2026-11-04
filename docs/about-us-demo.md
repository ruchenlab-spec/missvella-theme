# About Us · 高端杂志风 HTML Demo

2026-11-04，商家要求设计 About Us 页面的 HTML demo。

入口：`demos/about-us-editorial.html`，直接用浏览器打开即可。样式为同目录的 `about-us-editorial.css`；图片放在 `demos/about-us-assets/`。无需安装依赖、构建或启动服务；所有素材均在本地，无外部字体依赖。分享时保留这一目录结构。

## 设计方向

暖象牙白、墨黑和酒红，衬线大标题配合斜体、杂志眉栏、细分隔线、章节编号和非对称留白。使用系统 Bodoni MT / Didot / Times New Roman 字体回退，实际字形随电脑字体环境变化。

页面依次为杂志封面、品牌故事、暗色宣言、三个品牌价值观、面料细节、集合入口和大字标页脚。英文文案是提案，不包含未经确认的创立年份、生产地、认证、客户数量或创始人经历。

750px 以下切换为单列，含原生折叠菜单；页内导航可用。集合按钮打开项目已配置店铺的 `/collections/all`。右下角「设计说明」打开原生 dialog，可用关闭按钮、Escape 或点击遮罩关闭。支持键盘焦点、跳过导航、图片替代文本和减少动态效果偏好。

## 素材与生成记录

使用内置 imagegen 生成两张概念摄影，均已检查并复制到项目。它们不是实际商品或制作过程的证据；正式使用前由商家确认或替换。

- `demos/about-us-assets/campaign.png`：1024 × 1536，酒红礼服和暖色石材建筑。
- `demos/about-us-assets/satin-study.png`：1536 × 1024，酒红缎面及薄纱静物。

封面摄影最终提示词：

```text
Use case: photorealistic-natural. Asset type: luxury eveningwear editorial photograph for Missvella About Us website demo, portrait 2:3 composition. An adult female fashion model with dark swept-back hair wearing a flowing deep burgundy satin evening gown, sculptural draped bodice, long fluid skirt pooling on warm pale travertine floor. Full body, model positioned centrally with generous pale stone wall above her, a tall carved arch opening on the right. Mediterranean modernist atelier, hard afternoon sunlight and beautiful architectural shadows, warm ivory, wine red, restrained film grain, authentic skin and realistic textile sheen. Sophisticated independent fashion magazine photography, quiet confident pose, subtle movement in fabric. No text, no logos, no borders, no collage, no watermark.
```

静物摄影最终提示词：

```text
Use case: photorealistic-natural. Asset type: wide 3:2 luxury fashion editorial still life for Missvella eveningwear About Us demo. Extreme tactile close view of deep wine burgundy silk satin draped in sumptuous sculptural waves across a pale travertine atelier worktable, one fold of ivory sheer tulle softly crossing a corner, a single threaded fine needle sitting on a small piece of fabric near lower edge. Rich fine grain and beautiful glossy fabric highlights, directional afternoon window light, warm cream shadows, quiet refined artisan fashion mood, sophisticated independent magazine photography. Restrained composition with beautiful negative space in upper third, realistic materials, editorial rather than ecommerce flat lay. No people, no text, no logos, no watermark, no collage.
```

## 验证与发布范围

按项目快速交付要求，只进行一次必要静态检查：本地文件引用、锚点与 ID、HTML 标签配对、脚本语法、CSS 括号及图片文件有效性。不启动浏览器、不截图、不运行主题检查，因为本次没有修改 Liquid 或主题代码。

此次仅交付独立 demo，不执行 Shopify theme push。后续若落地为主题区块，遵循项目内容保护规则：只推新增 section / asset 等代码，实例图片、文案与页面结构由商家在主题编辑器配置。
