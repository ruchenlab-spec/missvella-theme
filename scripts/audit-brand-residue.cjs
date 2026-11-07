/* Read-only audit of public storefront HTML and local/live theme source. */
const fs = require('node:fs');
const path = require('node:path');

const origin = 'https://missvella.com';
const output = path.resolve('.tmp-brand-audit');
const pattern = /ji[\s_.-]*miss/gi;
const started = new Date().toISOString();
fs.mkdirSync(output, { recursive: true });

function decode(value) {
  return value.replace(/\\u([\da-f]{4})/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
    .replace(/\\x([\da-f]{2})/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
    .replace(/&#(?:x([\da-f]+)|(\d+));/gi, (_, hex, num) => String.fromCodePoint(parseInt(hex || num, hex ? 16 : 10)))
    .replace(/&(?:amp|quot|apos|lt|gt|nbsp);/gi, entity => ({ '&amp;': '&', '&quot;': '"', '&apos;': "'", '&lt;': '<', '&gt;': '>', '&nbsp;': ' ' }[entity.toLowerCase()]))
    .replace(/(?:%[\da-f]{2})+/gi, encoded => { try { return decodeURIComponent(encoded); } catch { return encoded; } });
}
const matches = value => [...decode(value).matchAll(new RegExp(pattern))];
const text = value => decode(value.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();
const context = (value, index, radius = 130) => value.slice(Math.max(0, index - radius), index + radius).replace(/\s+/g, ' ');
const locs = xml => [...xml.matchAll(/<loc>([\s\S]*?)<\/loc>/g)].map(m => decode(m[1]).trim());

async function request(url) {
  let last;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(20000), headers: { Connection: 'close' } });
      if ((response.status === 429 || response.status >= 500) && attempt < 2) {
        await response.body?.cancel();
        await new Promise(resolve => setTimeout(resolve, 3000 * (attempt + 1)));
        continue;
      }
      return { url: response.url, status: response.status, type: response.headers.get('content-type') || '', body: await response.text() };
    } catch (error) { last = error; }
  }
  throw last;
}

function sourceAudit(root) {
  const result = { root, files: 0, textFiles: 0, schemas: 0, jsonFiles: 0, strings: 0, hits: [], parseErrors: [] };
  const parse = value => JSON.parse(value.replace(/^\uFEFF/, '').replace(/"(?:\\.|[^"\\])*"|\/\/[^\r\n]*|\/\*[\s\S]*?\*\//g, m => m.startsWith('/') ? '' : m));
  function values(value, file, key) {
    if (typeof value === 'string') {
      result.strings++;
      if (matches(value).length) result.hits.push({ file, key, value });
    } else if (value && typeof value === 'object') {
      for (const [name, child] of Object.entries(value)) values(child, file, key ? key + '.' + name : name);
    }
  }
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (['.git', '.shopify', 'node_modules'].includes(entry.name)) continue;
      const file = path.join(dir, entry.name);
      if (entry.isDirectory()) { walk(file); continue; }
      result.files++;
      if (matches(file).length) result.hits.push({ file, filename: true });
      const bytes = fs.readFileSync(file);
      if (bytes.subarray(0, 2048).includes(0)) continue;
      result.textFiles++;
      const raw = bytes.toString('utf8');
      const decoded = decode(raw);
      for (const match of decoded.matchAll(new RegExp(pattern))) {
        result.hits.push({ file, line: decoded.slice(0, match.index).split('\n').length, context: context(decoded, match.index) });
      }
      if (file.endsWith('.json')) {
        result.jsonFiles++;
        try { values(parse(raw), file, ''); } catch (error) { result.parseErrors.push({ file, error: error.message }); }
      }
      for (const schema of raw.matchAll(/{%\s*schema\s*%}([\s\S]*?){%\s*endschema\s*%}/g)) {
        result.schemas++;
        try { values(parse(schema[1]), file, 'schema'); } catch (error) { result.parseErrors.push({ file, error: error.message }); }
      }
    }
  }
  if (fs.existsSync(root)) walk(root); else result.missing = true;
  return result;
}

