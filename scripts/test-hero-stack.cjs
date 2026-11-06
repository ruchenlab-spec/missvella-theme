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
assert.equal(schema.settings.find((s) => s.id === 'desktop_autoplay').default, false);
assert.equal(schema.settings.find((s) => s.id === 'inactive_effect').default, 'dim');
for (const id of ['title', 'subtitle', 'text']) assert(schema.blocks[0].settings.some((s) => s.id === id));
for (const id of ['subtitle', 'heading', 'description', 'heading_size', 'header_subtitle_size', 'description_size', 'header_alignment', 'header_text_color']) {
  assert(schema.settings.some((s) => s.id === id), `section-level copy control missing: ${id}`);
}

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
  animate(frames, options) {
    return { frames, options, playState: 'running',
      pause() { this.playState = 'paused'; }, play() { this.playState = 'running'; }, cancel() { this.playState = 'idle'; } };
  }
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
const timers = new Map(); let timerId = 0; let Stack; let viewport = 320; let now = 0;
const context = {
  HTMLElement: Element, AbortController: Abort, ResizeObserver: Observer, IntersectionObserver: Observer, document,
  customElements: { get() {}, define(name, Class) { Stack = Class; } },
  matchMedia(query) { const media = new Element(); media.matches = query.includes('768px') ? viewport <= 768 : false; return media; },
  getComputedStyle(element) { return { direction: 'ltr', getPropertyValue(key) {
    return key === '--mv-stack-height-mobile' ? '400px' : element.heightMode === 'auto' ? 'auto' : `${element.heightMode}px`;
  } }; },
  setTimeout(callback, delay) { timers.set(++timerId, { callback, delay }); return timerId; },
  clearTimeout(id) { timers.delete(id); }, requestAnimationFrame() { return 1; }, cancelAnimationFrame() {}, queueMicrotask,
  performance: { now: () => now },
};
vm.runInNewContext(read('theme/assets/hero-stacked-slideshow.js'), context);
function create(width, count, mode = 640, scale = 100, autoplay = false, desktopAutoplay = false) {
  viewport = width;
  const stack = new Stack(); stack.heightMode = mode;
  stack.dataset = { primaryWidth: scale, mobileAutoplay: String(autoplay), desktopAutoplay: String(desktopAutoplay), autoplaySpeed: 5000 };
  const stage = new Element(); stage.dataset.stackStage = ''; stage.clientWidth = width; stack.append(stage);
  for (let index = 0; index < count; index++) {
    const card = new Element(); card.dataset = { stackCard: '', blockId: `image-${index}`, ratio: [0.5, 1.8, 0.75, 3, 0.35][index % 5], imageWidth: 1200 };
    card.dataset.mobileRatio = card.dataset.ratio; card.dataset.primary = String(index === count - 1);
    const image = new Element('img'); image.className = 'mv-hero-stack__image'; card.append(image);
    const caption = new Element(); caption.dataset.stackCaption = ''; caption.append(new Element('a')); card.append(caption); stage.append(card);
  }
  const counter = new Element(); counter.dataset.stackCounter = ''; stack.append(counter);
  const button = new Element('button'); button.dataset = { stackAutoplay: '', labelPlay: 'Play', labelPause: 'Pause' }; stack.append(button);
  const ring = new Element('circle'); ring.dataset.stackProgress = ''; button.append(ring);
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
    const expected = stack.stacked && index !== selected
      ? (stack.width - stack.widths[selected]) / (stack.cards.length - 1) : stack.widths[index];
    assert.equal(value(card, '--mv-card-width'), expected, 'nonfocused viewports must share the remainder equally');
    assert.equal(value(card, '--mv-image-width'), stack.widths[index], 'viewport changes must not resize the image');
    assert.equal(value(card, '--mv-card-height'), stack.heights[index], 'focus must not resize any image');
    if (!stack.stacked) assert.equal(value(card, '--mv-card-x'), stack.base[index]);
  });
  assert.equal(stack.stage.children.length, stack.cards.length, 'duplicate imagery in stage');
  const spans = stack.cards.map((card, index) => [
    value(card, '--mv-card-x') + value(card, '--mv-card-clip-left'),
    value(card, '--mv-card-x') + value(card, '--mv-card-width') - value(card, '--mv-card-clip-right'), index,
  ]).sort((a, b) => a[0] - b[0]);
  assert(spans.every(([left, right]) => right > left), JSON.stringify({ width: stack.width, count: stack.cards.length, selected, spans }));
  if (stack.stacked) {
    assert(Math.abs(spans[0][0]) < 1e-7, 'left edge unfilled');
    assert(Math.abs(spans.at(-1)[1] - stack.width) < 1e-7, 'right edge unfilled');
    for (let i = 1; i < spans.length; i++) assert(Math.abs(spans[i][0] - spans[i - 1][1]) < 1e-7, 'gap or repeat between unique images');
    const expected = (stack.width - stack.widths[selected]) / (stack.cards.length - 1);
    for (const [left, right, index] of spans) {
      if (index !== selected) assert(Math.abs(right - left - expected) < 1e-7, 'unequal inactive display widths');
    }
    assert.deepEqual(spans.map((span) => span[2]), stack.cards.map((_, index) => index), 'every focus must preserve image order');
    if (selected === 0) assert.equal(start, 0, 'first focus must align left');
    if (selected === stack.cards.length - 1) assert.equal(end, stack.width, 'last focus must align right');
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
const firstTimer = auto.timer;
auto.syncAutoplay(); auto.syncAutoplay(); assert.equal(auto.timer, firstTimer, 'unrelated updates must not reset countdown');
assert.equal(auto.progressAnimation.options.duration, 5000);
let scheduled = timers.get(auto.timer); now += scheduled.delay; timers.delete(auto.timer); scheduled.callback(); assert.equal(auto.active, 0); assert.equal(timers.size, 1);
now += 2000; auto.emit('pointerdown'); assert.equal(timers.size, 0); assert.equal(auto.remaining, 3000);
assert.equal(auto.progressAnimation.playState, 'paused');
document.emit('pointerup'); assert.equal(timers.size, 1); assert.equal(timers.get(auto.timer).delay, 3000);
assert.equal(auto.progressAnimation.playState, 'running');
document.hidden = true; document.emit('visibilitychange'); assert.equal(timers.size, 0);
document.hidden = false; document.emit('visibilitychange'); assert.equal(timers.size, 1);
document.emit('shopify:block:select', { detail: { blockId: 'image-2' } }); assert.equal(auto.active, 2); assert.equal(timers.size, 0);
document.emit('shopify:block:deselect', { detail: { blockId: 'image-2' } }); assert.equal(timers.size, 1);
auto.autoplayButton.emit('click'); assert.equal(timers.size, 0); assert.equal(auto.autoplayButton.attributes.get('aria-label'), 'Play');
auto.autoplayButton.emit('click'); assert.equal(timers.size, 1);
auto.reducedQuery.matches = true; auto.reducedQuery.emit('change'); assert.equal(timers.size, 0);
auto.reducedQuery.matches = false; auto.reducedQuery.emit('change'); assert.equal(timers.size, 1);
auto.keyboardFocus = true; auto.syncAutoplay(); assert.equal(timers.size, 0);
auto.keyboardFocus = false; auto.mobileQuery.matches = false; auto.mobileQuery.emit('change'); assert.equal(timers.size, 0, 'desktop autoplay is independently configurable');
auto.dataset.desktopAutoplay = 'true'; auto.syncAutoplay(); assert.equal(timers.size, 1);
auto.emit('pointerenter', { pointerType: 'mouse' }); assert.equal(timers.size, 0, 'desktop hover pauses countdown');
const focused = auto.active; auto.emit('pointerleave'); assert.equal(auto.active, focused); assert.equal(timers.size, 1);
auto.autoplayButton.focusVisible = true; auto.emit('focusin', { target: auto.autoplayButton });
assert.equal(auto.keyboardFocus, false, 'play button remains operable with keyboard');
auto.mobileQuery.matches = true; auto.mobileQuery.emit('change'); assert.equal(timers.size, 1);
auto.visibilityObserver.callback([{ isIntersecting: false }]); assert.equal(timers.size, 0);
auto.visibilityObserver.callback([{ isIntersecting: true }]); assert.equal(timers.size, 1);
auto.disconnectedCallback(); assert.equal(timers.size, 0); assert(auto.observer.disconnected && auto.visibilityObserver.disconnected);
assert.equal(auto.progressAnimation.playState, 'idle');
assert([...document.events.values()].every((listeners) => listeners.size === 0), 'document listeners leaked');
const desktop = create(1440, 5);
desktop.select(0); desktop.stage.emit('pointerleave');
assert.equal(desktop.active, 0, 'entering the overlaid controls must keep the selected card');
desktop.emit('pointerleave'); assert.equal(desktop.active, null);
desktop.disconnectedCallback();
const desktopAuto = create(1440, 5, 640, 100, false, true);
desktopAuto.visibilityObserver.callback([{ isIntersecting: true }]); assert.equal(timers.size, 1);
desktopAuto.disconnectedCallback(); assert.equal(timers.size, 0);
// Screenshot regression: the fourth of five portrait images is primary.
const portrait = create(2037, 5);
portrait.cards.forEach((card) => { card.dataset.ratio = 0.75; card.dataset.mobileRatio = 0.75; });
portrait.primary = 3; portrait.measure(); verify(portrait);
assert.equal(value(portrait.cards[4], '--mv-image-width'), 480, 'fifth image must retain its original width');
assert.equal(value(portrait.cards[4], '--mv-card-width'), (2037 - 480) / 4);
assert.equal(value(portrait.cards[4], '--mv-card-height'), 640);
for (const scale of [20, 55, 100]) {
  portrait.dataset.primaryWidth = scale; portrait.measure();
  for (let index = 0; index < 5; index++) { portrait.select(index); verify(portrait); }
}
portrait.disconnectedCallback();
console.log(`Schema and ${scenarios} equal-width scenarios passed, including exact remainder division, fixed image size, fourth-primary regression, edge alignment and countdown pause/resume.`);
