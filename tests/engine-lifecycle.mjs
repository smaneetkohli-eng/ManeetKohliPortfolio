// Built-in Node only. Execute the production controllers with instrumented
// renderers; these checks cover lifecycle races, not browser visual fidelity.
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import test from 'node:test';

const source = readFileSync(new URL('../js/site.js', import.meta.url), 'utf8');
const flushPromises = () => new Promise(resolve => setImmediate(resolve));
const noop = () => {};
const classList = () => ({ add: noop, remove: noop, toggle: noop });

function eventTarget() {
  const listeners = new Map();
  return {
    listeners,
    addEventListener(type, fn) {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type).add(fn);
    },
    removeEventListener(type, fn) { listeners.get(type)?.delete(fn); },
  };
}

function harness(name, endMarker, extra = {}) {
  let now = 0, nextId = 0;
  const timers = new Map(), frames = new Map();
  const window = Object.assign(eventTarget(), { innerWidth: 1200, innerHeight: 800, devicePixelRatio: 1 });
  const document = Object.assign(eventTarget(), { importNode: node => node });
  const context = vm.createContext({
    console, window, document, PAGE_MS: 1100, touchScreen: false,
    reducedMotion: { matches: false }, performance: { now: () => now },
    setTimeout(fn, delay) { const id = ++nextId; timers.set(id, { fn, at: now + delay }); return id; },
    clearTimeout(id) { timers.delete(id); },
    requestAnimationFrame(fn) { const id = ++nextId; frames.set(id, fn); return id; },
    cancelAnimationFrame(id) { frames.delete(id); },
    ...extra,
  });
  const start = source.indexOf(`function ${name}(`);
  const end = source.indexOf(endMarker, start);
  assert.ok(start >= 0 && end > start, `Cannot locate production controller ${name}`);
  vm.runInContext(source.slice(start, end), context);
  return {
    context, frames,
    advance(ms) {
      const until = now + ms;
      while (true) {
        const due = [...timers].filter(([, t]) => t.at <= until).sort((a, b) => a[1].at - b[1].at)[0];
        if (!due) break;
        const [id, timer] = due;
        now = timer.at; timers.delete(id); timer.fn();
      }
      now = until;
    },
  };
}

function deferredMount(initialSpeed) {
  let resolve;
  const promise = new Promise(done => { resolve = done; });
  const mount = { speed: initialSpeed, setSpeed(speed) { this.speed = speed; }, setUniforms: noop };
  return { mount, mountGrain: () => promise, resolve: () => resolve(mount) };
}

function edgeFixture() {
  const pending = deferredMount(0.55);
  const host = { dataset: { edgeWave: 'bottom' }, clientWidth: 1200, clientHeight: 800 };
  const page = {
    id: 'bio', querySelector: () => null,
    querySelectorAll: selector => selector === '[data-edge-wave]' ? [host] : [],
  };
  const env = harness('makeEdgeWaves', '/* ---- About:', {
    EDGE_WAVE: { scale: 1.55, offsetX: 0, offsetY: 0.58 },
    WAVE_COLORS: [], EDGE_WAVE_SPEED: 0.55, mountGrain: pending.mountGrain,
  });
  return { ...env, ...pending, host, controller: env.context.makeEdgeWaves(page) };
}

test('cycling projects before the outgoing stop delay leaves only the current engine running', () => {
  const engines = Array.from({ length: 4 }, () => ({
    running: false, start() { this.running = true; }, stop() { this.running = false; },
  }));
  const faces = [0, 1].map(() => ({
    classList: classList(), dataset: {}, replaceChildren: noop, removeAttribute: noop, setAttribute: noop,
  }));
  const markers = ['[data-sky]', '[data-nebula]', '[data-planes]', '[data-resume]'];
  const bgs = markers.map((marker, i) => ({
    dataset: { project: String(i) }, classList: classList(),
    querySelector: selector => selector === marker || (i === 1 && selector === '[data-stars]') ? { engine: i } : null,
  }));
  const templates = engines.map((_, i) => ({ dataset: { card: String(i) }, content: {} }));
  const page = {
    dataset: {}, classList: classList(), offsetHeight: 600,
    querySelectorAll: selector => selector === '.project__bg' ? bgs : templates,
    querySelector: selector => selector === '.flip__inner' ? { style: { setProperty: noop } } :
      selector === '.flip__face--a' ? faces[0] : faces[1],
  };
  const env = harness('makeProjects', '/* =====================================================================\n   PAGER', {
    makeSky: canvas => engines[canvas.engine], makeGalaxy: canvas => engines[canvas.engine],
    makePlanes: canvas => engines[canvas.engine], makeResume: canvas => engines[canvas.engine],
  });
  const controller = env.context.makeProjects(page);
  controller.start();
  controller.setStep(1, 1, true);
  env.advance(1100); // Pager permits the next gesture after 1000ms.
  controller.setStep(2, 1, true);
  env.advance(1500);
  assert.deepEqual(engines.map(engine => engine.running), [false, false, true, false]);
  controller.stop();
  assert.ok(engines.every(engine => !engine.running));
});

test('a Galaxy shader resolving after stop stays paused and resumes on return', async () => {
  const pending = deferredMount(0.32);
  const canvas = { clientWidth: 100, clientHeight: 100, getContext: () => ({ setTransform: noop }) };
  const env = harness('makeGalaxy', '/* ---- Paper:', {
    NEBULA: {}, NEBULA_COLORS: [], NEBULA_SPEED: 0.32, mountGrain: pending.mountGrain,
  });
  const controller = env.context.makeGalaxy({}, canvas);
  controller.start(); controller.stop(); pending.resolve();
  await flushPromises();
  assert.equal(pending.mount.speed, 0, 'offscreen Galaxy shader started after stop');
  assert.equal(env.frames.size, 0);
  controller.start();
  assert.equal(pending.mount.speed, 0.32);
  controller.stop();
});

test('an edge shader resolving after page departure stays paused and resumes on return', async () => {
  const f = edgeFixture();
  f.controller.start(); f.controller.stop(); f.resolve();
  await flushPromises();
  assert.equal(f.mount.speed, 0, 'offscreen edge shader started after stop');
  assert.equal(f.frames.size, 0, 'late resolution restarted the reading-light loop');
  f.controller.start();
  assert.equal(f.mount.speed, 0.55);
  f.controller.stop();
});

test('an edge host hidden while its mount is pending does not animate', async () => {
  const f = edgeFixture();
  f.controller.start();
  f.host.clientWidth = f.host.clientHeight = 0; // e.g. rotation hides side waves.
  f.resolve(); await flushPromises();
  assert.equal(f.mount.speed, 0, 'hidden edge host animates after resolving');
  f.controller.stop();
});

test('edge cleanup still removes its RAF and listeners after Reduce Motion is enabled', async () => {
  const f = edgeFixture();
  f.controller.start(); f.resolve(); await flushPromises();
  assert.ok(f.frames.size > 0, 'fixture must have an active reading-light loop');
  assert.equal(f.context.window.listeners.get('pointermove')?.size, 1);
  f.context.reducedMotion.matches = true;
  f.controller.stop();
  assert.equal(f.frames.size, 0, 'Reduce Motion blocked RAF cleanup');
  assert.equal(f.context.window.listeners.get('pointermove')?.size, 0);
  assert.equal(f.context.document.listeners.get('pointerleave')?.size, 0);
  assert.equal(f.mount.speed, 0);
});
