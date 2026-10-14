/* DOM helpers: a tiny element builder, focus keeping for live repaints, comic pop-up signs
 * (toasts) and a yes/no panel. Every word shown passes through speak(): plain words only. */
import { speak, tag } from '../lore';

type Kind = '' | 'player' | 'enemy' | 'warn';
type Props = Record<string, unknown>;
type Child = Node | string | number | null | undefined | false | Child[];

export function h<K extends keyof HTMLElementTagNameMap>(tag: K, props?: Props | null, ...children: Child[]): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(props || {})) {
    if (v == null || v === false) continue;
    if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v as EventListener);
    else if (k === 'style' && typeof v === 'object') for (const [sk, sv] of Object.entries(v as Record<string, string>)) { if (sk.startsWith('--')) el.style.setProperty(sk, String(sv)); else (el.style as unknown as Record<string, string>)[sk] = sv; }
    else if (k === 'class') el.className = String(v);
    else if (k === 'html') el.innerHTML = String(v);
    else if (k in el && k !== 'list' && k !== 'form') (el as unknown as Record<string, unknown>)[k] = v;
    else el.setAttribute(k, v === true ? '' : String(v));
  }
  const add = (c: Child) => {
    if (c == null || c === false) return;
    if (Array.isArray(c)) c.forEach(add);
    else el.append(c instanceof Node ? c : String(c));
  };
  children.forEach(add);
  return el;
}

/** An SVG element from markup we wrote ourselves (icons, art). */
export function svg(markup: string, cls = ''): SVGSVGElement {
  const t = document.createElement('template');
  t.innerHTML = markup.trim();
  const el = t.content.firstElementChild as SVGSVGElement;
  if (cls) el.setAttribute('class', cls);
  return el;
}

export function clear(el: Element) { while (el.firstChild) el.removeChild(el.firstChild); }

/** Rebuild `box` only when what it shows changed: a live repaint never swaps a button out from under a
 * click. `fill` draws into a detached copy; the copy replaces the content only if its markup differs. */
export function stable<T extends HTMLElement>(box: T, fill: (b: T) => void) {
  const tmp = box.cloneNode(false) as T;
  fill(tmp);
  if (tmp.innerHTML === box.innerHTML && tmp.className === box.className && tmp.hidden === box.hidden && tmp.getAttribute('style') === box.getAttribute('style')) return;
  box.replaceChildren(...Array.from(tmp.childNodes));
  box.className = tmp.className; box.hidden = tmp.hidden;
  const st = tmp.getAttribute('style'); if (st == null) box.removeAttribute('style'); else box.setAttribute('style', st);
}

/** Rebuild `box` without throwing away keyboard focus: the control that had it (known by data-key,
 * aria-label or its words) gets it back. */
export function keepFocus(box: Element, rebuild: () => void) {
  const id = (e: Element) => ((e as HTMLElement).dataset?.key || e.getAttribute('aria-label') || e.textContent || '').trim();
  const a = document.activeElement;
  const had = a && a !== document.body && box.contains(a) && !(a instanceof HTMLInputElement || a instanceof HTMLTextAreaElement) ? id(a) : null;
  rebuild();
  if (had == null || (document.activeElement && box.contains(document.activeElement))) return;
  const back = [...box.querySelectorAll('button, a[href], summary, select, [tabindex]')].find((e) => id(e) === had) as HTMLElement | undefined;
  back?.focus({ preventScroll: true });
}

function tray(): HTMLElement {
  let t = document.getElementById('signs');
  if (!t) { t = h('div', { id: 'signs', role: 'status', 'aria-live': 'polite' }); document.body.append(t); }
  return t;
}

const signs = new Map<string, { el: HTMLElement; n: number; timer: ReturnType<typeof setTimeout> }>();
let tilt = 0;

