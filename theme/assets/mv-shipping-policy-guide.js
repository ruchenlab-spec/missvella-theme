// Aliases identify destinations. All times and eligibility information come from the policy.
const countryAliases = {
  australia: ['au'], austria: ['at'], belgium: ['be'], canada: ['ca'],
  czechia: ['cz', 'czech republic'], denmark: ['dk'], finland: ['fi'],
  france: ['fr'], germany: ['de', 'deutschland'], ireland: ['ie'], italy: ['it'],
  japan: ['jp'], malaysia: ['my'], netherlands: ['nl', 'the netherlands'],
  'new zealand': ['nz'], norway: ['no'], poland: ['pl'], portugal: ['pt'],
  singapore: ['sg'], spain: ['es'], sweden: ['se'], switzerland: ['ch'],
  'united arab emirates': ['ae', 'uae'],
  'united kingdom': ['gb', 'uk', 'great britain'],
  'united states': ['us', 'usa', 'united states of america'],
};

function normalizeName(value) {
  return value.normalize('NFKD').replace(/[\u0300-\u036f.]/g, '').trim().toLowerCase().replace(/\s+/g, ' ');
}

function enableCountrySearch(guide, table) {
  const rows = Array.from(table.tBodies).flatMap(body => Array.from(body.rows));
  if (!rows.length) return;
  const panel = guide.querySelector('[data-country-panel]');
  const heading = table.previousElementSibling;
  const coverage = table.nextElementSibling;
  const countries = rows.map(row => {
    const name = normalizeName(row.cells[0].textContent);
    return { row, name, aliases: countryAliases[name] || [] };
  });
  const search = guide.querySelector('[data-country-search]').content.firstElementChild.cloneNode(true);
  const input = search.querySelector('input');
  const clear = search.querySelector('button');
  const status = search.querySelector('[data-result-count]');
  const scroll = document.createElement('div');
  scroll.className = 'shipping-policy-guide__scroll';
  scroll.tabIndex = 0;
  scroll.setAttribute('role', 'region');
  scroll.setAttribute('aria-label', table.getAttribute('aria-label') || 'Standard shipping by destination');
  table.id = input.getAttribute('aria-controls');
  if (heading?.matches('h2, h3, h4')) {
    panel.append(heading);
  } else {
    const title = document.createElement('h2');
    title.textContent = table.getAttribute('aria-label') || 'Standard shipping by destination';
    panel.append(title);
  }
  panel.append(search, scroll);
  scroll.append(table);
  if (coverage?.matches('p') && /US Standard Shipping coverage/i.test(coverage.querySelector('strong')?.textContent || '')) {
    coverage.classList.add('shipping-policy-guide__coverage');
    panel.append(coverage);
  }
  const update = () => {
    const query = normalizeName(input.value);
    const exactAlias = countries.some(country => country.aliases.includes(query));
    let count = 0;
    for (const { row, name, aliases } of countries) {
      const match = exactAlias ? aliases.includes(query) : name.includes(query) || aliases.some(alias => alias.startsWith(query));
      row.hidden = !match;
      if (match) count++;
    }
    scroll.scrollTop = 0;
    scroll.hidden = count === 0;
    clear.hidden = !input.value;
    status.textContent = count
      ? `${count} of ${countries.length} destinations shown.`
      : 'No published Standard Shipping estimate matches your search. Check your full address at checkout for available options.';
  };
  input.addEventListener('input', update);
  clear.addEventListener('click', () => {
    input.value = '';
    update();
    input.focus();
  });
  update();
  guide.querySelector('[data-country-jump]').hidden = false;
  guide.querySelector('[aria-controls="' + panel.id + '"]').hidden = false;
}

