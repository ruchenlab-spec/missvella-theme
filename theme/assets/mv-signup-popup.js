import { DialogComponent } from '@theme/dialog';

const seenKey = 'mv-signup-popup:seen';
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

    if (!this.hasAttribute('data-configured')) return;
    if (window.Shopify?.designMode) {
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
    if (!this.hasAttribute('data-delay')) return;
    this.addEventListener('dialog:open', () => {
      clearTimeout(this.#timer);
      try { sessionStorage.setItem(seenKey, '1'); } catch { /* Storage is optional. */ }
    }, options);
    if (returned) return;
    try { if (sessionStorage.getItem(seenKey)) return; } catch { /* Stay click-only without storage. */ return; }
    this.#timer = setTimeout(() => {
      if (!document.hidden && !document.querySelector('dialog[open]') &&
          document.querySelector('mv-signup-component[data-configured]') === this) this.showDialog();
    }, Number(this.dataset.delay) * 1000);
  }

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
