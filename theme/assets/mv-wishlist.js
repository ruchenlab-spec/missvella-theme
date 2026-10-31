/* Device-local wishlist. Only product handles are stored; product details stay live.
   localStorage has no expiry. A one-year first-party cookie is a size-bounded backup.
   A save is successful only after at least one persistent store confirms the write. */
(() => {
  const configNode = document.getElementById('mv-wishlist-config');
  if (!configNode || customElements.get('wishlist-toggle')) return;
  const config = JSON.parse(configNode.textContent);
  const labels = config.labels;
  const KEY = 'missvella_wishlist_v1';
  const COOKIE = 'mv_wishlist_v1';
  const LIMIT = 100;
  const validHandle = (handle) => typeof handle === 'string' && /^[a-z0-9][a-z0-9-]{0,254}$/i.test(handle);
  const root = config.root.replace(/\/?$/, '/');
  let noticeTimer;
  let generation = 0;
  let activeRequests = [];
  const cache = new Map();

  function decode(raw) {
    try {
      const data = JSON.parse(raw);
      if (data.v !== 1 || !Number.isSafeInteger(data.updatedAt) || data.updatedAt < 0 ||
          !Array.isArray(data.items) || data.items.length > LIMIT || !data.items.every(validHandle)) return null;
      return { v: 1, updatedAt: data.updatedAt, items: [...new Set(data.items)] };
    } catch { return null; }
  }

  function cookieValue() {
    try {
      const value = document.cookie.split('; ').find((part) => part.startsWith(COOKIE + '='));
      return value ? decode(decodeURIComponent(value.slice(COOKIE.length + 1))) : null;
    } catch { return null; }
  }

  function read() {
    let local;
    try { local = decode(localStorage.getItem(KEY)); } catch { /* Storage may be disabled. */ }
    const cookie = cookieValue();
    if (local && (!cookie || local.updatedAt >= cookie.updatedAt)) return local;
    return cookie || { v: 1, updatedAt: 0, items: [] };
  }

  let state = read();

  function persist(items) {
    const next = { v: 1, updatedAt: Math.max(Date.now(), state.updatedAt + 1), items };
    const raw = JSON.stringify(next);
    let localSaved = false;
    let cookieSaved = false;
    try {
      localStorage.setItem(KEY, raw);
      localSaved = localStorage.getItem(KEY) === raw;
    } catch { /* Try the persistent cookie before reporting failure. */ }
    try {
      const encoded = encodeURIComponent(raw);
      const secure = location.protocol === 'https:' ? '; Secure' : '';
      if (encoded.length <= 3500) {
        document.cookie = `${COOKIE}=${encoded}; Max-Age=31536000; Path=/; SameSite=Lax${secure}`;
        cookieSaved = cookieValue()?.updatedAt === next.updatedAt;
      } else if (localSaved) {
        // Never leave an outdated backup that could resurrect removed products.
        document.cookie = `${COOKIE}=; Max-Age=0; Path=/; SameSite=Lax${secure}`;
      }
    } catch { /* The local write may already have succeeded. */ }
    if (!localSaved && !cookieSaved) return false;
    state = next;
    return true;
  }

  function announce(message) {
    const notice = document.querySelector('[data-wishlist-notice]');
    if (!notice) return;
    clearTimeout(noticeTimer);
    notice.textContent = message;
    noticeTimer = setTimeout(() => { notice.textContent = ''; }, 5000);
  }

  function syncControls() {
    document.querySelectorAll('wishlist-toggle').forEach((element) => element.sync?.());
    document.querySelectorAll('[data-wishlist-link]').forEach((link) => {
      link.href = config.url;
      link.setAttribute('aria-label', `${labels.title} (${state.items.length})`);
    });
    document.querySelectorAll('[data-wishlist-count]').forEach((badge) => {
      badge.textContent = String(state.items.length);
      badge.hidden = state.items.length === 0;
    });
  }

  function change(handle, remove = false) {
    if (!validHandle(handle)) return false;
    state = read(); // Merge against the latest other-tab state before every mutation.
    const exists = state.items.includes(handle);
    if (!exists && remove) {
      syncControls();
      renderPage();
      return true;
    }
    if (!exists && state.items.length >= LIMIT) { announce(labels.limit); return false; }
    const items = exists ? state.items.filter((item) => item !== handle) : [handle, ...state.items];
    if (!persist(items)) { syncControls(); announce(labels.storageError); return false; }
    syncControls();
    renderPage();
    announce(exists ? labels.removed : labels.saved);
    return true;
  }

  class WishlistToggle extends HTMLElement {
    static observedAttributes = ['data-handle', 'data-title'];

    attributeChangedCallback() {
      // Facet morphs can reuse a card for a different product. Run after the
      // entire synchronous morph, including its button attributes, is applied.
      queueMicrotask(() => this.sync());
    }

    connectedCallback() {
      if (!this.bound) {
        this.bound = true;
        this.addEventListener('click', (event) => {
          if (!event.target.closest('button')) return;
          event.preventDefault();
          event.stopPropagation();
          change(this.dataset.handle);
        });
      }
      this.sync();
      this.hidden = false;
    }

    sync() {
      const button = this.querySelector('button');
      if (!button) return;
      const saved = state.items.includes(this.dataset.handle);
      button.setAttribute('aria-pressed', String(saved));
      const label = `${saved ? labels.remove : labels.save}: ${this.dataset.title || ''}`;
      button.setAttribute('aria-label', label);
      button.title = label;
    }
  }

  customElements.define('wishlist-toggle', WishlistToggle);

  function node(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }

  function money(price) {
    return new Intl.NumberFormat(document.documentElement.lang || 'en', {
      style: 'currency', currency: config.currency,
    }).format(price / 100);
  }

  async function product(handle, signal) {
    if (cache.has(handle)) return cache.get(handle);
    const response = await fetch(`${root}products/${encodeURIComponent(handle)}.js`, {
      signal, credentials: 'same-origin', headers: { Accept: 'application/json' },
    });
    if (!response.ok) {
      const error = new Error('Product request failed');
      error.unavailable = response.status === 404 || response.status === 410;
      throw error;
    }
    const data = await response.json();
    if (!validHandle(data.handle) || typeof data.title !== 'string' || !Number.isFinite(data.price)) {
      throw new Error('Invalid product response');
    }
    cache.set(handle, data);
    return data;
  }

  function productUrl(handle) { return `${root}products/${encodeURIComponent(handle)}`; }

  function removeButton(handle, title) {
    const button = node('button', 'mv-wishlist-item__action', labels.removeLink);
    button.type = 'button';
    button.dataset.removeHandle = handle;
    button.setAttribute('aria-label', `${labels.remove}: ${title}`);
    button.addEventListener('click', () => {
      const current = [...document.querySelectorAll('[data-remove-handle]')].indexOf(button);
      if (change(handle, true)) {
        const buttons = document.querySelectorAll('[data-remove-handle]');
        (buttons[Math.min(current, buttons.length - 1)] || document.querySelector('[data-wishlist-empty] a'))?.focus();
      }
    });
    return button;
  }

  function fillCard(card, data, handle) {
    const restoreFocus = card.contains(document.activeElement);
    const link = node('a', 'mv-wishlist-item__media');
    link.href = productUrl(data.handle);
    link.setAttribute('aria-label', data.title);
    if (typeof data.featured_image === 'string') {
      const imageUrl = new URL(data.featured_image, location.origin);
      if (imageUrl.protocol === 'https:' || imageUrl.protocol === 'http:') {
        imageUrl.searchParams.set('width', '720');
        const image = node('img');
        image.src = imageUrl.href;
        image.alt = data.title;
        image.loading = 'lazy';
        image.width = 480;
        image.height = 720;
        link.append(image);
      }
    }
    const title = node('a', 'mv-wishlist-item__title', data.title);
    title.href = productUrl(data.handle);
    card.replaceChildren(link, title, node('p', 'mv-wishlist-item__price', money(data.price)));
    if (!data.available) card.append(node('p', 'mv-wishlist-item__message', labels.soldOut));
    const remove = removeButton(handle, data.title);
    card.append(remove);
    if (restoreFocus) remove.focus();
    card.removeAttribute('aria-busy');
  }

  async function loadCard(card, handle, token) {
    const controller = new AbortController();
    activeRequests.push(controller);
    // Abort a stalled request so the remaining saved products can still load.
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const data = await product(handle, controller.signal);
      if (token === generation) fillCard(card, data, handle);
    } catch (error) {
      if (token !== generation) return;
      const title = node('a', 'mv-wishlist-item__title', handle.replace(/-/g, ' '));
      title.href = productUrl(handle);
      card.replaceChildren(title, node('p', 'mv-wishlist-item__message', error.unavailable ? labels.unavailable : labels.loadError));
      if (!error.unavailable) {
        const retry = node('button', 'mv-wishlist-item__action', labels.retry);
        retry.type = 'button';
        retry.addEventListener('click', () => { retry.disabled = true; loadCard(card, handle, token); });
        card.append(retry);
      }
      card.append(removeButton(handle, title.textContent));
      card.removeAttribute('aria-busy');
    } finally {
      clearTimeout(timeout);
      activeRequests = activeRequests.filter((request) => request !== controller);
    }
  }

  function renderPage() {
    if (!document.documentElement.classList.contains('mv-wishlist-route')) return;
    const page = document.querySelector('[data-wishlist-page]');
    if (!page) return;
    page.hidden = false;
    const grid = page.querySelector('[data-wishlist-grid]');
    const empty = page.querySelector('[data-wishlist-empty]');
    const summary = page.querySelector('[data-wishlist-summary]');
    const token = ++generation;
    activeRequests.forEach((controller) => controller.abort());
    activeRequests = [];
    grid.replaceChildren();
    empty.hidden = state.items.length > 0;
    summary.hidden = state.items.length === 0;
    summary.textContent = `${state.items.length} ${state.items.length === 1 ? labels.item : labels.items}`;
    const queue = state.items.map((handle) => {
      const card = node('article', 'mv-wishlist-item');
      card.setAttribute('aria-busy', 'true');
      card.append(node('div', 'mv-wishlist-item__media'), node('p', 'mv-wishlist-item__message', labels.loading), removeButton(handle, handle));
      grid.append(card);
      return { card, handle };
    });
    // Bound network concurrency so a large wishlist does not flood Shopify.
    async function worker() {
      while (queue.length && token === generation) {
        const { card, handle } = queue.shift();
        await loadCard(card, handle, token);
      }
    }
    const workers = Math.min(4, queue.length);
    for (let i = 0; i < workers; i++) worker();
  }

  function refresh() {
    const next = read();
    if (JSON.stringify(next) === JSON.stringify(state)) return;
    state = next;
    syncControls();
    renderPage();
  }

  window.addEventListener('storage', (event) => { if (event.key === KEY || event.key === null) refresh(); });
  window.addEventListener('pageshow', refresh);
  window.addEventListener('focus', refresh);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) refresh(); });
  document.addEventListener('shopify:section:load', syncControls);
  syncControls();
  renderPage();
})();
