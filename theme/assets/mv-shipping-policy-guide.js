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
  table.before(search, scroll);
  scroll.append(table);
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
  disclosure.append(summary, ...nodes);
  faq.append(disclosure);
}

function enableShippingFaq(guide, copy) {
  const faq = guide.querySelector('[data-shipping-faq]').content.firstElementChild.cloneNode(true);
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
    copy.after(faq);
    guide.querySelector('[data-faq-jump]').hidden = false;
  }
}

class ShippingPolicyGuide extends HTMLElement {
  connectedCallback() {
    if (this.initialized) return;
    const copy = this.querySelector('[data-policy-copy]');
    if (!copy || !this.querySelector('[data-shipping-faq]')) return;
    this.initialized = true;
    // The legal page keeps its own typography. The guide uses theme table and FAQ styles.
    for (const element of copy.querySelectorAll('[style]')) element.removeAttribute('style');
    const countryTable = Array.from(copy.querySelectorAll('table')).find(table =>
      /standard shipping transit times by destination/i.test(table.getAttribute('aria-label') || '') ||
      /country|destination/i.test(table.tHead?.rows[0]?.cells[0]?.textContent || '')
    );
    if (countryTable) enableCountrySearch(this, countryTable);
    enableShippingFaq(this, copy);
    this.querySelector('nav').hidden = !this.querySelector('nav a:not([hidden])');
  }
}

if (!customElements.get('mv-shipping-policy-guide')) {
  customElements.define('mv-shipping-policy-guide', ShippingPolicyGuide);
}