/** A comic sign that pops up and away. Long text becomes a short sign; the long words wait in its title. */
export function toast(text: string, kind: Kind = '', ms = 3600, action?: { label: string; run: () => void }) {
  const said = speak(text);
  const key = kind + '|' + said, same = signs.get(key);
  const retire = (el: HTMLElement) => setTimeout(() => { el.classList.remove('on'); signs.delete(key); setTimeout(() => el.remove(), 400); }, ms);
  if (same && same.el.isConnected) {
    same.n++; clearTimeout(same.timer); same.timer = retire(same.el);
    let badge = same.el.querySelector('.sign-n');
    if (!badge) { badge = h('b', { class: 'sign-n' }); same.el.prepend(badge); }
    badge.textContent = '×' + same.n;
    return;
  }
  tilt = (tilt + 1) % 3;
  const el = h('div', { class: `sign ${kind} t${tilt}`, title: said !== text ? text : null },
    h('span', { class: 'sign-t' }, said),
    action ? h('button', { type: 'button', class: 'sign-b', onclick: () => { action.run(); el.remove(); signs.delete(key); } }, speak(action.label)) : null);
  const t = tray(); t.append(el);
  while (t.children.length > 4) t.firstElementChild?.remove();
  requestAnimationFrame(() => el.classList.add('on'));
  signs.set(key, { el, n: 1, timer: retire(el) });
}

/** Ask yes or no. `stay` names the safe answer (NO unless given). With `safeFirst` the safe answer is
 * the bright one. With `ok` null the panel only tells. Escape always answers safe. */
export function confirmBox(title: string, text: string | string[], ok: string | null = 'YES', tone: 'player' | 'enemy' = 'enemy', o: { stay?: string; safeFirst?: boolean } = {}): Promise<boolean> {
  return new Promise((resolve) => {
    const done = (v: boolean) => { veil.remove(); document.removeEventListener('keydown', esc); opener?.focus?.({ preventScroll: true }); resolve(v); };
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') done(false); };
    const opener = document.activeElement as HTMLElement | null;
    const bright = !!o.safeFirst || ok == null;
    const stay = h('button', { type: 'button', class: bright ? 'cbtn yellow' : 'cbtn paper', 'data-dismiss': '', onclick: () => done(false) }, speak(o.stay || 'NO'));
    const go = ok == null ? null : h('button', { type: 'button', class: bright ? 'cbtn paper' : `cbtn ${tone === 'enemy' ? 'pink' : 'yellow'}`, onclick: () => done(true) }, speak(ok));
    const veil = h('div', { class: 'veil', onclick: (e: Event) => { if (e.target === veil) done(false); } },
      h('section', { class: 'panel ask', role: 'dialog', 'aria-modal': 'true', 'aria-label': speak(title) },
        h('h2', { class: 'ask-h' }, speak(title)),
        h('ul', { class: 'ask-l' }, ...(Array.isArray(text) ? text : [text]).map((t) => h('li', null, speak(t)))),
        h('div', { class: 'row end' }, ...(bright ? [go, stay] : [stay, go]))));
    document.body.append(veil);
    document.addEventListener('keydown', esc);
    (bright ? stay : (go || stay)).focus({ preventScroll: true });
  });
}

/** Make a veil behave as a modal for the keyboard: focus moves in (to `first`, else its first control),
 * Tab stays inside, and when the veil leaves the page, focus returns to whatever opened it. */
export function modal(veil: HTMLElement, first?: () => HTMLElement | null) {
  const opener = document.activeElement as HTMLElement | null;
  const focusables = () => [...veil.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], input:not(:disabled), textarea, select, summary, [tabindex]:not([tabindex="-1"])')].filter((e) => e.offsetParent !== null);
  const into = () => { const f = (first && first()) || focusables().find((e) => !e.classList.contains('x')) || focusables()[0]; f?.focus({ preventScroll: true }); };
  setTimeout(into, 40);
  veil.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const list = focusables(); if (!list.length) return;
    const i = list.indexOf(document.activeElement as HTMLElement);
    if (e.shiftKey && (i <= 0)) { e.preventDefault(); list[list.length - 1].focus(); }
    else if (!e.shiftKey && (i === list.length - 1 || i < 0)) { e.preventDefault(); list[0].focus(); }
  });
  // a dialog that repaints its insides keeps the focus inside it
  new MutationObserver(() => { if (veil.isConnected && !veil.contains(document.activeElement)) into(); }).observe(veil, { childList: true, subtree: true });
  const gone = new MutationObserver(() => {
    if (veil.isConnected) return;
    gone.disconnect();
    if (opener && opener.isConnected && (!document.activeElement || document.activeElement === document.body)) opener.focus({ preventScroll: true });
  });
  gone.observe(veil.parentElement || document.body, { childList: true });
}

/** A refusal as its short sign, with the long words kept for a hover. */
export function refusal(err: string | null | undefined): HTMLElement {
  return h('span', { class: 'refusal', title: err || '' }, tag(err));
}
