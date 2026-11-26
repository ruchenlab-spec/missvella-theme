import { Component } from '@theme/component';
import { mediaQueryLarge } from '@theme/utilities';

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const canHover = matchMedia('(hover: hover)');

/** @extends {Component<{ track: HTMLElement, slides?: HTMLElement[], signupDialog: HTMLDialogElement, signupEmail: HTMLInputElement }>} */
export class AnnouncementBar extends Component {
  #current = 0;
  #timer;
  #listeners;
  #editorSlide;
  #copyTimeout;
  /** @type {Animation[]} */
  #animations = [];

  connectedCallback() {
    super.connectedCallback();
    this.#listeners = new AbortController();
    const options = { signal: this.#listeners.signal };
    mediaQueryLarge.addEventListener('change', this.#syncLayout, options);
    reducedMotion.addEventListener('change', this.#syncLayout, options);
    document.addEventListener('visibilitychange', this.#syncPlayback, options);
    this.refs.signupDialog.addEventListener('close', this.#syncPlayback, options);
    this.addEventListener('focusin', () => this.refs.track.setAttribute('aria-live', 'polite'), options);
    this.addEventListener('focusout', () => this.refs.track.removeAttribute('aria-live'), options);
    this.addEventListener('shopify:block:select', (event) => {
      const slide = event.target instanceof Element && event.target.closest('.announcement-bar__slide');
      if (!slide) return;
      this.#editorSlide = slide;
      this.#syncLayout();
    }, options);
    this.addEventListener('shopify:block:deselect', () => {
      this.#editorSlide = undefined;
      this.#syncPlayback();
    }, options);
    this.#syncLayout();
    if (this.refs.signupDialog.querySelector('[data-signup-feedback]')) this.openSignup();
  }

  updatedCallback() {
    super.updatedCallback();
    this.#syncLayout();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.#listeners.abort();
    clearInterval(this.#timer);
    clearTimeout(this.#copyTimeout);
    this.#cancelAnimations();
    this.#editorSlide = undefined;
  }

  #syncLayout = () => {
    const slides = this.refs.slides ?? [];
    const rotating = !mediaQueryLarge.matches && !reducedMotion.matches && slides.length > 1;
    this.toggleAttribute('data-rotating', rotating);
    this.#cancelAnimations();

    if (!slides.includes(this.#editorSlide)) this.#editorSlide = undefined;
    const selected = this.#editorSlide ?? document.activeElement;
    const selectedIndex = slides.findIndex((slide) => slide.contains(selected));
    this.#current = selectedIndex >= 0 ? selectedIndex : Math.min(this.#current, Math.max(0, slides.length - 1));
    slides.forEach((slide, index) => {
      slide.inert = rotating && index !== this.#current;
      if (rotating) slide.setAttribute('aria-hidden', String(slide.inert));
      else slide.removeAttribute('aria-hidden');
    });
    this.#syncPlayback();
  };

  #syncPlayback = () => {
    clearInterval(this.#timer);
    const delay = Number(this.getAttribute('autoplay')) * 1000;
    if (!this.hasAttribute('data-rotating') || reducedMotion.matches || document.hidden || this.#editorSlide || this.refs.signupDialog.open || !delay) {
      return;
    }
    this.#timer = setInterval(() => {
      if (this.matches(':focus-within') || (canHover.matches && this.matches(':hover'))) return;
      this.next();
    }, delay);
  };

  next() {
    this.#step();
  }

  async copyCode(event) {
    const button = event.target.closest('[data-code]');
    if (!button) return;
    const code = button.dataset.code;
    let copied = false;
    try {
      await navigator.clipboard.writeText(code);
      copied = true;
    } catch {
      const field = document.createElement('textarea');
      field.value = code;
      field.style.position = 'fixed';
      field.style.opacity = '0';
      document.body.append(field);
      field.select();
      try {
        copied = document.execCommand('copy');
      } catch {
        copied = false;
      }
      field.remove();
    }

    const label = button.querySelector('[data-copy-label]');
    const status = button.querySelector('[data-copy-status]');
    label.textContent = copied ? 'Copied!' : 'Copy failed';
    status.textContent = copied ? `${code} copied to clipboard` : 'Copy failed. Please copy the code manually.';
    clearTimeout(this.#copyTimeout);
    this.#copyTimeout = setTimeout(() => {
      label.textContent = 'Copy code';
      status.textContent = '';
    }, 2400);
  }

  openSignup() {
    const dialog = this.refs.signupDialog;
    if (dialog.open) return;
    dialog.showModal();
    this.#syncPlayback();
    this.refs.signupEmail.focus();
  }

  closeSignup() {
    this.refs.signupDialog.close();
  }

  #step() {
    const slides = this.refs.slides;
    if (!this.hasAttribute('data-rotating') || !slides || slides.length < 2) return;
    const outgoing = slides[this.#current];
    this.#current = (this.#current + 1) % slides.length;
    const incoming = slides[this.#current];
    this.#cancelAnimations();
    outgoing.inert = true;
    outgoing.setAttribute('aria-hidden', 'true');
    incoming.inert = false;
    incoming.setAttribute('aria-hidden', 'false');
    if (reducedMotion.matches) return;

    // Keep the outgoing line painted only for its exit. Its links are already inert.
    this.#animations = [
      outgoing.animate([
        { transform: 'translateY(0)', opacity: 1, visibility: 'visible' },
        { transform: 'translateY(-85%)', opacity: 0, visibility: 'visible' },
      ], { duration: 280, easing: 'cubic-bezier(.45, 0, .8, .45)' }),
      incoming.animate([
        { transform: 'translateY(100%)', opacity: 0 },
        { transform: 'translateY(0)', opacity: 1 },
      ], { duration: 480, delay: 80, fill: 'backwards', easing: 'cubic-bezier(.22, 1, .36, 1)' }),
    ];
  }

  #cancelAnimations() {
    this.#animations.forEach((animation) => animation.cancel());
    this.#animations = [];
  }
}

if (!customElements.get('announcement-bar-component')) {
  customElements.define('announcement-bar-component', AnnouncementBar);
}
