// Targeted geometry and lifecycle checks. No browser or rendering dependencies.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const schemaOf = (file) => JSON.parse(read(file).match(/{% schema %}([\s\S]*?){% endschema %}/)[1]);
const schema = schemaOf('theme/sections/hero-stacked-slideshow.liquid');
const heroSchema = schemaOf('theme/sections/hero-slideshow.liquid');
assert.deepEqual(schema.settings.find((s) => s.id === 'section_height').options,
  heroSchema.settings.find((s) => s.id === 'section_height').options);
for (const settings of [schema.settings, ...schema.blocks.map((block) => block.settings)]) {
  const ids = settings.filter((s) => s.id).map((s) => s.id);
  assert.equal(ids.length, new Set(ids).size);
  for (const s of settings.filter((s) => s.type === 'range')) {
    assert(s.default >= s.min && s.default <= s.max && (s.default - s.min) % s.step === 0, s.id);
  }
}
assert.equal(schema.settings.find((s) => s.id === 'mobile_autoplay').default, false);
assert.equal(schema.settings.find((s) => s.id === 'inactive_effect').default, 'dim');
for (const id of ['title', 'subtitle', 'text']) assert(schema.blocks[0].settings.some((s) => s.id === id));

class Element {
  constructor(tag = 'div') {
    this.tag = tag; this.dataset = {}; this.attributes = new Map(); this.children = [];
    this.events = new Map(); this.className = ''; this.hidden = false; this.isConnected = true;
    this.style = { setProperty(key, value) { this[key] = value; } };
  }
  setAttribute(key, value) { this.attributes.set(key, value); }
  toggleAttribute(key, on) { if (on) this.attributes.set(key, ''); else this.attributes.delete(key); }
  addEventListener(type, listener, { signal } = {}) {
    if (!this.events.has(type)) this.events.set(type, new Set());
    this.events.get(type).add(listener);
    signal?.cleanups.push(() => this.events.get(type).delete(listener));
  }
  emit(type, event = {}) { for (const handler of this.events.get(type) || []) handler({ target: this, ...event }); }
  append(child) { child.parent = this; this.children.push(child); }
  remove() { if (this.parent) this.parent.children = this.parent.children.filter((c) => c !== this); }
  matches(selector) {
    return selector.split(',').some((s) => {
      s = s.trim();
      if (s === ':focus-visible') return Boolean(this.focusVisible);
      if (s === ':hover') return Boolean(this.hovered);
      if (s.startsWith('.')) return this.className.split(' ').includes(s.slice(1));
      if (s.startsWith('[data-')) {
        const key = s.slice(6, -1).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
        return Object.hasOwn(this.dataset, key);
      }
      return this.tag === s;
    });
  }
  closest(selector) { return this.matches(selector) ? this : this.parent?.closest(selector) || null; }
  querySelectorAll(selector) {
    return this.children.flatMap((child) => [...(child.matches(selector) ? [child] : []), ...child.querySelectorAll(selector)]);
  }
  querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
  contains(node) { return node === this || this.children.some((child) => child.contains(node)); }
  cloneNode() { const copy = new Element(this.tag); copy.className = this.className; return copy; }
  focus() { document.activeElement = this; }
  blur() { document.activeElement = null; }
}
class Abort {
  constructor() { this.signal = { cleanups: [] }; }
  abort() { this.signal.cleanups.forEach((cleanup) => cleanup()); }
}
class Observer {
  constructor(callback) { this.callback = callback; }
  observe() {}
  disconnect() { this.disconnected = true; }
}
const document = new Element('document'); document.createElement = (tag) => new Element(tag);
const timers = new Map(); let timerId = 0; let Stack; let viewport = 320;
const context = {
  HTMLElement: Element, AbortController: Abort, ResizeObserver: Observer, IntersectionObserver: Observer, document,
  customElements: { get() {}, define(name, Class) { Stack = Class; } },
  matchMedia(query) { const media = new Element(); media.matches = query.includes('768px') ? viewport <= 768 : false; return media; },
  getComputedStyle(element) { return { direction: 'ltr', getPropertyValue(key) {
    return key === '--mv-stack-height-mobile' ? '400px' : element.heightMode === 'auto' ? 'auto' : `${element.heightMode}px`;
  } }; },
  setTimeout(callback, delay) { timers.set(++timerId, { callback, delay }); return timerId; },
  clearTimeout(id) { timers.delete(id); }, requestAnimationFrame() { return 1; }, cancelAnimationFrame() {}, queueMicrotask,
};
vm.runInNewContext(read('theme/assets/hero-stacked-slideshow.js'), context);
function create(width, count, mode = 640, scale = 100, autoplay = false) {
  viewport = width;
  const stack = new Stack(); stack.heightMode = mode;
  stack.dataset = { overlap: 50, primaryWidth: scale, mobileAutoplay: String(autoplay), autoplaySpeed: 5000 };
  const stage = new Element(); stage.dataset.stackStage = ''; stage.clientWidth = width; stack.append(stage);
  for (let index = 0; index < count; index++) {
    const card = new Element(); card.dataset = { stackCard: '', blockId: `image-${index}`, ratio: [0.5, 1.8, 0.75, 3, 0.35][index % 5], imageWidth: 1200 };
    card.dataset.mobileRatio = card.dataset.ratio; card.dataset.primary = String(index === count - 1);
    const image = new Element('img'); image.className = 'mv-hero-stack__image'; card.append(image);
    const caption = new Element(); caption.dataset.stackCaption = ''; caption.append(new Element('a')); card.append(caption); stage.append(card);
  }
  const counter = new Element(); counter.dataset.stackCounter = ''; stack.append(counter);
  const button = new Element('button'); button.dataset = { stackAutoplay: '', labelPlay: 'Play', labelPause: 'Pause' }; stack.append(button);
  stack.connectedCallback(); return stack;
}
const value = (element, key) => parseFloat(element.style[key]);
function verify(stack) {
  const selected = stack.active ?? stack.primary;
  const focus = stack.cards[selected];
  const start = value(focus, '--mv-card-x'), end = start + stack.widths[selected];
  assert(start >= -1e-7 && end <= stack.width + 1e-7);
  assert.equal(value(stack, '--mv-stack-controls-right'), end);
  assert.equal(value(stack, '--mv-stack-controls-bottom'), (stack.stageHeight + stack.heights[selected]) / 2);
  assert.equal(stack.cards.filter((card) => card.attributes.has('data-focus')).length, 1);
  assert.equal(value(focus, '--mv-card-clip-left'), 0); assert.equal(value(focus, '--mv-card-clip-right'), 0);
  stack.cards.forEach((card, index) => {
    assert.equal(card.querySelector('[data-stack-caption]').inert, index !== selected);
    if (!stack.stacked) assert.equal(value(card, '--mv-card-x'), stack.base[index]);
    else if (index !== selected) assert.equal(value(card, '--mv-card-height'), stack.stageHeight);
  });
  for (const direction of ['left', 'right']) {
    const visible = stack.copies[direction].filter((copy) => !copy.hidden);
    if (!stack.stacked) { assert.equal(visible.length, 0); continue; }
    const spans = visible.map((copy) => [value(copy, '--mv-card-x'), value(copy, '--mv-card-x') + value(copy, '--mv-card-width')]).sort((a, b) => a[0] - b[0]);
    assert(spans.length > 0, `${direction} has no cyclic images`);
    assert(spans[0][0] <= (direction === 'left' ? 0 : end) + 1e-7);
    let reach = spans[0][1];
    for (const span of spans.slice(1)) { assert(span[0] <= reach + 1e-7, 'gap in edge imagery'); reach = Math.max(reach, span[1]); }
    assert(reach >= (direction === 'left' ? start : stack.width) - 1e-7, 'edge not filled');
    for (const copy of visible) {
      assert.equal(copy.attributes.get('aria-hidden'), 'true');
      assert.equal(copy.querySelector('a'), null); assert.equal(copy.dataset.blockId, undefined);
      assert.equal(value(copy, '--mv-card-height'), stack.stageHeight);
      assert.equal(stack.cardIndex(copy.children[0]), Number(copy.dataset.stackSource));
    }
  }
}
let scenarios = 0;
for (const width of [320, 768, 769, 1440]) for (const count of [1, 2, 5, 12])
for (const mode of [640, 960, 'auto']) for (const scale of [20, 55, 100]) {
  const stack = create(width, count, mode, scale); verify(stack);
  const first = JSON.stringify([stack.widths, stack.heights, stack.stageHeight]); stack.measure(); stack.measure();
  assert.equal(JSON.stringify([stack.widths, stack.heights, stack.stageHeight]), first);
  for (let index = 0; index < count; index++) { stack.select(index); verify(stack); }
  stack.select(count - 1); stack.step(1); assert.equal(stack.active, 0); verify(stack);
  stack.step(-1); assert.equal(stack.active, count - 1); verify(stack);
  stack.select(null); verify(stack);
  if (width <= 768 || mode === 'auto') assert.equal(stack.stageHeight, Math.max(...stack.heights));
  else assert.equal(stack.stageHeight, mode);
  stack.disconnectedCallback(); assert.equal(stack.stage.children.length, count); scenarios++;
}

