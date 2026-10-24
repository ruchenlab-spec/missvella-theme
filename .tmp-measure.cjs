const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('https://6icwx6-yv.myshopify.com/collections/all', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(6000);

  const data = await page.evaluate(() => {
    const pick = (el) => {
      if (!el) return null;
      const s = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return {
        left: +r.left.toFixed(1), right: +r.right.toFixed(1), width: +r.width.toFixed(1),
        padL: s.paddingLeft, padR: s.paddingRight, mL: s.marginLeft,
        pos: s.position, display: s.display,
      };
    };
    const q = (sel) => document.querySelector(sel);
    // find the mystery chip above the sidebar
    const chipCandidates = [...document.querySelectorAll('a,button,div')]
      .filter((el) => el.offsetParent !== null && /×|✕|remove/i.test(el.textContent) && el.textContent.trim().length < 40 && /sheath|satin|silhouette/i.test(el.textContent))
      .slice(0, 4)
      .map((el) => ({ tag: el.tagName, cls: el.className && el.className.toString().slice(0, 80), html: el.outerHTML.slice(0, 220), parentCls: el.parentElement && el.parentElement.className.toString().slice(0, 80) }));
    return {
      title: document.title,
      bar: pick(q('.cf-colour-bar')),
      pills: pick(q('.cf-bar-pills')),
      activeBar: pick(q('.cf-active-bar')),
      grid: pick(q('.main-collection-grid')),
      gridInner: pick(q('.main-collection-grid > div')),
      ul: pick(q('ul.product-grid')),
      card: pick(q('.product-grid__card')),
      sidebar: pick(q('.facets-block-wrapper:not(#filters-drawer) .facets')),
      chipCandidates,
    };
  });
  console.log(JSON.stringify(data, null, 1));
  await browser.close();
})().catch((e) => { console.error('ERR', e.message); process.exit(1); });
