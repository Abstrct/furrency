/* DOM helpers: a tiny element builder, focus keeping for live repaints, comic pop-up signs
 * (toasts) and a yes/no panel. Every word shown passes through speak(): plain words only. */
import { speak, tag } from '../lore';

type Kind = '' | 'player' | 'enemy' | 'warn';
type Props = Record<string, unknown>;
type Child = Node | string | number | null | undefined | false | Child[];

/* Handlers live in a table on the element behind one dispatcher per event type, so a live repaint
 * can hand an element that stays on the page the handlers of the copy that replaced it (stable()). */
type Handlers = Record<string, EventListener>;
const ON = Symbol('on');
function dispatch(this: HTMLElement, e: Event) { (this as unknown as { [ON]?: Handlers })[ON]?.[e.type]?.call(this, e); }
function listen(el: Element, type: string, fn: EventListener) {
  const box = el as unknown as { [ON]?: Handlers };
  if (!box[ON]) box[ON] = {};
  if (!box[ON][type]) el.addEventListener(type, dispatch);
  box[ON][type] = fn;
}

export function h<K extends keyof HTMLElementTagNameMap>(tag: K, props?: Props | null, ...children: Child[]): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(props || {})) {
    if (v == null || v === false) continue;
    if (k.startsWith('on') && typeof v === 'function') listen(el, k.slice(2).toLowerCase(), v as EventListener);
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

/** Repaint `box` from `fill` without a flicker. `fill` draws into a detached copy; nothing happens if
 * the copy matches, and otherwise the page's own elements are patched to match it: text, attributes
 * and handlers change in place and only what is new is added. Nothing that stays is rebuilt, so
 * entrance animations don't replay, hover and pressed states hold, and a click never lands on a
 * button swapped out from under it. */
export function stable<T extends HTMLElement>(box: T, fill: (b: T) => void) {
  const tmp = box.cloneNode(false) as T;
  fill(tmp);
  if (tmp.innerHTML === box.innerHTML && tmp.className === box.className && tmp.hidden === box.hidden && tmp.getAttribute('style') === box.getAttribute('style')) { carry(tmp, box); return; }
  patchAttrs(box, tmp);
  box.hidden = tmp.hidden;
  patchKids(box, tmp);
}

/** Same markup, new closures: the handlers still need to point at this paint's state. */
function carry(from: Node, to: Node) {
  if (from.nodeType !== 1) return;
  const f = from as unknown as { [ON]?: Handlers }, t = to as unknown as { [ON]?: Handlers };
  if (f[ON]) for (const [type, fn] of Object.entries(f[ON])) listen(to as Element, type, fn);
  else if (t[ON]) for (const type of Object.keys(t[ON])) delete t[ON][type];
  const a = from.childNodes, b = to.childNodes;
  for (let i = 0; i < a.length && i < b.length; i++) carry(a[i], b[i]);
}

function patchAttrs(el: Element, next: Element) {
  for (const { name } of [...el.attributes]) if (!next.hasAttribute(name)) el.removeAttribute(name);
  for (const { name, value } of [...next.attributes]) if (el.getAttribute(name) !== value) el.setAttribute(name, value);
  const n = next as unknown as { [ON]?: Handlers }, o = el as unknown as { [ON]?: Handlers };
  if (o[ON]) for (const type of Object.keys(o[ON])) if (!n[ON]?.[type]) delete o[ON][type];
  if (n[ON]) for (const [type, fn] of Object.entries(n[ON])) listen(el, type, fn);
}

/** Can `old` be kept and patched into `next`? Same kind of node; drawn art (portraits, glyphs) only if it is the same art. */
function same(old: Node, next: Node): boolean {
  if (old.nodeType !== next.nodeType || old.nodeName !== next.nodeName) return false;
  if (old.nodeType !== 1) return true;
  const o = old as Element, n = next as Element;
  if (o.nodeName === 'CANVAS') return o.getAttribute('data-sig') != null && o.getAttribute('data-sig') === n.getAttribute('data-sig');
  if (o.namespaceURI !== n.namespaceURI) return false;
  if (o.namespaceURI === 'http://www.w3.org/2000/svg') return o.outerHTML === n.outerHTML;
  // a field keeps what the player typed: only the same kind of field is kept
  if (o.nodeName === 'INPUT') return (o as HTMLInputElement).type === (n as HTMLInputElement).type;
  return true;
}

function patchKids(el: Node, next: Node) {
  const want = [...next.childNodes];
  for (let i = 0; i < want.length; i++) {
    const cur = el.childNodes[i], nw = want[i];
    if (!cur) { el.appendChild(nw); continue; }
    if (!same(cur, nw)) { el.replaceChild(nw, cur); continue; }
    if (cur.nodeType === 3 || cur.nodeType === 8) { if (cur.nodeValue !== nw.nodeValue) cur.nodeValue = nw.nodeValue; continue; }
    const c = cur as Element, n = nw as Element;
    if (c.nodeName === 'CANVAS' || c.namespaceURI === 'http://www.w3.org/2000/svg') continue;   // same art: leave it be
    if (c.nodeName === 'INPUT' || c.nodeName === 'TEXTAREA' || c.nodeName === 'SELECT') {
      const v = (c as HTMLInputElement).value;
      patchAttrs(c, n);
      (c as HTMLInputElement).value = v;
      if ((c as HTMLInputElement).checked !== (n as HTMLInputElement).checked) (c as HTMLInputElement).checked = (n as HTMLInputElement).checked;
      if ((c as HTMLInputElement).disabled !== (n as HTMLInputElement).disabled) (c as HTMLInputElement).disabled = (n as HTMLInputElement).disabled;
      continue;
    }
    patchAttrs(c, n);
    // properties that don't live in attributes
    if ((c as HTMLElement).hidden !== (n as HTMLElement).hidden) (c as HTMLElement).hidden = (n as HTMLElement).hidden;
    if (c instanceof HTMLButtonElement && c.disabled !== (n as HTMLButtonElement).disabled) c.disabled = (n as HTMLButtonElement).disabled;
    patchKids(c, n);
  }
  while (el.childNodes.length > want.length) el.removeChild(el.lastChild!);
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
