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
