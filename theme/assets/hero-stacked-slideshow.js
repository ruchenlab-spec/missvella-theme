/** Variable-width image stack. Geometry is independent of animated DOM positions. */
class HeroStack extends HTMLElement {
  connectedCallback() {
    this.stage = this.querySelector('[data-stack-stage]');
    this.cards = [...this.querySelectorAll('[data-stack-card]')];
    if (!this.stage || !this.cards.length) return;

    this.primary = Math.max(0, this.cards.findIndex((card) => card.dataset.primary === 'true'));
    this.active = null;
    this.editorIndex = null;
    this.userPaused = false;
    this.pointerHeld = false;
    this.keyboardFocus = false;
    this.inView = false;
    this.createEdgeCopies();
    this.abort = new AbortController();
    const options = { signal: this.abort.signal };
    this.mobileQuery = matchMedia('(max-width: 768px)');
    this.mobileQuery.addEventListener('change', () => { this.measure(); this.syncAutoplay(); }, options);
    this.reducedQuery = matchMedia('(prefers-reduced-motion: reduce)');
    this.reducedQuery.addEventListener('change', () => this.syncAutoplay(), options);
    document.addEventListener('visibilitychange', () => this.syncAutoplay(), options);
    this.stage.addEventListener('pointermove', (event) => this.onPointerMove(event), options);
    this.stage.addEventListener('pointerleave', () => {
      this.lastPointer = null;
      if (!this.mobileQuery.matches && !this.contains(document.activeElement)) this.select(this.editorIndex);
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
        if (!this.isConnected) return;
        if (!this.contains(document.activeElement)) {
          this.keyboardFocus = false;
          if (!this.mobileQuery.matches && !this.stage.matches(':hover')) this.select(this.editorIndex);
        }
        this.syncAutoplay();
      });
    }, options);
    this.addEventListener('focusin', (event) => {
      this.keyboardFocus = event.target.matches(':focus-visible') || Boolean(event.target.closest('a'));
      this.syncAutoplay();
    }, options);
    this.addEventListener('pointerdown', () => { this.pointerHeld = true; this.syncAutoplay(); }, options);
    const releasePointer = () => { this.pointerHeld = false; this.syncAutoplay(); };
    document.addEventListener('pointerup', releasePointer, options);
    document.addEventListener('pointercancel', releasePointer, options);
    this.stage.addEventListener('keydown', (event) => this.onKeydown(event), options);
    this.querySelector('.mv-hero-stack__previous')?.addEventListener('click', () => this.step(-1), options);
    this.querySelector('.mv-hero-stack__next')?.addEventListener('click', () => this.step(1), options);
    this.autoplayButton = this.querySelector('[data-stack-autoplay]');
    this.autoplayButton?.addEventListener('click', () => {
      this.userPaused = !this.userPaused;
      this.syncAutoplay();
    }, options);

    // Scope editor selection to this section, including after section hot reloads.
    document.addEventListener('shopify:block:select', (event) => {
      const index = this.cards.findIndex((card) => card.dataset.blockId === event.detail?.blockId);
      if (index < 0) return;
      this.editorIndex = index;
      this.select(index);
      this.syncAutoplay();
    }, options);
    document.addEventListener('shopify:block:deselect', (event) => {
      if (!this.cards.some((card) => card.dataset.blockId === event.detail?.blockId)) return;
      this.editorIndex = null;
      this.select(null);
      this.syncAutoplay();
    }, options);

    this.observer = new ResizeObserver(() => this.measure());
    this.observer.observe(this.stage);
    this.visibilityObserver = new IntersectionObserver(([entry]) => {
      this.inView = entry.isIntersecting;
      this.syncAutoplay();
    });
    this.visibilityObserver.observe(this);
    this.measure();
  }

  disconnectedCallback() {
    this.abort?.abort();
    this.observer?.disconnect();
    this.visibilityObserver?.disconnect();
    clearTimeout(this.timer);
    this.copies?.left.forEach((copy) => copy.remove());
    this.copies?.right.forEach((copy) => copy.remove());
    cancelAnimationFrame(this.instantFrame);
    cancelAnimationFrame(this.settleFrame);
  }

  cardIndex(target) {
    const copy = target.closest('[data-stack-source]');
    if (copy) return Number(copy.dataset.stackSource);
    return this.cards.indexOf(target.closest('[data-stack-card]'));
  }

  createEdgeCopies() {
    const create = (card, index) => {
      const copy = document.createElement('div');
      copy.className = 'mv-hero-stack__card mv-hero-stack__copy';
      copy.dataset.stackSource = String(index);
      copy.setAttribute('aria-hidden', 'true');
      copy.hidden = true;
      // Copy imagery only: no links, captions, IDs or Shopify editor attributes.
      for (const image of card.querySelectorAll('.mv-hero-stack__image, .mv-hero-stack__placeholder')) {
        copy.append(image.cloneNode(true));
      }
      this.stage.append(copy);
      return copy;
    };
    this.copies = { left: this.cards.map(create), right: this.cards.map(create) };
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
    this.heights = heights;
    this.stageHeight = stageHeight;
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
      this.base = this.widths.map((cardWidth) => (width - cardWidth) / 2);
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
    this.syncAutoplay();
  }

  select(index, pointerX) {
    if (index !== null && (index < 0 || index >= this.cards.length)) return;
    if (this.active === index) return;
    this.active = index;
    this.activeX = this.openPosition(index ?? this.primary, pointerX);
    this.layout();
    this.syncAutoplay();
  }

  openPosition(index, pointerX) {
    if (index === null || !this.widths) return null;
    if (!this.stacked) return this.base[index];
    const reserve = Math.min(28, (this.width - this.widths[index]) / 4);
    const left = reserve;
    const right = this.width - this.widths[index] - reserve;
    let position = (this.width - this.widths[index]) / 2;
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
    const leftCount = Math.floor((count - 1) / 2);
    const order = Array.from({ length: count }, (_, rank) => (active - leftCount + rank + count) % count);
    const advance = 1 - Number(this.dataset.overlap) / 100;
    const stripWidth = (indices, space) => indices.length
      ? Math.min(space / indices.length, indices.reduce((sum, index) => sum + this.widths[index], 0) / indices.length * advance)
      : 0;
    const leftStrip = stripWidth(order.slice(0, leftCount), start);
    const rightStrip = stripWidth(order.slice(leftCount + 1), this.width - end);

    this.cards.forEach((card, index) => {
      let position = this.base[index];
      let layer = index + 1;
      let clipLeft = 0;
      let clipRight = 0;
      if (this.stacked && active !== null) {
        const rank = order.indexOf(index);
        if (rank < leftCount) {
          position = start - leftStrip * (leftCount - rank - 1) - this.widths[index];
          clipLeft = Math.max(0, this.widths[index] - leftStrip);
          layer = rank + 1;
        } else if (rank > leftCount) {
          position = end + rightStrip * (rank - leftCount - 1);
          clipRight = Math.max(0, this.widths[index] - rightStrip);
          layer = count - rank;
        } else {
          position = start;
          layer = count + 1;
        }
      }
      card.style.setProperty('--mv-card-x', `${position}px`);
      card.style.setProperty('--mv-card-layer', String(layer));
      card.style.setProperty('--mv-card-clip-left', `${clipLeft}px`);
      card.style.setProperty('--mv-card-clip-right', `${clipRight}px`);
      const selected = index === active;
      card.style.setProperty('--mv-card-height', `${this.stacked && !selected ? this.stageHeight : this.heights[index]}px`);
      card.toggleAttribute('data-focus', selected);
      card.toggleAttribute('data-active', selected);
      const caption = card.querySelector('[data-stack-caption]');
      if (caption) caption.inert = !selected;
    });
    this.fillEdges(active, start, end);

    const counter = this.querySelector('[data-stack-counter]');
    if (counter) counter.textContent = active === null ? String(count) : `${active + 1} / ${count}`;
  }

  fillEdges(active, start, end) {
    if (!this.copies) return;
    for (const direction of ['left', 'right']) {
      this.copies[direction].forEach((copy) => { copy.hidden = true; });
      if (!this.stacked) continue;
      let edge = direction === 'left' ? start : end;
      for (let distance = 1; distance < this.cards.length; distance++) {
        const index = (active + (direction === 'left' ? -distance : distance) + this.cards.length) % this.cards.length;
        const copy = this.copies[direction][index];
        const width = this.widths[index];
        const position = direction === 'left' ? edge - width : edge;
        copy.hidden = false;
        copy.style.setProperty('--mv-card-width', `${width}px`);
        copy.style.setProperty('--mv-card-height', `${this.stageHeight}px`);
        copy.style.setProperty('--mv-card-x', `${position}px`);
        copy.style.setProperty('--mv-card-layer', '0');
        edge += direction === 'left' ? -width : width;
        if (direction === 'left' ? edge <= 0 : edge >= this.width) break;
      }
    }
  }

  syncAutoplay() {
    clearTimeout(this.timer);
    this.timer = null;
    const paused = this.userPaused || this.reducedQuery?.matches;
    this.toggleAttribute('data-autoplay-paused', Boolean(paused));
    if (this.autoplayButton) {
      this.autoplayButton.setAttribute('aria-pressed', String(!paused));
      this.autoplayButton.setAttribute('aria-label', paused ? this.autoplayButton.dataset.labelPlay : this.autoplayButton.dataset.labelPause);
    }
    const canPlay = this.mobileQuery.matches && this.dataset.mobileAutoplay === 'true' && this.cards.length > 1
      && !paused && !this.pointerHeld && !this.keyboardFocus && this.editorIndex === null
      && this.inView && !document.hidden && this.isConnected;
    if (canPlay) {
      const delay = Math.max(2000, Number(this.dataset.autoplaySpeed) || 5000);
      this.timer = setTimeout(() => this.step(1), delay);
    }
    this.querySelector('[data-stack-counter]')?.setAttribute('aria-live', canPlay ? 'off' : 'polite');
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
