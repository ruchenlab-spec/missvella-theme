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
    this.pointerOver = false;
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
    }, options);
    this.addEventListener('pointerenter', (event) => {
      this.pointerOver = event.pointerType === 'mouse';
      this.syncAutoplay();
    }, options);
    this.addEventListener('pointerleave', () => {
      this.pointerOver = false;
      if (!this.mobileQuery.matches && !this.autoplayEnabled() && !this.contains(document.activeElement)) this.select(this.editorIndex);
      this.syncAutoplay();
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
          if (!this.mobileQuery.matches && !this.autoplayEnabled() && !this.stage.matches(':hover')) this.select(this.editorIndex);
        }
        this.syncAutoplay();
      });
    }, options);
    this.addEventListener('focusin', (event) => {
      this.keyboardFocus = event.target !== this.autoplayButton
        && (event.target.matches(':focus-visible') || Boolean(event.target.closest('a')));
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
    this.progressCircle = this.querySelector('[data-stack-progress]');
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
    this.progressAnimation?.cancel();
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
    this.syncAutoplay();
  }

  select(index, pointerX) {
    if (index !== null && (index < 0 || index >= this.cards.length)) return;
    if (this.active === index) return;
    this.active = index;
    this.activeX = this.openPosition(index ?? this.primary, pointerX);
    this.layout();
    this.syncAutoplay({ reset: true });
  }

  openPosition(index, pointerX) {
    if (index === null || !this.widths) return null;
    if (!this.stacked) return this.base[index];
    // Move focus within the space its unchanged neighbors can actually cover.
    // Empty left/right groups naturally pin the first/last card to that edge.
    const remaining = this.width - this.widths[index];
    const leftCapacity = this.widths.slice(0, index).reduce((sum, width) => sum + width, 0);
    const rightCapacity = this.widths.slice(index + 1).reduce((sum, width) => sum + width, 0);
    const reserve = Math.min(28, remaining / (this.cards.length - 1), Math.min(...this.widths) / 2);
    const left = Math.max(reserve * index, remaining - rightCapacity);
    const right = Math.min(remaining - reserve * (this.cards.length - index - 1), leftCapacity);
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
    // Controls share the media wrapper and follow the actual focused card bounds.
    this.style.setProperty('--mv-stack-controls-right', `${end}px`);
    this.style.setProperty('--mv-stack-controls-bottom', `${(this.stageHeight + this.heights[active]) / 2}px`);
    const leftCapacity = this.widths.slice(0, active).reduce((sum, width) => sum + width, 0);
    const rightCapacity = this.widths.slice(active + 1).reduce((sum, width) => sum + width, 0);
    const leftExposure = leftCapacity ? Math.min(1, start / leftCapacity) : 0;
    const rightExposure = rightCapacity ? Math.min(1, (this.width - end) / rightCapacity) : 0;
    let leftEdge = 0;
    let rightEdge = end;

    this.cards.forEach((card, index) => {
      let position = this.base[index];
      let layer = index + 1;
      let clipLeft = 0;
      let clipRight = 0;
      const frameWidth = this.widths[index];
      if (this.stacked && active !== null) {
        if (index < active) {
          const visibleWidth = frameWidth * leftExposure;
          position = leftEdge + visibleWidth - frameWidth;
          clipLeft = frameWidth - visibleWidth;
          leftEdge += visibleWidth;
        } else if (index > active) {
          const visibleWidth = frameWidth * rightExposure;
          position = rightEdge;
          clipRight = frameWidth - visibleWidth;
          rightEdge += visibleWidth;
          layer = count - index;
        } else {
          position = start;
          layer = count + 1;
        }
      }
      card.style.setProperty('--mv-card-x', `${position}px`);
      card.style.setProperty('--mv-card-width', `${frameWidth}px`);
      card.style.setProperty('--mv-card-layer', String(layer));
      card.style.setProperty('--mv-card-clip-left', `${clipLeft}px`);
      card.style.setProperty('--mv-card-clip-right', `${clipRight}px`);
      const selected = index === active;
      card.style.setProperty('--mv-card-height', `${this.heights[index]}px`);
      card.toggleAttribute('data-focus', selected);
      card.toggleAttribute('data-active', selected);
      const caption = card.querySelector('[data-stack-caption]');
      if (caption) caption.inert = !selected;
    });

    const counter = this.querySelector('[data-stack-counter]');
    if (counter) counter.textContent = active === null ? String(count) : `${active + 1} / ${count}`;
  }

  autoplayEnabled() {
    return (this.mobileQuery.matches ? this.dataset.mobileAutoplay : this.dataset.desktopAutoplay) === 'true';
  }

  syncAutoplay({ reset = false } = {}) {
    const delay = Math.max(2000, Number(this.dataset.autoplaySpeed) || 5000);
    if (reset || this.countdownDuration !== delay) {
      clearTimeout(this.timer);
      this.timer = null;
      this.progressAnimation?.cancel();
      this.progressAnimation = null;
      this.remaining = delay;
      this.countdownDuration = delay;
    }
    const enabled = this.autoplayEnabled();
    this.toggleAttribute('data-autoplay-enabled', enabled);
    const paused = this.userPaused || this.reducedQuery?.matches;
    this.toggleAttribute('data-autoplay-paused', Boolean(paused));
    if (this.autoplayButton) {
      this.autoplayButton.setAttribute('aria-pressed', String(!paused));
      this.autoplayButton.setAttribute('aria-label', paused ? this.autoplayButton.dataset.labelPlay : this.autoplayButton.dataset.labelPause);
    }
    const canPlay = enabled && this.cards.length > 1
      && !paused && !this.pointerHeld && !this.pointerOver && !this.keyboardFocus && this.editorIndex === null
      && this.inView && !document.hidden && this.isConnected;
    if (canPlay && this.timer == null) {
      this.startedAt = performance.now();
      this.timer = setTimeout(() => {
        this.timer = null;
        this.step(1);
      }, this.remaining);
      if (!this.progressAnimation) {
        this.progressAnimation = this.progressCircle?.animate(
          [{ strokeDashoffset: '0' }, { strokeDashoffset: '100' }],
          { duration: delay, easing: 'linear', fill: 'forwards' }
        );
      } else this.progressAnimation.play();
    } else if (!canPlay) {
      if (this.timer != null) {
        clearTimeout(this.timer);
        this.timer = null;
        this.remaining = Math.max(0, this.remaining - (performance.now() - this.startedAt));
      }
      this.progressAnimation?.pause();
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
