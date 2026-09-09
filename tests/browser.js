const frame = document.querySelector('iframe');
const results = document.querySelector('#results');
const wait = ms => new Promise(r => setTimeout(r, ms));
let w, d, run = 0;
const assert = (value, message) => { if (!value) throw new Error(message); };
async function check(name, fn) {
  const li = results.appendChild(document.createElement('li'));
  try { await fn(); li.className = 'pass'; li.textContent = `PASS: ${name}`; }
  catch (e) { li.className = 'fail'; li.textContent = `FAIL: ${name}: ${e.message}`; }
}
async function load(hash = 'hero', failed = false) {
  frame.src = `/?run=${++run}${failed === true ? '&shader=fail' : failed ? '&' + failed : ''}#${hash}`;
  await new Promise(r => frame.onload = r);
  w = frame.contentWindow; d = w.document;
  for (let i = 0; i < 100 && !w.__pager; i++) await wait(50);
  await wait(1500);
}
async function go(id) { w.__pager.goTo(id); await wait(1600); }
function wheel(target, props = {}) {
  const e = new w.WheelEvent('wheel', {deltaY:100, bubbles:true, cancelable:true, ...props});
  target.dispatchEvent(e); return e;
}
function key(target, key, props = {}) {
  target.focus();
  const e = new w.KeyboardEvent('keydown', {key, bubbles:true, cancelable:true, ...props});
  target.dispatchEvent(e); return e;
}
if (!location.search.includes('phase=motion')) {
await load();
await check('Inactive pages excluded from keyboard and accessibility navigation', () => {
  assert([...d.querySelectorAll('.page:not(.is-active)')].every(e => e.inert), 'inactive pages are not inert');
});
await check('Hidden dock panels excluded from keyboard navigation', () => {
  assert([...d.querySelectorAll('.dock__panel:not(.is-on)')].every(e => e.inert), 'hidden menu links can receive focus');
});
await check('Hidden one-step dots and inactive prompts excluded from focus', () => {
  assert(d.querySelector('#dots').inert && d.querySelector('.projects-status').inert, 'hidden chrome can receive focus');
});
await go('bio');
await check('Desktop wheel escapes Hello there despite decorative overflow', async () => {
  wheel(d.querySelector('.bio__line')); await wait(1500);
  assert(w.__pager.index === 2, `still on page ${w.__pager.index}`);
});
await go('hero');
await check('Ctrl-wheel preserves browser zoom', () => {
  assert(!wheel(d.body, {ctrlKey:true}).defaultPrevented, 'zoom gesture prevented');
});
await wait(1600); await go('hero');
await check('Mostly horizontal wheel gestures do not page', async () => {
  wheel(d.body, {deltaX:200,deltaY:15}); await wait(1500);
  assert(w.__pager.index === 0, 'horizontal gesture changed page');
});
await go('hero');
await check('Space preserves native button activation', () => {
  const e = key(d.querySelector('[data-open="about"]'), ' ');
  assert(!e.defaultPrevented, 'Space hijacked by pager');
});
await wait(1600);
await check('Changing a hash after load navigates to its page and step', async () => {
  w.location.hash = 'people'; await wait(1700);
  assert(w.__pager.index === 3 && w.__pager.step === 2, 'hash and visible page disagree');
});
await go('youtube');
await check('Back of project card excluded from keyboard navigation', () => {
  assert([...d.querySelectorAll('.flip__face')].filter(e => e.inert).length === 1, 'both faces exposed');
});
await go('hero');
await check('Every page and project/About step is reachable forward and backward', async () => {
  const route = ['hero','bio','youtube','bani-ai','regal','resume-agent','vision','me','people','contact'];
  for (const expected of route.slice(1)) {
    wheel(d.body); await wait(1250);
    assert(w.location.hash === '#' + expected, `forward expected ${expected}, got ${w.location.hash}`);
  }
  for (const expected of route.slice(0,-1).reverse()) {
    wheel(d.body, {deltaY:-100}); await wait(1250);
    assert(w.location.hash === '#' + expected, `backward expected ${expected}, got ${w.location.hash}`);
  }
});
frame.style.width = '390px'; frame.style.height = '480px';
await load('bio');
d.querySelector('.bio__statement').style.fontSize = '22px'; // browser text enlargement
await check('ArrowDown reads overflowing text before turning the page', async () => {
  const s = d.querySelector('#bio [data-scroll]');
  assert(s.scrollHeight > s.clientHeight, 'fixture must overflow');
  key(d.body, 'ArrowDown'); await wait(1500);
  assert(w.__pager.index === 1 && s.scrollTop > 0, 'keyboard skipped unread text');
});
await go('bio');
await check('A sideways touch start does not skip unread text', async () => {
  const s = d.querySelector('#bio [data-scroll]'); s.scrollTop = 0;
  const send = (type, x, y) => {
    const e = new w.Event(type, {bubbles:true, cancelable:true});
    const point = {clientX:x, clientY:y};
    Object.defineProperties(e, {touches:{value:type === 'touchend' ? [] : [point]}, changedTouches:{value:[point]}});
    s.dispatchEvent(e);
  };
  send('touchstart', 150, 300); send('touchmove', 152, 300);
  send('touchmove', 152, 200); send('touchend', 152, 200);
  await wait(1500);
  assert(w.__pager.index === 1, 'initial horizontal jitter caused page turn');
});
await go('bio');
await check('Resize preserves position in a long text page', async () => {
  const s = d.querySelector('#bio [data-scroll]'); s.scrollTop = 60;
  const before = s.scrollTop; assert(before > 0, 'fixture must be scrollable');
  w.dispatchEvent(new w.Event('resize')); await wait(300);
  assert(s.scrollTop === before, `reading position reset to ${s.scrollTop}`);
});
await check('Wheel outside text column does not get trapped by unrelated scroll range', async () => {
  const s = d.querySelector('#bio [data-scroll]'); s.scrollTop = 0;
  wheel(d.querySelector('.dock')); await wait(1500);
  assert(w.__pager.index === 2, 'wheel outside scroller was swallowed');
});
await go('vision');
await check('About steps start at the top of their new copy', async () => {
  d.querySelector('#about [data-scroll]').scrollTop = 70;
  await go('me');
  assert(d.querySelector('#about [data-scroll]').scrollTop === 0, 'new step inherited old reading position');
});
await check('Only the current About article is exposed to assistive technology', () => {
  assert(d.querySelectorAll('.about__block[inert]').length === 2, 'hidden About articles still exposed');
});
await load('hero', true);
await check('Navigation survives shader CDN failure', async () => {
  assert(w.__pager, 'entire pager failed to initialize');
  await go('bio'); wheel(d.querySelector('.bio__line')); await wait(1500);
  assert(w.__pager.index === 2, 'navigation failed without shaders');
});
}
frame.style.width = '1024px'; frame.style.height = '390px';
for (const id of ['bio','vision','contact']) {
  await load(id);
  await check(`Short desktop ${id} keeps all copy reachable below the dock`, () => {
    const s = d.querySelector('.page.is-active [data-scroll]');
    assert(/auto|scroll/.test(w.getComputedStyle(s).overflowY) && s.clientHeight <= 390, 'text is clipped in an unscrollable viewport');
    const content = id === 'bio' ? d.querySelector('.bio__statement') : id === 'vision' ? d.querySelector('.about__block.is-current') : d.querySelector('.contact__top');
    assert(content.getBoundingClientRect().top >= d.querySelector('.dock').getBoundingClientRect().bottom, 'copy begins underneath dock');
    s.scrollTop = s.scrollHeight;
    const last = id === 'contact' ? d.querySelector('.contact__ai') : content;
    assert(last.getBoundingClientRect().bottom <= 391, 'last content cannot be scrolled into view');
  });
}
frame.style.width = '320px'; frame.style.height = '568px';
await load('hero');
await check('Small phone navigation has no overlapping controls', () => {
  const sig = d.querySelector('.dock__sig').getBoundingClientRect();
  const nav = d.querySelector('.dock__panel[data-panel="main"]').getBoundingClientRect();
  const contact = d.querySelector('.dock__cta').getBoundingClientRect();
  assert(sig.right <= nav.left && nav.right <= contact.left, `overlap: signature ends ${sig.right}, nav ${nav.left}-${nav.right}, Contact starts ${contact.left}`);
});
frame.style.width = '390px'; frame.style.height = '844px';
await load('bio');
await check('Phone page transition uses a visible interpolated slide', async () => {
  w.__pager.goTo('youtube'); await wait(350);
  const css = w.getComputedStyle(d.querySelector('#projects'));
  assert(css.maskImage === 'none', 'mobile page still depends on animated masks');
  const y = new w.DOMMatrix(css.transform).m42;
  assert(y > 0 && y < frame.clientHeight, `no intermediate slide: ${y}`);
  await wait(1300);
});
await load('hero', 'motion=reduce');
await check('Reduced Motion disables the projects page transition too', async () => {
  await go('bio');
  assert(w.getComputedStyle(d.querySelector('#projects')).transitionDuration.split(',').every(t => parseFloat(t) === 0), 'projects overrides reduced-motion CSS');
});
await check('Reduced Motion navigation has no invisible animation lock', () => {
  w.__pager.next(); w.__pager.next();
  assert(w.__pager.index === 2 && w.__pager.step === 1, 'navigation waits for an animation that is disabled');
});
await load('hero', 'motion=reduce');
await check('Reduced Motion still treats a wheel momentum burst as one gesture', async () => {
  // One burst, without timer gaps that background-tab throttling can turn
  // into fresh gestures (>140ms) during browser automation.
  wheel(d.body, {deltaY:100});
  wheel(d.body, {deltaY:80});
  wheel(d.body, {deltaY:60});
  assert(w.__pager.index === 1, `single gesture skipped to page ${w.__pager.index}`);
});
document.body.dataset.done = 'true';
document.title = `${results.querySelectorAll('.fail').length} failures — Portfolio regressions`;
