/** Keep mobile carousel arrows centered on the visible video, excluding card text. */
class CarouselMediaControls extends HTMLElement {
  #abort;
  #resize;
  #mutation;
  #frame = 0;
  #slideshow;
  #container;
  #media = [];
  #mobile = matchMedia('(max-width: 749px)');

  connectedCallback() {
    this.#abort = new AbortController();
    const options = { signal: this.#abort.signal, capture: true, passive: true };
    this.addEventListener('scroll', this.#schedule, options);
    this.addEventListener('load', this.#schedule, options);
    this.addEventListener('loadedmetadata', this.#schedule, options);
    this.#mobile.addEventListener('change', this.#schedule, { signal: this.#abort.signal });
    this.#resize = new ResizeObserver(this.#schedule);
    this.#mutation = new MutationObserver(this.#refresh);
    this.#mutation.observe(this, { childList: true, subtree: true });
    this.#refresh();
  }

  disconnectedCallback() {
    this.#abort?.abort();
    this.#resize?.disconnect();
    this.#mutation?.disconnect();
    cancelAnimationFrame(this.#frame);
    this.#frame = 0;
    this.#container?.style.removeProperty('--mv-carousel-media-center');
  }

  #refresh = () => {
    this.#slideshow = this.querySelector('slideshow-component.carousel-content');
    this.#container = this.#slideshow?.querySelector(':scope > slideshow-container');
    this.#media = this.#slideshow
      ? [...this.#slideshow.querySelectorAll('deferred-media, video-background-component, .video-placeholder-wrapper')]
          .filter((media) => media.closest('slideshow-component') === this.#slideshow)
      : [];
    this.#resize.disconnect();
    if (this.#container) this.#resize.observe(this.#container);
    for (const media of this.#media) this.#resize.observe(media);
    this.#schedule();
  };

  #schedule = () => {
    if (this.#frame) return;
    this.#frame = requestAnimationFrame(() => {
      this.#frame = 0;
      this.#update();
    });
  };

  #update() {
    if (!this.#container) return;
    if (!this.#mobile.matches) {
      this.#container.style.removeProperty('--mv-carousel-media-center');
      return;
    }

    const viewport = this.#container.getBoundingClientRect();
    let visibleWidth = 0;
    let center;
    for (const media of this.#media) {
      const rect = media.getBoundingClientRect();
      const width = Math.min(rect.right, viewport.right) - Math.max(rect.left, viewport.left);
      if (rect.height <= 0 || width <= visibleWidth) continue;
      visibleWidth = width;
      center = rect.top - viewport.top + rect.height / 2;
    }

    if (center === undefined) {
      this.#container.style.removeProperty('--mv-carousel-media-center');
    } else {
      this.#container.style.setProperty('--mv-carousel-media-center', `${center}px`);
    }
  }
}

if (!customElements.get('mv-carousel-media-controls')) {
  customElements.define('mv-carousel-media-controls', CarouselMediaControls);
}
