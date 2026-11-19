// Links and all detail panels remain usable if JavaScript is unavailable.
class ColorGuide extends HTMLElement {
  connectedCallback() {
    this.controller?.abort();
    this.controller = new AbortController();
    const { signal } = this.controller;
    this.cards = [...this.querySelectorAll('[data-color-card]')];
    this.panels = [...this.querySelectorAll('[data-color-panel]')];
    this.filter = this.querySelector('[data-color-filter]');
    if (!this.cards.length || !this.filter) return;
    this.groupCards();

    // Keep the merchant's translated "All colors" option when reconnecting.
    while (this.filter.options.length > 1) this.filter.remove(1);
    const families = [...new Set(this.cards.map((card) => card.dataset.family).filter(Boolean))];
    for (const family of families) {
      const option = document.createElement('option');
      option.value = family;
      option.textContent = family;
      this.filter.append(option);
    }
    this.querySelector('[data-color-filter-wrap]').hidden = families.length === 0;
    this.filter.value = '';
    this.cards.forEach((card) => { card.hidden = false; });
    this.select(this.cardForHash() || this.cards[0]);

    this.addEventListener('click', (event) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const choice = event.target.closest('[data-color-choice]');
      if (!choice || !this.contains(choice)) return;
      const panel = this.select(choice.closest('[data-color-card]'));
      panel?.querySelector('[data-color-title]')?.focus({ preventScroll: true });
      // Allow the real anchor navigation: copyable URL and browser Back work.
    }, { signal });

    this.filter.addEventListener('change', () => {
      this.cards.forEach((card) => {
        card.hidden = Boolean(this.filter.value && card.dataset.family !== this.filter.value);
      });
      this.updateGroups();
      const current = this.cards.find((card) => !card.hidden && card.querySelector('[aria-current="true"]'));
      this.select(current || this.cards.find((card) => !card.hidden));
    }, { signal });

    window.addEventListener('hashchange', () => {
      const card = this.cardForHash();
      if (!card) return;
      const panel = this.reveal(card);
      panel?.scrollIntoView({ block: 'start' });
    }, { signal });

    this.addEventListener('shopify:block:select', (event) => {
      const card = this.cards.find((item) => item.dataset.blockId === event.detail?.blockId);
      if (card) this.reveal(card);
    }, { signal });
  }

  disconnectedCallback() {
    this.controller?.abort();
  }

  groupCards() {
    const container = this.querySelector('[data-color-groups]');
    if (!container) return;
    const families = new Map();
    for (const card of this.cards) {
      const family = card.dataset.family || '';
      if (!families.has(family)) families.set(family, []);
      families.get(family).push(card);
    }
    const fragment = document.createDocumentFragment();
    this.groups = [];
    for (const [family, cards] of families) {
      const group = document.createElement('div');
      group.className = 'color-guide__group';
      if (family) {
        const heading = document.createElement('h3');
        heading.className = 'color-guide__group-heading';
        heading.textContent = family;
        group.append(heading);
      }
      const list = document.createElement('ul');
      list.className = 'color-guide__swatches';
      list.setAttribute('role', 'list');
      if (family) list.setAttribute('aria-label', family);
      list.append(...cards);
      group.append(list);
      fragment.append(group);
      this.groups.push({ element: group, cards });
    }
    // Move the original cards so editor attributes, anchors and block IDs survive.
    container.replaceChildren(fragment);
    container.classList.add('color-guide__groups--ready');
  }

  updateGroups() {
    this.groups?.forEach(({ element, cards }) => {
      element.hidden = cards.every((card) => card.hidden);
    });
  }

  cardForHash() {
    return this.cards.find((card) => card.querySelector('[data-color-choice]').getAttribute('href') === window.location.hash);
  }

  reveal(card) {
    if (card.hidden) {
      this.filter.value = '';
      this.cards.forEach((item) => { item.hidden = false; });
      this.updateGroups();
    }
    return this.select(card);
  }

  select(card) {
    if (!card) return;
    const id = card.querySelector('[data-color-choice]').getAttribute('href').slice(1);
    const selected = this.panels.find((panel) => panel.id === id);
    if (!selected) return;
    this.cards.forEach((item) => {
      const choice = item.querySelector('[data-color-choice]');
      if (item === card) choice.setAttribute('aria-current', 'true');
      else choice.removeAttribute('aria-current');
    });
    this.panels.forEach((panel) => { panel.hidden = panel !== selected; });
    return selected;
  }
}

if (!customElements.get('color-guide')) customElements.define('color-guide', ColorGuide);
