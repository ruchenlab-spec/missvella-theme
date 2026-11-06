/** Variable-width image stack. Geometry is independent of animated DOM positions. */
class HeroStack extends HTMLElement {
  connectedCallback() {
    this.stage = this.querySelector('[data-stack-stage]');
    this.cards = [...this.querySelectorAll('[data-stack-card]')];
    if (!this.stage || !this.cards.length) return;

    this.primary = Math.max(0, this.cards.findIndex((card) => card.dataset.primary === 'true'));
    this.active = null;
    this.editorIndex = null;
    this.abort = new AbortController();
    const options = { signal: this.abort.signal };
    this.mobileQuery = matchMedia('(max-width: 768px)');
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
    if (!width) return;
    // Read the configured limit, never the stage height that this method writes.
    // This keeps repeated ResizeObserver updates from progressively shrinking the images.
    const styles = getComputedStyle(this);
    const configuredHeight = parseFloat(styles.getPropertyValue(
      this.mobileQuery.matches ? '--mv-stack-height-mobile' : '--mv-stack-height'
    ));
    const autoHeight = !this.mobileQuery.matches && !Number.isFinite(configuredHeight);
    const height = Number.isFinite(configuredHeight) ? configuredHeight : 400;
    const count = this.cards.length;
    const maxWidth = width * (count === 1 ? 1 : this.mobileQuery.matches ? 0.84 : 0.8);
    const primaryScale = Math.min(1, Math.max(0.2, (Number(this.dataset.primaryWidth) || 100) / 100));
    this.width = width;
    const heights = [];
    this.widths = this.cards.map((card, index) => {
      const ratio = Number(this.mobileQuery.matches ? card.dataset.mobileRatio : card.dataset.ratio) || 0.75;
      const naturalWidth = autoHeight ? Number(card.dataset.imageWidth) || maxWidth : height * ratio;
      const scale = index === this.primary ? primaryScale : 1;
      const cardWidth = Math.min(naturalWidth, maxWidth) * scale;
      const cardHeight = this.mobileQuery.matches || autoHeight ? cardWidth / ratio : height * scale;
      heights.push(cardHeight);
      card.style.setProperty('--mv-card-width', `${cardWidth}px`);
      card.style.setProperty('--mv-card-height', `${cardHeight}px`);
      return cardWidth;
    });
    // Mobile and automatic desktop height wrap the actual images without blank bands.
    const stageHeight = this.mobileQuery.matches || autoHeight ? Math.max(...heights) : height;
    this.stage.style.height = `${stageHeight}px`;

    const totalWidth = this.widths.reduce((total, cardWidth) => total + cardWidth, 0);
    this.stacked = totalWidth > width;
    this.toggleAttribute('data-stacked', this.stacked);
    if (!this.stacked) {
      // Reduce the optional gap before considering overlap. Hover never shifts a fitted row.
      const gap = count > 1 ? Math.min(16, (width - totalWidth) / (count - 1)) : 0;
      let position = (width - totalWidth - gap * (count - 1)) / 2;
      this.base = this.widths.map((cardWidth) => {
        const start = position;
        position += cardWidth + gap;
        return start;
      });
    } else {
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
    }
    this.activeX = this.openPosition(this.active ?? this.primary);

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
    this.activeX = this.openPosition(index ?? this.primary, pointerX);
    this.layout();
  }

  openPosition(index, pointerX) {
    if (index === null || !this.widths) return null;
    if (!this.stacked) return this.base[index];
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
    const active = this.active ?? this.primary;
    const count = this.cards.length;
    const start = active === null ? 0 : this.activeX;
    const end = active === null ? 0 : start + this.widths[active];

    this.cards.forEach((card, index) => {
      let position = this.base[index];
      let layer = index + 1;
      let clipLeft = 0;
      let clipRight = 0;
      if (this.stacked && active !== null) {
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
      const selected = !this.stacked || index === active || count === 1;
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
    this.select(((this.active ?? this.primary) + direction + this.cards.length) % this.cards.length);
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
