/** Variable-width image stack. Geometry is independent of animated DOM positions. */
class HeroStack extends HTMLElement {
  connectedCallback() {
    this.stage = this.querySelector('[data-stack-stage]');
    this.cards = [...this.querySelectorAll('[data-stack-card]')];
    if (!this.stage || !this.cards.length) return;

    this.active = null;
    this.editorIndex = null;
    this.abort = new AbortController();
    const options = { signal: this.abort.signal };
    this.mobileQuery = matchMedia('(max-width: 749px)');
    this.mobileQuery.addEventListener('change', () => this.measure(), options);
    this.stage.addEventListener('pointermove', (event) => this.onPointerMove(event), options);
    this.stage.addEventListener('pointerleave', () => {
      this.lastPointer = null;
      if (!this.contains(document.activeElement)) this.select(this.editorIndex);
    }, options);
    this.stage.addEventListener('click', (event) => {
      const index = this.cardIndex(event.target);
      if (index >= 0) this.select(index);
    }, options);
    this.stage.addEventListener('focusin', (event) => {
      const index = this.cardIndex(event.target);
      if (index >= 0) this.select(index);
    }, options);
    this.addEventListener('focusout', () => {
      queueMicrotask(() => {
        if (!this.isConnected || this.contains(document.activeElement) || this.stage.matches(':hover')) return;
        this.select(this.editorIndex);
      });
    }, options);
    this.stage.addEventListener('keydown', (event) => this.onKeydown(event), options);
    this.querySelector('.mv-hero-stack__previous')?.addEventListener('click', () => this.step(-1), options);
    this.querySelector('.mv-hero-stack__next')?.addEventListener('click', () => this.step(1), options);

    // Scope editor selection to this section, including after section hot reloads.
    document.addEventListener('shopify:block:select', (event) => {
      const index = this.cards.findIndex((card) => card.dataset.blockId === event.detail?.blockId);
      if (index < 0) return;
      this.editorIndex = index;
      this.select(index);
    }, options);
    document.addEventListener('shopify:block:deselect', (event) => {
      if (!this.cards.some((card) => card.dataset.blockId === event.detail?.blockId)) return;
      this.editorIndex = null;
      this.select(null);
    }, options);

    this.observer = new ResizeObserver(() => this.measure());
    this.observer.observe(this.stage);
    this.measure();
  }

  disconnectedCallback() {
    this.abort?.abort();
    this.observer?.disconnect();
    cancelAnimationFrame(this.instantFrame);
    cancelAnimationFrame(this.settleFrame);
  }

  cardIndex(target) {
    return this.cards.indexOf(target.closest('[data-stack-card]'));
  }

  measure() {
    const width = this.stage.clientWidth;
    const height = this.stage.clientHeight;
    if (!width || !height) return;
    const count = this.cards.length;
    const maxWidth = width * (count === 1 ? 1 : this.mobileQuery.matches ? 0.84 : 0.8);
    this.width = width;
    this.widths = this.cards.map((card) => {
      const ratio = Number(this.mobileQuery.matches ? card.dataset.mobileRatio : card.dataset.ratio) || 0.75;
      const cardWidth = Math.min(height * ratio, maxWidth);
      card.style.setProperty('--mv-card-width', `${cardWidth}px`);
      card.style.setProperty('--mv-card-height', `${cardWidth / ratio}px`);
      return cardWidth;
    });

    // Reserve space for every card, even when the last image is narrower.
    // For each right edge: sum(previous widths) * advance + current width <= container.
    let prefix = 0;
    let advance = 1 - Number(this.dataset.overlap) / 100;
    this.widths.forEach((cardWidth) => {
      if (prefix) advance = Math.min(advance, (width - cardWidth) / prefix);
      prefix += cardWidth;
    });
    prefix = 0;
    this.base = this.widths.map((cardWidth) => {
      const position = prefix * advance;
      prefix += cardWidth;
      return position;
    });
    const extent = Math.max(...this.widths.map((cardWidth, index) => this.base[index] + cardWidth));
    this.base = this.base.map((position) => position + (width - extent) / 2);
    this.activeX = this.openPosition(this.active);

    cancelAnimationFrame(this.instantFrame);
    cancelAnimationFrame(this.settleFrame);
    this.setAttribute('data-instant', '');
    this.layout();
    this.setAttribute('data-ready', '');
    this.instantFrame = requestAnimationFrame(() => {
      this.settleFrame = requestAnimationFrame(() => this.removeAttribute('data-instant'));
    });
  }

