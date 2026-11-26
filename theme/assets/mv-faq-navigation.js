import { getScrollContainer } from '@theme/scroll-container';

class FaqNavigation extends HTMLElement {
  connectedCallback() {
    this.frame = requestAnimationFrame(() => this.setup());
  }

  setup() {
    this.guide = this.closest('.mv-faq');
    this.nav = this.querySelector('nav');
    this.topics = Array.from(this.nav.querySelectorAll('a[href^="#"]'), link => ({
      link,
      heading: document.getElementById(link.hash.slice(1)),
    })).filter(topic => topic.heading && this.guide.contains(topic.heading));
    if (!this.topics.length) return;

    this.controller = new AbortController();
    const { signal } = this.controller;
    // The desktop theme scrolls its page wrapper; on phones the document scrolls.
    document.addEventListener('scroll', this.onScroll, { passive: true, signal });
    this.closest('.page-wrapper')?.addEventListener('scroll', this.onScroll, { passive: true, signal });
    window.addEventListener('resize', this.onScroll, { signal });
    this.nav.addEventListener('click', this.onClick, { signal });
    this.observer = new ResizeObserver(() => {
      this.guide.style.setProperty('--faq-nav-height', this.offsetHeight + 'px');
      this.onScroll();
    });
    this.observer.observe(this);
    this.observer.observe(this.guide);
    this.sync();
  }

  onClick = event => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest('a');
    const topic = this.topics.find(entry => entry.link === link);
    if (!topic) return;

    // A scroll-up header will be visible at an earlier destination and hidden at a later one.
    if (document.querySelector('#header-component[sticky="scroll-up"]')) {
      const goingUp = topic.heading.getBoundingClientRect().top < this.getBoundingClientRect().bottom + 12;
      this.guide.style.setProperty('--faq-jump-offset', goingUp ? 'var(--header-height)' : '0px');
    }
    this.jumping = true;
    this.select(link);
    this.onScroll();
    // The anchor itself handles focus, the URL fragment and browser history.
  };

  onScroll = () => {
    if (this.jumping) {
      // Keep the chosen button highlighted as a smooth anchor jump passes other topics.
      clearTimeout(this.settleTimer);
      this.settleTimer = setTimeout(() => {
        this.jumping = false;
        this.guide.style.removeProperty('--faq-jump-offset');
        this.sync();
      }, 140);
      return;
    }
    if (!this.frame) this.frame = requestAnimationFrame(() => this.sync());
  };

  sync() {
    this.frame = 0;
    if (this.jumping) return;
    // Match the 12px of reading space between the sticky row and an anchored heading.
    const readingLine = this.getBoundingClientRect().bottom + 13;
    const scroller = getScrollContainer();
    const atPageEnd = scroller.scrollTop > 0 && scroller.scrollHeight - scroller.clientHeight - scroller.scrollTop <= 1;
    const current = atPageEnd
      ? this.topics.at(-1)
      : this.topics.findLast(topic => topic.heading.getBoundingClientRect().top <= readingLine);
    this.select((current ?? this.topics[0]).link);
  }

  select(link) {
    if (this.current === link) return;
    this.current?.removeAttribute('aria-current');
    link.setAttribute('aria-current', 'location');
    this.current = link;
    const button = link.getBoundingClientRect();
    const rail = this.nav.getBoundingClientRect();
    const distance = button.left < rail.left ? button.left - rail.left : Math.max(0, button.right - rail.right);
    if (distance) {
      const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
      this.nav.scrollBy({ left: distance, behavior: reducedMotion ? 'instant' : 'smooth' });
    }
  }

  disconnectedCallback() {
    this.controller?.abort();
    this.observer?.disconnect();
    cancelAnimationFrame(this.frame);
    clearTimeout(this.settleTimer);
    this.jumping = false;
    this.current?.removeAttribute('aria-current');
    this.current = null;
    this.guide?.style.removeProperty('--faq-jump-offset');
    this.guide?.style.removeProperty('--faq-nav-height');
  }
}

if (!customElements.get('mv-faq-navigation')) customElements.define('mv-faq-navigation', FaqNavigation);