const auto = create(320, 5, 640, 100, true);
assert.equal(auto.timer, null, 'offscreen must not rotate');
auto.visibilityObserver.callback([{ isIntersecting: true }]); assert.equal(timers.size, 1);
assert.equal(timers.get(auto.timer).delay, 5000);
auto.syncAutoplay(); auto.syncAutoplay(); assert.equal(timers.size, 1, 'only one timer');
let scheduled = timers.get(auto.timer); timers.delete(auto.timer); scheduled.callback(); assert.equal(auto.active, 0); assert.equal(timers.size, 1);
auto.emit('pointerdown'); assert.equal(timers.size, 0); document.emit('pointerup'); assert.equal(timers.size, 1);
document.hidden = true; document.emit('visibilitychange'); assert.equal(timers.size, 0);
document.hidden = false; document.emit('visibilitychange'); assert.equal(timers.size, 1);
document.emit('shopify:block:select', { detail: { blockId: 'image-2' } }); assert.equal(auto.active, 2); assert.equal(timers.size, 0);
document.emit('shopify:block:deselect', { detail: { blockId: 'image-2' } }); assert.equal(timers.size, 1);
auto.autoplayButton.emit('click'); assert.equal(timers.size, 0); assert.equal(auto.autoplayButton.attributes.get('aria-label'), 'Play');
auto.autoplayButton.emit('click'); assert.equal(timers.size, 1);
auto.reducedQuery.matches = true; auto.reducedQuery.emit('change'); assert.equal(timers.size, 0);
auto.reducedQuery.matches = false; auto.reducedQuery.emit('change'); assert.equal(timers.size, 1);
auto.keyboardFocus = true; auto.syncAutoplay(); assert.equal(timers.size, 0);
auto.keyboardFocus = false; auto.mobileQuery.matches = false; auto.mobileQuery.emit('change'); assert.equal(timers.size, 0, 'desktop must not rotate');
auto.mobileQuery.matches = true; auto.mobileQuery.emit('change'); assert.equal(timers.size, 1);
auto.visibilityObserver.callback([{ isIntersecting: false }]); assert.equal(timers.size, 0);
auto.visibilityObserver.callback([{ isIntersecting: true }]); assert.equal(timers.size, 1);
auto.disconnectedCallback(); assert.equal(timers.size, 0); assert(auto.observer.disconnected && auto.visibilityObserver.disconnected);
assert([...document.events.values()].every((listeners) => listeners.size === 0), 'document listeners leaked');
const desktop = create(1440, 5);
desktop.select(0); desktop.stage.emit('pointerleave');
assert.equal(desktop.active, 0, 'entering the overlaid controls must keep the selected card');
desktop.emit('pointerleave'); assert.equal(desktop.active, null);
desktop.disconnectedCallback();
console.log(`Schema and ${scenarios} geometry scenarios passed, including cyclic edge coverage, two-image fill, focus effects, height stability and autoplay lifecycle.`);