  select(index, pointerX) {
    if (index !== null && (index < 0 || index >= this.cards.length)) return;
    if (this.active === index) return;
    this.active = index;
    this.activeX = this.openPosition(index, pointerX);
    this.layout();
  }

  openPosition(index, pointerX) {
    if (index === null || !this.widths) return null;
    const count = this.cards.length;
    // A wide image near either end must still leave every other card a visible strip.
    const reserve = count > 1 ? Math.min(28, (this.width - Math.max(...this.widths)) / (count - 1)) : 0;
    const left = reserve * index;
    const right = this.width - this.widths[index] - reserve * (count - index - 1);
    let position = Math.max(left, Math.min(this.base[index], right));
    if (pointerX !== undefined) {
      const min = Math.max(left, pointerX - this.widths[index] + 1);
      const max = Math.min(right, pointerX - 1);
      if (min <= max) position = Math.max(min, Math.min(position, max));
    }
    return position;
  }

  layout() {
    if (!this.widths) return;
    const active = this.active;
    const count = this.cards.length;
    const start = active === null ? 0 : this.activeX;
    const end = active === null ? 0 : start + this.widths[active];

    this.cards.forEach((card, index) => {
      let position = this.base[index];
      let layer = index + 1;
      let clipLeft = 0;
      let clipRight = 0;
      if (active !== null) {
        if (index < active) {
          const strip = start / active;
          position = strip * (index + 1) - this.widths[index];
          clipLeft = Math.max(0, this.widths[index] - strip);
        } else if (index > active) {
          const strip = (this.width - end) / (count - active - 1);
          position = end + strip * (index - active - 1);
          clipRight = Math.max(0, this.widths[index] - strip);
          layer = count - index;
        } else {
          position = start;
          layer = count + 1;
        }
      }
      card.style.setProperty('--mv-card-x', `${position}px`);
      card.style.setProperty('--mv-card-layer', String(layer));
      card.style.setProperty('--mv-card-clip-left', `${clipLeft}px`);
      card.style.setProperty('--mv-card-clip-right', `${clipRight}px`);
      // A lone image needs no interaction before its caption/link becomes available.
      const selected = index === active || count === 1;
      card.toggleAttribute('data-active', selected);
      const caption = card.querySelector('[data-stack-caption]');
      if (caption) caption.inert = !selected;
    });

    const counter = this.querySelector('[data-stack-counter]');
    if (counter) counter.textContent = active === null ? String(count) : `${active + 1} / ${count}`;
  }

  onPointerMove(event) {
    if (event.pointerType === 'touch' || event.buttons) return;
    // Animated cards may cross the pointer. Only real pointer movement selects a new image.
    if (this.lastPointer && Math.hypot(event.clientX - this.lastPointer.x, event.clientY - this.lastPointer.y) < 2) return;
    this.lastPointer = { x: event.clientX, y: event.clientY };
    const index = this.cardIndex(event.target);
    if (index >= 0) this.select(index, event.clientX - this.stage.getBoundingClientRect().left);
  }

  step(direction) {
    const initial = direction > 0 ? -1 : 0;
    this.select(((this.active ?? initial) + direction + this.cards.length) % this.cards.length);
  }

  onKeydown(event) {
    const index = this.cardIndex(event.target);
    if (index < 0 || event.target !== this.cards[index]) return;
    const rtl = getComputedStyle(this).direction === 'rtl';
    const directions = { ArrowLeft: rtl ? 1 : -1, ArrowRight: rtl ? -1 : 1 };
    let next;
    if (event.key in directions) next = (index + directions[event.key] + this.cards.length) % this.cards.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = this.cards.length - 1;
    else if (event.key === 'Escape') {
      event.preventDefault();
      this.cards[index].blur();
      this.select(null);
      return;
    } else return;
    event.preventDefault();
    this.select(next);
    this.cards[next].focus({ preventScroll: true });
  }
}

if (!customElements.get('mv-hero-stack')) customElements.define('mv-hero-stack', HeroStack);