const queued = new Set();
const queue = [];
function enqueue(input, from) {
  let url;
  try { url = new URL(decode(input), from || origin); } catch { return; }
  if (![origin, 'https://www.missvella.com', 'https://6icwx6-yv.myshopify.com'].includes(url.origin)) return;
  url = new URL(url.pathname + url.search, origin);
  if (!/^\/$|^\/(?:pages|policies|products|collections|blogs)(?:\/|$)|^\/(?:search|cart|password|404)$/.test(url.pathname)) return;
  if (/\/products\//.test(url.pathname) && url.pathname.startsWith('/collections/')) url.pathname = url.pathname.slice(url.pathname.indexOf('/products/'));
  if (/\.(?:json|js|xml|png|jpe?g|webp|svg|pdf|mp4)$/i.test(url.pathname)) return;
  const page = url.searchParams.get('page');
  const query = url.searchParams.get('q');
  url.search = '';
  if (page && /^\d+$/.test(page)) url.searchParams.set('page', page);
  if (url.pathname === '/search' && query) return;
  const key = url.href;
  if (!queued.has(key)) { queued.add(key); queue.push({ url: key, from: from || 'seed' }); }
}

function inspect(page) {
  const decoded = decode(page.body);
  const raw = [...decoded.matchAll(new RegExp(pattern))];
  const withoutCode = page.body.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, '').replace(/<!--[\s\S]*?-->/g, '');
  const blocks = [];
  for (const match of withoutCode.matchAll(/<(summary|h[1-6]|p|li|a|title)\b([^>]*)>([\s\S]*?)<\/\1>/gi)) {
    if (!matches(match[0]).length) continue;
    const before = withoutCode.slice(0, match.index);
    const section = [...before.matchAll(/id="(shopify-section-[^"]+)"/g)].at(-1)?.[1];
    const summary = [...before.matchAll(/<summary\b[^>]*>([\s\S]*?)<\/summary>/gi)].at(-1);
    const precedingQuestion = match[1] === 'summary' ? text(match[3]) : ['p', 'li', 'a'].includes(match[1]) && summary ? text(summary[1]) : undefined;
    blocks.push({ tag: match[1], text: text(match[3]), section, precedingQuestion, links: [...match[0].matchAll(/href=["']([^"']+)/gi)].map(m => decode(m[1])) });
  }
  const attributes = [];
  for (const match of withoutCode.matchAll(/<[^>]+>/g)) {
    if (!matches(match[0]).length) continue;
    attributes.push(match[0].slice(0, 1500));
  }
  const visible = text(withoutCode);
  const body = decoded.match(/<body\b[^>]*class="([^"]*)"/i)?.[1] || '';
  return {
    url: page.url, status: page.status, title: text(page.body.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || ''),
    bodyClass: body, bytes: Buffer.byteLength(page.body), rawOccurrences: raw.length,
    visibleOccurrences: matches(visible).length, blocks, attributes,
    rawContexts: raw.map(m => context(decoded, m.index)),
    externalResidueUrls: [...new Set([...decoded.matchAll(/(?:https?:)?\/\/[^\s"'<>\\]+/gi)].map(m => m[0]).filter(u => matches(u).length))],
  };
}

async function main() {
  const sitemapReports = [];
  const sitemapQueue = [origin + '/sitemap.xml'];
  const sitemapSeen = new Set();
  while (sitemapQueue.length) {
    const url = sitemapQueue.shift();
    if (sitemapSeen.has(url)) continue;
    sitemapSeen.add(url);
    const response = await request(url);
    const urls = locs(response.body);
    sitemapReports.push({ url, status: response.status, count: urls.length });
    for (const value of urls) {
      if (new URL(value).origin !== origin) continue;
      if (/<sitemapindex\b/i.test(response.body)) sitemapQueue.push(value);
      else enqueue(value, url);
    }
  }
  for (const route of ['/', '/collections', '/collections/all', '/search', '/cart', '/password', '/404', '/policies/privacy-policy', '/policies/refund-policy', '/policies/shipping-policy', '/policies/contact-information', '/policies/terms-of-service', '/policies/subscription-policy', '/policies/legal-notice']) enqueue(route);
  const checkpoint = path.join(output, 'progress.json');
  const previous = fs.existsSync(checkpoint) ? JSON.parse(fs.readFileSync(checkpoint, 'utf8')) : { pages: [] };
  const pages = previous.pages.filter(page => page.status === 200 && page.requestedUrl !== origin + '/');
  const checked = new Set(pages.map(page => page.requestedUrl));
  for (const page of pages) for (const link of page.linkedUrls || []) enqueue(link, page.url);
  for (let index = queue.length - 1; index >= 0; index--) if (checked.has(queue[index].url)) queue.splice(index, 1);
  queue.sort((a, b) => Number(a.url.includes('/products/')) - Number(b.url.includes('/products/')));
  console.log(`DISCOVERED ${queue.length} initial pages`);
  let completed = pages.length;
  while (queue.length) {
    const batch = queue.splice(0, 2);
    await Promise.all(batch.map(async item => {
      try {
        const response = await request(item.url);
        const result = inspect(response);
        result.requestedUrl = item.url;
        result.discoveredFrom = item.from;
        result.linkedUrls = [];
        pages.push(result);
        if (response.status === 200 && response.type.includes('text/html')) {
          for (const link of response.body.matchAll(/<a\b[^>]*href=["']([^"']+)/gi)) {
            enqueue(link[1], response.url);
            result.linkedUrls.push(decode(link[1]));
          }
          result.linkedUrls = [...new Set(result.linkedUrls)];
        }
        if (result.rawOccurrences) console.log(`HIT ${response.status} ${response.url}: ${result.rawOccurrences} raw / ${result.visibleOccurrences} visible`);
      } catch (error) { pages.push({ requestedUrl: item.url, discoveredFrom: item.from, error: error.message }); }
      completed++;
    }));
    if (completed % 20 < 2 || !queue.length) {
      console.log(`PROGRESS ${completed} scanned; ${queue.length} queued; ${pages.filter(p => p.rawOccurrences).length} hit pages`);
      fs.writeFileSync(path.join(output, 'progress.json'), JSON.stringify({ started, completed, remaining: queue.length, pages }, null, 2));
    }
    if (queue.length) await new Promise(resolve => setTimeout(resolve, 300));
  }
  const report = {
    started, finished: new Date().toISOString(), target: 'Jimiss (case-insensitive; separators and common encodings decoded)',
    origin, sitemaps: sitemapReports, publicPages: pages.sort((a, b) => (a.requestedUrl || '').localeCompare(b.requestedUrl || '')),
    localSource: sourceAudit('theme'), liveSource: sourceAudit('.tmp-brand-live-code'),
    limitations: ['HTML, metadata, inline code, links, resource names and textual theme source scanned; no OCR of image/video pixels.', 'Logged-in account pages, checkout, drafts, unlinked/unpublished pages and language/country variants not enumerated by the public sitemap are outside this public crawl.', 'Rendered JavaScript-only runtime state and third-party app content not in initial HTML are outside the HTML scan.', 'No templates, settings_data or content were uploaded or edited.'],
  };
  fs.writeFileSync(path.join(output, 'result.json'), JSON.stringify(report, null, 2));
  console.log('RESULT ' + JSON.stringify({ pages: pages.length, hits: pages.filter(p => p.rawOccurrences).length, errors: pages.filter(p => p.error).length, statuses: pages.reduce((a, p) => (a[p.status || 'error'] = (a[p.status || 'error'] || 0) + 1, a), {}), local: { files: report.localSource.files, hits: report.localSource.hits.length }, live: { files: report.liveSource.files, hits: report.liveSource.hits.length } }));
}
if (require.main === module) main().catch(error => { console.error(error); process.exitCode = 1; });
module.exports = { request, inspect, decode, sourceAudit };
