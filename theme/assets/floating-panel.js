import { debounce, requestIdleCallback, viewTransition } from '@theme/utilities';
import { Component } from '@theme/component';

const OFFSET = 40;

/**
 * A custom element that manages a floating panel.
 */
export class FloatingPanelComponent extends Component {
  #updatePosition = async () => {
    // Wait for any view transitions to finish
    if (viewTransition.current) await viewTransition.current;

    if (this.classList.contains('sorting-filter__options')) {
      const details = this.closest('details');
      if (!details?.open) return;

      const gutter = 16;
      const anchor = details.getBoundingClientRect();
      const spaceBelow = window.innerHeight - anchor.bottom - gutter;
      const spaceAbove = anchor.top - gutter;
      const openAbove = spaceBelow < 240 && spaceAbove > spaceBelow;
      this.style.top = openAbove ? 'auto' : '100%';
      this.style.bottom = openAbove ? '100%' : 'auto';
      this.style.insetInlineStart = 'auto';
      this.style.insetInlineEnd = '0';
      this.style.transform = 'none';
      this.style.setProperty('--sorting-panel-max-height', `${Math.max(0, openAbove ? spaceAbove : spaceBelow)}px`);

      const rect = this.getBoundingClientRect();
      const viewportWidth = document.documentElement.clientWidth;
      const shift = rect.left < gutter
        ? gutter - rect.left
        : Math.min(0, viewportWidth - gutter - rect.right);
      this.style.transform = `translateX(${shift}px)`;
      this.#mutationObserver.takeRecords();
      return;
    }

    const rect = this.getBoundingClientRect();
    const viewportWidth = window.innerWidth;

    this.style.top = OFFSET + 'px';

    if (rect.right > viewportWidth) {
      const overflowAmount = rect.right - viewportWidth + OFFSET;
      this.style.left = `-${overflowAmount}px`;
    }

    if (rect.left < 0) {
      const overflowAmount = Math.abs(rect.left) + OFFSET;
      this.style.left = `${overflowAmount}px`;
    }

    this.#mutationObserver.takeRecords();
  };

  #mutationObserver = new MutationObserver(this.#updatePosition);

  #resizeListener = debounce(() => {
    const parent = this.closest('details');
    const closeOnResize = this.dataset.closeOnResize === 'true';
    if (parent instanceof HTMLDetailsElement && closeOnResize) {
      parent.open = false;
      parent.removeAttribute('open');
      this.#updatePosition();
    } else if (this.classList.contains('sorting-filter__options')) {
      this.#updatePosition();
    }
  }, 100);

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('resize', this.#resizeListener);
    if (this.classList.contains('sorting-filter__options')) {
      const details = this.closest('details');
      if (details) this.#mutationObserver.observe(details, { attributes: true, attributeFilter: ['open'] });
    }

    requestIdleCallback(() => {
      this.#updatePosition();
      this.#mutationObserver.observe(this, { attributes: true });
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('resize', this.#resizeListener);
    this.#mutationObserver.disconnect();
  }
}

if (!customElements.get('floating-panel-component')) {
  customElements.define('floating-panel-component', FloatingPanelComponent);
}
