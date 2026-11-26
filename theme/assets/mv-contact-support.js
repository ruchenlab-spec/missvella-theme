function bindEmailSuggestions(field, signal) {
  if (!field) return;
  const input = field.querySelector('input[type="email"]');
  const list = field.querySelector('.mv-contact__domains');
  const buttons = [...list.querySelectorAll('button')];
  if (!buttons.length) return;

  const refresh = () => {
    const parts = /^([^\s@]+)@([^\s@]*)$/.exec(input.value);
    const prefix = parts?.[2].toLowerCase();
    for (const button of buttons) {
      button.hidden = !parts || !button.value.startsWith(prefix) || button.value === prefix;
    }
    list.hidden = !buttons.some(button => !button.hidden);
  };
  input.addEventListener('input', refresh, { signal });
  input.addEventListener('focus', refresh, { signal });

  list.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button || button.hidden || list.hidden) return;
    input.value = input.value.slice(0, input.value.indexOf('@') + 1) + button.value;
    input.focus();
    input.dispatchEvent(new Event('input', { bubbles: true }));
    list.hidden = true;
  }, { signal });

  field.addEventListener('keydown', event => {
    if (list.hidden || event.isComposing) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      input.focus();
      list.hidden = true;
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      const choices = [input, ...buttons.filter(button => !button.hidden)];
      const step = event.key === 'ArrowDown' ? 1 : -1;
      const next = (choices.indexOf(event.target) + step + choices.length) % choices.length;
      event.preventDefault();
      choices[next].focus();
    }
  }, { signal });

  field.addEventListener('focusout', event => {
    // Touch browsers can report a null focus target while tapping a suggestion.
    if (event.relatedTarget && !field.contains(event.relatedTarget)) list.hidden = true;
  }, { signal });
  document.addEventListener('pointerdown', event => {
    if (!list.hidden && !field.contains(event.target)) list.hidden = true;
  }, { signal });
}

class ContactSupport extends HTMLElement {
  connectedCallback() {
    this.controller?.abort();
    const topicPicker = this.querySelector('[data-contact-topic]');
    if (!topicPicker) return;

    const groups = this.querySelectorAll('[data-topics]');
    const hint = this.querySelector('[data-contact-hint]');
    const update = () => {
      const selected = topicPicker.selectedOptions[0];
      const topic = selected?.dataset.topic;
      for (const group of groups) {
        const visible = group.dataset.topics.split(' ').includes(topic);
        group.hidden = !visible;
        // Disabled fieldsets keep the customer's draft when switching back,
        // while excluding unrelated values from validation and submission.
        if (group instanceof HTMLFieldSetElement) group.disabled = !visible;
      }
      hint.textContent = selected?.dataset.hint || '';
      hint.hidden = !hint.textContent;
    };

    this.controller = new AbortController();
    const { signal } = this.controller;
    bindEmailSuggestions(this.querySelector('[data-contact-email]'), signal);
    topicPicker.addEventListener('change', update, { signal });
    window.addEventListener('pageshow', update, { signal });
    update();
  }

  disconnectedCallback() {
    this.controller?.abort();
  }
}

if (!customElements.get('mv-contact-support')) {
  customElements.define('mv-contact-support', ContactSupport);
}