function presentMethods(copy, countryLink) {
  const table = Array.from(copy.querySelectorAll('table')).find(item =>
    /shipping methods, transit times and fees/i.test(item.getAttribute('aria-label') || '')
  );
  const headings = table?.tHead?.rows[0]?.cells;
  const rows = table ? Array.from(table.tBodies).flatMap(body => Array.from(body.rows)) : [];
  // Keep the original table if the policy starts publishing different columns or currencies.
  if (headings?.length !== 3 || !/transit/i.test(headings[1].textContent) ||
      !/fee.*USD/i.test(headings[2].textContent) || !rows.length || rows.some(row => row.cells.length !== 3)) return;

  const methods = document.createElement('div');
  methods.className = 'shipping-policy-guide__methods';
  for (const row of rows) {
    const [service, transit, fee] = row.cells;
    const card = document.createElement('article');
    const title = document.createElement('h3');
    title.append(...service.childNodes);
    const price = document.createElement('p');
    price.className = 'shipping-policy-guide__price';
    const currency = document.createElement('small');
    currency.textContent = /\bUSD\b/i.test(fee.textContent) ? '' : ' USD';
    price.append(...fee.childNodes, currency);
    const estimate = document.createElement('div');
    estimate.className = 'shipping-policy-guide__estimate';
    estimate.append(...transit.childNodes);
    const label = document.createElement('span');
    label.className = 'shipping-policy-guide__metric-label';
    label.textContent = headings[1].textContent;
    card.append(title, price, label, estimate);
    if (!countryLink.hidden && /standard/i.test(title.textContent)) {
      // In the tabbed guide the country table has its own panel.
      if (!estimate.childElementCount) estimate.textContent = estimate.textContent.replace(/\s*See the destination table below\./i, '');
      card.append(countryLink);
    }
    methods.append(card);
  }
  table.replaceWith(methods);
}

const faqQuestions = new Map([
  ['order confirmation and tracking', 'How do I check or track my order?'],
  ['if your order is delayed', 'What if my order or tracking is delayed?'],
  ['parcels returned because of an address error', 'What if my parcel is returned because of an address error?'],
  ['lost, damaged or missing packages', 'What if my parcel is lost, damaged or marked delivered but missing?'],
]);

function addAnswer(faq, question, nodes) {
  const disclosure = document.createElement('details');
  const summary = document.createElement('summary');
  summary.textContent = question;
  const body = document.createElement('div');
  body.className = 'shipping-policy-guide__answer';
  body.append(...nodes);
  disclosure.append(summary, body);
  faq.append(disclosure);
}

function enableShippingFaq(guide, copy) {
  const faq = guide.querySelector('[data-faq-panel]');
  const processing = Array.from(copy.querySelectorAll('h2, h3')).find(
    heading => normalizeName(heading.textContent) === 'order processing time'
  )?.nextElementSibling;
  const countryJump = guide.querySelector('[data-country-jump]');
  if (processing?.matches('p') && !countryJump.hidden) {
    const transit = document.createElement('p');
    const link = document.createElement('a');
    link.href = countryJump.getAttribute('href');
    link.textContent = 'Look up Standard Shipping for your destination';
    transit.append('Add the estimated transit time for your shipping method to the processing time. ', link, '.');
    addAnswer(faq, 'How do I estimate when my order will arrive?', [processing.cloneNode(true), transit]);
  }
  // Move the published answers intact, including lists, tracking links and remedies.
  const eventLead = Array.from(copy.querySelectorAll('p > strong:first-child')).find(
    lead => normalizeName(lead.textContent).startsWith('ordering for a wedding, prom')
  );
  if (eventLead) {
    const paragraph = eventLead.parentElement;
    const question = eventLead.textContent.trim();
    eventLead.remove();
    addAnswer(faq, question, [paragraph]);
  }
  for (const heading of copy.querySelectorAll('h2, h3')) {
    const question = faqQuestions.get(normalizeName(heading.textContent));
    if (!question) continue;
    const answer = [];
    let next = heading.nextElementSibling;
    while (next && next.matches('p, ul, ol')) {
      answer.push(next);
      next = next.nextElementSibling;
    }
    if (!answer.length) continue;
    addAnswer(faq, question, answer);
    heading.remove();
  }
  if (faq.querySelector('details')) {
    guide.querySelector('[aria-controls="' + faq.id + '"]').hidden = false;
  }
}

