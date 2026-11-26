import { DialogComponent } from '@theme/dialog';

const seenKey = 'mv-signup-popup:seen';
const enteredKey = 'mv-signup-popup:entered-at';
const dismissedKey = 'mv-signup-popup:dismissed-until';
const knownKey = 'mv-signup-popup:known';
const dayMs = 24 * 60 * 60 * 1000;
let editorPreviewForm;

class SignupPopup extends DialogComponent {
  #listeners;
  #timer;
  #copyTimer;

  connectedCallback() {
    super.connectedCallback();
    this.#listeners = new AbortController();
    const options = { signal: this.#listeners.signal };
    const form = this.querySelector('form');
    const feedback = form.querySelector('[data-signup-feedback]');
    const returned = feedback && (location.hash ? location.hash === '#' + form.id : feedback.dataset.owner === form.id);
    if (returned) {
      feedback.hidden = false;
      if (feedback.dataset.signupFeedback === 'success') {
        form.querySelector('[data-fields]').hidden = true;
      } else {
        const input = form.querySelector('[type=email]');
        input.setAttribute('aria-invalid', 'true');
        input.setAttribute('aria-describedby', feedback.id);
      }
      this.showDialog();
    }

    if (window.Shopify?.designMode) {
      if (!this.hasAttribute('data-configured')) return;
      const section = this.closest('.shopify-section');
      this.addEventListener('dialog:open', () => { editorPreviewForm = form.id; }, options);
      this.addEventListener('dialog:close', () => {
        if (editorPreviewForm === form.id) editorPreviewForm = undefined;
      }, options);
      section?.addEventListener('shopify:section:select', () => this.showDialog(), options);
      section?.addEventListener('shopify:section:deselect', () => {
        editorPreviewForm = undefined;
        this.closeDialog();
      }, options);
      if (!returned && editorPreviewForm === form.id) this.showDialog();
      return;
    }
    const known = this.hasAttribute('data-known-customer') || document.querySelector('[data-newsletter-success]') ||
      (returned && feedback.dataset.signupFeedback === 'success');
    if (known) {
      try { localStorage.setItem(knownKey, '1'); } catch { /* The server signal still suppresses this visit. */ }
      return;
    }

    this.addEventListener('dialog:open', () => {
      clearTimeout(this.#timer);
      try {
        sessionStorage.setItem(seenKey, '1');
        sessionStorage.removeItem(enteredKey);
      } catch { /* Manual opens work without storage. */ }
    }, options);
    this.addEventListener('dialog:close', () => {
      try {
        const until = Date.now() + Number(this.dataset.cooldownDays) * dayMs;
        localStorage.setItem(dismissedKey, String(until));
        sessionStorage.removeItem(seenKey);
      } catch { /* Keep the session suppression if the deadline cannot be saved. */ }
    }, options);
    if (returned || !this.hasAttribute('data-delay')) return;

    this.#scheduleAutoOpen();
    document.addEventListener('visibilitychange', this.#scheduleAutoOpen, options);
    // A different dialog may have occupied the page when the delay elapsed.
    document.addEventListener('close', this.#scheduleAutoOpen, { ...options, capture: true });
  }

  #eligible() {
    const active = document.querySelector('mv-signup-component[data-configured]') ?? document.querySelector('mv-signup-component');
    if (active !== this || document.hidden || document.querySelector('dialog[open]')) return false;
    try {
      return !localStorage.getItem(knownKey) && !sessionStorage.getItem(seenKey) &&
        Number(localStorage.getItem(dismissedKey)) <= Date.now();
    } catch {
      return false;
    }
  }

  #scheduleAutoOpen = () => {
    clearTimeout(this.#timer);
    if (!this.#eligible()) return;
    let entered;
    try {
      entered = Number(sessionStorage.getItem(enteredKey)) || Date.now();
      sessionStorage.setItem(enteredKey, String(entered));
    } catch { return; }
    const remaining = entered + Number(this.dataset.delay) * 1000 - Date.now();
    this.#timer = setTimeout(() => {
      if (this.#eligible()) this.showDialog();
    }, Math.max(0, remaining));
  };

  disconnectedCallback() {
    this.#listeners?.abort();
    clearTimeout(this.#timer);
    clearTimeout(this.#copyTimer);
    super.disconnectedCallback();
  }

  async copyCoupon(event) {
    const button = event.target.closest('[data-code]');
    if (!button) return;
    let copied = false;
    try {
      await navigator.clipboard.writeText(button.dataset.code);
      copied = true;
    } catch {
      // Select the printed code inside the modal, including when clipboard access is denied.
      const range = document.createRange();
      range.selectNodeContents(button.querySelector('strong'));
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
      try { copied = document.execCommand('copy'); } catch { /* Keep the code selected. */ }
      if (copied) selection?.removeAllRanges();
    }
    const label = button.querySelector('[data-copy-label]');
    const status = this.querySelector('[data-copy-status]');
    label.textContent = copied ? 'Copied!' : 'Select & copy';
    status.textContent = copied ? 'Coupon code copied.' : 'Select and copy the printed code.';
    clearTimeout(this.#copyTimer);
    this.#copyTimer = setTimeout(() => {
      label.textContent = 'Copy code';
      status.textContent = '';
    }, 2400);
  }
}

if (!customElements.get('mv-signup-component')) customElements.define('mv-signup-component', SignupPopup);
