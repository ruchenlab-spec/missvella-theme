const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('https://6icwx6-yv.myshopify.com/collections/all', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(5000);

  // Apply the "Sheath" silhoutte filter via the sidebar checkbox
  const clicked = await page.evaluate(() => {
    const input = [...document.querySelectorAll('.facets-block-wrapper:not(#filters-drawer) input[type="checkbox"]')]
      .find((i) => (i.value || '').toLowerCase() === 'sheath');
    if (!input) return false;
    input.click();
    return true;
  });
  await page.waitForTimeout(4500);

  const desktop = await page.evaluate(() => {
    const pick = (el) => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { left: +r.left.toFixed(1), width: +r.width.toFixed(1), right: +r.right.toFixed(1) };
    };
    const bar = document.querySelector('.cf-colour-bar');
    const card = document.querySelector('.product-grid__card');
    const chips = [...document.querySelectorAll('a,button,div')]
      .filter((el) => el.offsetParent !== null && /sheath/i.test(el.textContent) && el.textContent.trim().length < 60 && /×|✕|close|remove/i.test(el.textContent + el.getAttribute('aria-label') || ''))
      .map((el) => ({
        cls: (el.className || '').toString().slice(0, 90),
        chain: (() => { let c = [], n = el; for (let i = 0; i < 4 && n; i++) { c.push((n.className || n.tagName).toString().slice(0, 50)); n = n.parentElement; } return c.join(' < '); })(),
        html: el.outerHTML.slice(0, 260),
        rect: pick(el),
      }));
    const barCS = bar ? getComputedStyle(bar) : null;
    return {
      url: location.href.slice(0, 120),
      card: pick(card),
      barContent: bar ? { left: +(bar.getBoundingClientRect().left + parseFloat(barCS.paddingLeft)).toFixed(1), right: +(bar.getBoundingClientRect().right - parseFloat(barCS.paddingRight)).toFixed(1) } : null,
      chips,
    };
  });
  console.log('DESKTOP', JSON.stringify(desktop, null, 1));

  // Mobile drawer test
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(1500);
  await page.evaluate(() => {
    const btn = document.querySelector('.facets-toggle__button');
    if (btn) btn.click();
  });
  await page.waitForTimeout(2000);
  const mobile = await page.evaluate(() => {
    const drawer = document.querySelector('#filters-drawer');
    const inner = drawer ? drawer.querySelector('.facets') : null;
    const details = drawer ? drawer.querySelectorAll('details').length : 0;
    const vis = inner ? getComputedStyle(inner).display : 'none';
    return {
      drawerFound: !!drawer,
      innerDisplay: vis,
      innerHeight: inner ? +inner.getBoundingClientRect().height.toFixed(0) : 0,
      groupCount: details,
    };
  });
  console.log('MOBILE', JSON.stringify(mobile));
  await browser.close();
})().catch((e) => { console.error('ERR', e.message); process.exit(1); });