class ShippingPolicyGuide extends HTMLElement {
  connectedCallback() {
    const copy = this.querySelector('[data-policy-copy]');
    if (!copy || !this.querySelector('[data-country-search]')) return;
    if (!this.hasAttribute('data-ready')) this.preparePanels(copy);
    this.bindTabs();
  }

  disconnectedCallback() {
    this.controller?.abort();
  }

  preparePanels(copy) {
    // The legal page keeps its own typography. The guide uses theme table and FAQ styles.
    for (const element of copy.querySelectorAll('[style]')) element.removeAttribute('style');
    const first = copy.firstElementChild;
    const lead = first?.matches('div') ? first.firstElementChild : first;
    if (lead?.matches('p')) {
      const intro = this.querySelector('[data-guide-intro]');
      intro.append(lead);
      intro.hidden = false;
    }
    const tracking = copy.querySelector('a[href*="/apps/ordertracker"]');
    if (tracking) {
      const action = this.querySelector('[data-track-action]');
      action.href = tracking.getAttribute('href');
      action.hidden = false;
    }
    const countryTable = Array.from(copy.querySelectorAll('table')).find(table =>
      /standard shipping transit times by destination/i.test(table.getAttribute('aria-label') || '') ||
      /country|destination/i.test(table.tHead?.rows[0]?.cells[0]?.textContent || '')
    );
    if (countryTable) enableCountrySearch(this, countryTable);
    enableShippingFaq(this, copy);
    presentMethods(copy, this.querySelector('[data-country-jump]'));
    this.setAttribute('data-ready', '');
  }

  bindTabs() {
    this.controller?.abort();
    this.controller = new AbortController();
    const { signal } = this.controller;
    const list = this.querySelector('[role="tablist"]');
    const tabs = Array.from(list.querySelectorAll('[role="tab"]:not([hidden])'));
    const panels = tabs.map(tab => this.querySelector('#' + CSS.escape(tab.getAttribute('aria-controls'))));
    list.hidden = tabs.length < 2;
    for (const [index, panel] of panels.entries()) {
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', tabs[index].id);
      panel.tabIndex = 0;
    }
    const activate = (index, historyMethod) => {
      tabs.forEach((tab, i) => {
        const active = i === index;
        tab.tabIndex = active ? 0 : -1;
        tab.setAttribute('aria-selected', String(active));
        panels[i].hidden = !active;
      });
      const hash = '#' + panels[index].id;
      if (historyMethod && location.hash !== hash) history[historyMethod](history.state, '', hash);
    };
    const restore = () => {
      const index = panels.findIndex(panel => panel.id === location.hash.slice(1));
      activate(index < 0 ? 0 : index);
    };
    const desktop = window.matchMedia('(min-width: 850px)');
    const orient = () => list.setAttribute('aria-orientation', desktop.matches ? 'vertical' : 'horizontal');
    orient();
    desktop.addEventListener('change', orient, { signal });
    tabs.forEach((tab, index) => tab.addEventListener('click', () => activate(index, 'pushState'), { signal }));
    list.addEventListener('keydown', event => {
      const index = tabs.indexOf(event.target);
      if (index < 0) return;
      let next;
      if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = tabs.length - 1;
      else if (event.key === (desktop.matches ? 'ArrowDown' : 'ArrowRight')) next = (index + 1) % tabs.length;
      else if (event.key === (desktop.matches ? 'ArrowUp' : 'ArrowLeft')) next = (index + tabs.length - 1) % tabs.length;
      else return;
      event.preventDefault();
      activate(next, 'replaceState');
      tabs[next].focus();
    }, { signal });
    this.addEventListener('click', event => {
      const link = event.target.closest('a[href^="#"]');
      if (!link || event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
      const index = panels.findIndex(panel => '#' + panel.id === link.hash);
      if (index < 0) return;
      event.preventDefault();
      activate(index, 'pushState');
      const focusTarget = panels[index].querySelector('input[type="search"]') || panels[index];
      focusTarget.focus();
    }, { signal });
    window.addEventListener('hashchange', restore, { signal });
    restore();
  }
}

if (!customElements.get('mv-shipping-policy-guide')) {
  customElements.define('mv-shipping-policy-guide', ShippingPolicyGuide);
}
