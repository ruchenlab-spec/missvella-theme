// Run with Node and Playwright installed. Optional: PLAYWRIGHT_MODULE and
// PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH select an existing local installation.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const http = require('node:http');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const repo = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(repo, 'theme', file), 'utf8');
const KEY = 'missvella_wishlist_v1';
const icon = read('snippets/wishlist-icon.liquid');
const configText = read('snippets/wishlist-assets.liquid').match(/type="application\/json">([\s\S]*?)<\/script>/)[1];
const config = JSON.parse(configText
  .replace(/{{ settings.wishlist_enabled \| default: true, allow_false: true \| json }}/, 'true')
  .replace(/{{ routes.root_url \| json }}/, '"/"')
  .replace(/{{ wishlist_url \| json }}/, '"/search?wishlist=1"')
  .replace(/{{ localization.country.currency.iso_code \| default: shop.currency \| json }}/, '"USD"')
  .replace(/{% if request.page_type[\s\S]*?{% endif %}/, 'false'));
const card = (handle, title = handle) => `<div class="card-gallery"><a href="/products/${handle}"><div class="fixture-photo"></div></a><wishlist-toggle class="mv-wishlist-toggle" data-handle="${handle}" data-title="${title}" hidden><button type="button" aria-pressed="false">${icon}</button></wishlist-toggle><p>${title}</p></div>`;
const pageMarkup = read('snippets/wishlist-page.liquid')
  .replace(/{%- comment -%}[\s\S]*?{%- endcomment -%}/, '')
  .replace(/{% if settings.wishlist_enabled == false %}[\s\S]*?{% else %}([\s\S]*?){% endif %}/, '$1')
  .replace('{{ routes.all_products_collection_url }}', '/collections/all');
let failProduct = true;
let active = 0;
let peakActive = 0;
const fixture = (pathname = '') => `<!doctype html><html lang="en"><head><style>
  *{box-sizing:border-box}body{margin:0;font-family:Arial;--font-body--family:Arial;--color-foreground:#302720;--color-foreground-rgb:48 39 32;--color-background:#fff;--color-primary-button-background:#87704f;--color-primary-button-text:#fff;--page-margin:20px}
  [hidden]{display:none!important}a{color:inherit}header{padding:16px;display:flex;justify-content:flex-end;border-bottom:1px solid #ddd}.svg-wrapper{display:flex}
  .fixture-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;padding:20px}.card-gallery{position:relative}.fixture-photo{aspect-ratio:2/3;background:#d2c3b5}.button{display:inline-block;padding:16px 24px;background:#87704f;color:white;text-decoration:none}
  </style><link rel="stylesheet" href="/assets/mv-wishlist.css"></head><body><header><a data-wishlist-link class="mv-wishlist-link" href="/search?wishlist=1"><span class="svg-wrapper">${icon}</span><span class="mv-wishlist-link__count" data-wishlist-count hidden></span></a></header><main id="MainContent"><div class="fixture-grid">${card('beige-dress')}${card('black-dress')}${card('beige-dress')}</div>${pageMarkup}</main><div class="mv-wishlist-notice" role="status" data-wishlist-notice></div><script id="mv-wishlist-config" type="application/json">${JSON.stringify(pathname === '/disabled' ? { ...config, enabled: false } : pathname.startsWith('/fr/') ? { ...config, root: '/fr/', url: '/fr/search?wishlist=1', currency: 'EUR' } : config)}</script><script>
  if(new URLSearchParams(location.search).get('wishlist')==='1'||location.pathname==='/pages/wishlist')document.documentElement.classList.add('mv-wishlist-route');
  </script><script src="/assets/mv-wishlist.js" defer></script></body></html>`;
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname.startsWith('/assets/')) {
    const file = url.pathname.slice(1);
    res.setHeader('Content-Type', file.endsWith('.js') ? 'application/javascript' : 'text/css');
    return res.end(read(file));
  }
  const match = url.pathname.match(/\/products\/([a-z0-9-]+)\.js$/);
  if (match) {
    active++; peakActive = Math.max(peakActive, active);
    await new Promise((resolve) => setTimeout(resolve, 40));
    active--;
    res.setHeader('Content-Type', 'application/json');
    if (match[1] === 'missing-dress') { res.statusCode = 404; return res.end('{}'); }
    if (match[1] === 'flaky-dress' && failProduct) { res.statusCode = 503; return res.end('{}'); }
    return res.end(JSON.stringify({ handle: match[1], title: match[1] === 'black-dress' ? '<img src=x onerror=alert(1)>' : 'Beige Chiffon Dress', price: 15900, available: true, featured_image: null }));
  }
  res.setHeader('Content-Type', 'text/html');
  res.end(fixture(url.pathname));
});
const profiles = [];
const contexts = new Set();
const options = { headless: true };
if (process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH) options.executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
async function context(profile) {
  profile ||= fs.mkdtempSync(path.join(os.tmpdir(), 'mv-wishlist-'));
  if (!profiles.includes(profile)) profiles.push(profile);
  const ctx = await chromium.launchPersistentContext(profile, options);
  contexts.add(ctx);
  return { ctx, profile };
}
const savedState = (items, updatedAt = Date.now()) => ({ v: 1, updatedAt, items });
async function seed(page, items) {
  await page.evaluate(({ key, data }) => localStorage.setItem(key, JSON.stringify(data)), { key: KEY, data: savedState(items) });
}
async function run() {
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const first = await context();
  let ctx = first.ctx;
  let page = await ctx.newPage();
  await page.goto(origin + '/collections/all');
  const heart = page.locator('wishlist-toggle[data-handle="beige-dress"] button').first();
  await heart.click();
  assert.equal(await page.locator('wishlist-toggle button[aria-pressed="true"]').count(), 2, 'duplicate product hearts sync');
  assert.equal(new URL(page.url()).pathname, '/collections/all', 'heart does not follow product link');
  assert.equal(await page.locator('[data-wishlist-count]').textContent(), '1');
  await heart.click();
  assert.equal(await page.locator('[data-wishlist-count]').isHidden(), true);
  await heart.click();
  await page.reload();
  assert.equal(await page.locator('wishlist-toggle button[aria-pressed="true"]').count(), 2, 'reload retains saved item');
  await page.locator('wishlist-toggle[data-handle="black-dress"] button').click();
  await page.evaluate((markup) => document.querySelector('.fixture-grid').insertAdjacentHTML('beforeend', markup), card('beige-dress'));
  assert.equal(await page.locator('wishlist-toggle button[aria-pressed="true"]').count(), 4, 'AJAX-inserted cards hydrate');
  await page.evaluate(() => {
    const toggle = document.querySelector('wishlist-toggle:last-of-type');
    toggle.dataset.handle = 'unsaved-dress';
    toggle.querySelector('button').setAttribute('aria-pressed', 'true');
  });
  await page.waitForFunction(() => document.querySelector('wishlist-toggle[data-handle="unsaved-dress"] button').getAttribute('aria-pressed') === 'false');
  await page.evaluate(() => {
    const toggle = document.querySelector('wishlist-toggle[data-handle="unsaved-dress"]');
    toggle.dataset.handle = 'beige-dress';
    toggle.querySelector('button').setAttribute('aria-pressed', 'false');
  });
  await page.waitForFunction(() => document.querySelectorAll('wishlist-toggle button[aria-pressed="true"]').length === 4);
  console.log('PASS toggle, duplicate state, reload, AJAX-inserted cards, no product navigation');

  await ctx.close(); contexts.delete(ctx);
  ({ ctx } = await context(first.profile));
  page = await ctx.newPage();
  await page.goto(origin + '/search?wishlist=1');
  await page.waitForFunction(() => document.querySelectorAll('.mv-wishlist-item__price').length === 2);
  assert.equal(await page.locator('[data-wishlist-count]').textContent(), '2', 'browser restart retains saved items');
  assert.equal(await page.locator('.mv-wishlist-item__title').first().textContent(), '<img src=x onerror=alert(1)>');
  assert.equal(await page.locator('.mv-wishlist-item__title img').count(), 0, 'product text cannot inject HTML');
  assert.match(await page.locator('.mv-wishlist-item__price').first().textContent(), /159/);
  const tab = await ctx.newPage();
  await tab.goto(origin + '/collections/all');
  await tab.locator('wishlist-toggle[data-handle="black-dress"] button').click();
  await page.waitForFunction(() => document.querySelectorAll('.mv-wishlist-item').length === 1);
  await page.locator('[data-remove-handle]').click();
  await page.waitForFunction(() => !document.querySelector('[data-wishlist-empty]').hidden);
  await tab.waitForFunction(() => document.querySelector('[data-wishlist-count]').hidden);
  await page.reload();
  assert.equal(await page.locator('.mv-wishlist-item').count(), 0, 'removed products do not reappear');
  console.log('PASS browser restart, live details, text safety, cross-tab sync, removal persists');

  await seed(page, ['missing-dress', 'flaky-dress', 'beige-dress']);
  await page.goto(origin + '/pages/wishlist');
  await page.waitForFunction(() => document.querySelectorAll('.mv-wishlist-item[aria-busy]').length === 0);
  assert.equal(await page.locator('.mv-wishlist-item').count(), 3, 'failed requests do not delete saved items');
  assert.match(await page.locator('[data-wishlist-page]').textContent(), /no longer available/);
  assert.match(await page.locator('[data-wishlist-page]').textContent(), /saved item is still here/);
  failProduct = false;
  await page.getByRole('button', { name: 'Try again', exact: true }).click();
  await page.waitForFunction(() => document.querySelectorAll('.mv-wishlist-item__price').length === 2);
  assert.equal((await page.evaluate((key) => JSON.parse(localStorage.getItem(key)).items, KEY)).length, 3);
  await seed(page, Array.from({ length: 12 }, (_, i) => `dress-${i}`));
  await page.reload();
  await page.waitForFunction(() => document.querySelectorAll('.mv-wishlist-item__price').length === 12);
  assert.ok(peakActive <= 4, `bounded fetch concurrency: ${peakActive}`);
  for (const width of [320, 390, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `no overflow at ${width}px`);
  }
  console.log('PASS dedicated-page route, missing/offline products, retry, bounded requests, responsive layout');

  const fallback = await context();
  await fallback.ctx.addInitScript(() => {
    Storage.prototype.setItem = () => { throw new DOMException('Disabled', 'SecurityError'); };
  });
  const cookiePage = await fallback.ctx.newPage();
  await cookiePage.goto(origin + '/collections/all');
  await cookiePage.locator('wishlist-toggle button').first().click();
  await cookiePage.reload();
  assert.equal(await cookiePage.locator('[data-wishlist-count]').textContent(), '1', 'cookie fallback survives refresh');
  const cookies = await fallback.ctx.cookies();
  const cookie = cookies.find((entry) => entry.name === 'mv_wishlist_v1');
  assert.ok(cookie.expires > Date.now() / 1000 + 300 * 86400, 'cookie has a persistent one-year expiry');
  assert.equal(cookie.sameSite, 'Lax');
  await fallback.ctx.close(); contexts.delete(fallback.ctx);
  const restartedFallback = await context(fallback.profile);
  const restored = await restartedFallback.ctx.newPage();
  await restored.goto(origin + '/collections/all');
  assert.equal(await restored.locator('[data-wishlist-count]').textContent(), '1', 'cookie survives browser restart');
  console.log('PASS localStorage blocked: persistent cookie fallback, refresh, browser restart');

  const blocked = await context();
  await blocked.ctx.addInitScript(() => {
    Storage.prototype.setItem = () => { throw new DOMException('Disabled', 'SecurityError'); };
    Object.defineProperty(document, 'cookie', { get: () => '', set: () => {} });
  });
  const blockedPage = await blocked.ctx.newPage();
  await blockedPage.goto(origin + '/collections/all');
  await blockedPage.locator('wishlist-toggle button').first().click();
  assert.equal(await blockedPage.locator('wishlist-toggle button[aria-pressed="true"]').count(), 0);
  assert.match(await blockedPage.locator('[data-wishlist-notice]').textContent(), /could not save/);
  console.log('PASS both storage mechanisms blocked: explicit error, no false saved state');

  await page.goto(origin + '/collections/all');
  await page.evaluate((key) => { localStorage.setItem(key, '{bad json'); document.cookie = 'mv_wishlist_v1=broken; Path=/'; }, KEY);
  await page.reload();
  assert.equal(await page.locator('[data-wishlist-count]').isHidden(), true, 'corrupted storage is safe');
  await seed(page, ['beige-dress']);
  await page.reload();
  await page.locator('wishlist-toggle[data-handle="black-dress"] button').click();
  assert.equal(await page.locator('[data-wishlist-count]').textContent(), '2');
  console.log('PASS corrupted storage recovery');

  await page.evaluate(({ key, older, newer }) => {
    localStorage.setItem(key, JSON.stringify(older));
    document.cookie = 'mv_wishlist_v1=' + encodeURIComponent(JSON.stringify(newer)) + '; Path=/';
  }, { key: KEY, older: savedState(['beige-dress'], Date.now() - 5000), newer: savedState([], Date.now()) });
  await page.reload();
  assert.equal(await page.locator('[data-wishlist-count]').isHidden(), true, 'newer empty cookie overrides older local list');
  await seed(page, Array.from({ length: 90 }, (_, i) => `long-product-handle-${i}-` + 'x'.repeat(60)));
  await page.reload();
  await page.locator('wishlist-toggle button').first().click();
  assert.equal(await page.locator('[data-wishlist-count]').textContent(), '91');
  assert.equal((await ctx.cookies()).some((entry) => entry.name === 'mv_wishlist_v1'), false, 'large list deletes stale cookie backup');
  await page.reload();
  assert.equal(await page.locator('[data-wishlist-count]').textContent(), '91', 'large list persists in localStorage');
  await seed(page, Array.from({ length: 100 }, (_, i) => `dress-${i}`));
  await page.reload();
  await page.locator('wishlist-toggle button').first().click();
  assert.match(await page.locator('[data-wishlist-notice]').textContent(), /up to 100/);
  assert.equal(await page.locator('[data-wishlist-count]').textContent(), '100');
  console.log('PASS newer empty state, large-list persistence, stale-cookie cleanup, capacity limit');

  await seed(page, ['beige-dress']);
  await page.goto(origin + '/fr/search?wishlist=1');
  await page.waitForFunction(() => document.querySelectorAll('.mv-wishlist-item__price').length === 1);
  assert.equal(await page.locator('.mv-wishlist-item__title').getAttribute('href'), '/fr/products/beige-dress');
  assert.match(await page.locator('.mv-wishlist-item__price').textContent(), /€/);
  console.log('PASS locale-aware product links and presentment-currency formatting');

  const beforeDisabled = await page.evaluate((key) => localStorage.getItem(key), KEY);
  await page.goto(origin + '/disabled');
  assert.equal(await page.evaluate(() => customElements.get('wishlist-toggle') === undefined), true);
  assert.equal(await page.locator('wishlist-toggle').first().isHidden(), true);
  assert.equal(await page.evaluate((key) => localStorage.getItem(key), KEY), beforeDisabled, 'disabling preserves saved data');
  await page.goto(origin + '/collections/all');
  assert.equal(await page.locator('wishlist-toggle[data-handle="beige-dress"] button').first().getAttribute('aria-pressed'), 'true');
  await page.evaluate(() => {
    const variables = {
      '--mv-wishlist-background': '#336699', '--mv-wishlist-background-opacity': '0.4',
      '--mv-wishlist-border-color': '#445566', '--mv-wishlist-border-opacity': '0.7',
      '--mv-wishlist-border-width': '2px', '--mv-wishlist-icon-color': '#112233',
      '--mv-wishlist-active-color': '#cc0044', '--mv-wishlist-opacity': '0.6',
      '--mv-wishlist-radius': '6px', '--mv-wishlist-button-size': '48px', '--mv-wishlist-icon-size': '18px',
    };
    for (const [name, value] of Object.entries(variables)) document.documentElement.style.setProperty(name, value);
  });
  const styledButton = page.locator('wishlist-toggle[data-handle="black-dress"] button');
  await page.waitForFunction(() => getComputedStyle(document.querySelector('wishlist-toggle[data-handle="black-dress"] button'), '::before').backgroundColor.includes('/ 0.4)'));
  const styles = await styledButton.evaluate((button) => {
    const style = getComputedStyle(button), surface = getComputedStyle(button, '::before');
    return { color: style.color, opacity: style.opacity, radius: style.borderRadius,
      width: button.getBoundingClientRect().width, background: surface.backgroundColor,
      border: surface.borderColor, borderWidth: surface.borderTopWidth, icon: getComputedStyle(button.querySelector('svg')).width };
  });
  assert.equal(styles.color, 'rgb(17, 34, 51)');
  assert.equal(styles.opacity, '0.6');
  assert.equal(styles.radius, '6px');
  assert.equal(styles.width, 48);
  assert.equal(styles.icon, '18px');
  assert.equal(styles.borderWidth, '2px');
  assert.match(styles.background, /0\.4/);
  assert.match(styles.border, /0\.7/);
  await styledButton.click();
  assert.equal(await styledButton.evaluate((button) => getComputedStyle(button).color), 'rgb(204, 0, 68)');
  await page.evaluate(() => {
    document.documentElement.style.setProperty('--mv-wishlist-background-opacity', '0');
    document.documentElement.style.setProperty('--mv-wishlist-border-width', '0px');
    document.documentElement.style.setProperty('--mv-wishlist-button-size', '28px');
  });
  assert.equal(await styledButton.evaluate((button) => button.getBoundingClientRect().width), 44, 'small surface keeps a 44px target');
  console.log('PASS global off/on preserves data; custom colors, opacity, border, size, shape, active color and minimum touch target');

  if (process.env.WISHLIST_SCREENSHOT) {
    await seed(page, ['beige-dress', 'black-dress']);
    await page.goto(origin + '/search?wishlist=1');
    await page.waitForFunction(() => document.querySelectorAll('.mv-wishlist-item__price').length === 2);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({ path: process.env.WISHLIST_SCREENSHOT });
  }
}
run().catch((error) => { console.error(error); process.exitCode = 1; }).finally(async () => {
  await Promise.allSettled([...contexts].map((ctx) => ctx.close()));
  server.close();
  for (const profile of profiles) {
    // Delete only the exact temporary profiles created above.
    if (path.resolve(profile).startsWith(path.join(path.resolve(os.tmpdir()), 'mv-wishlist-'))) {
      fs.rmSync(profile, { recursive: true, force: true });
    }
  }
});
