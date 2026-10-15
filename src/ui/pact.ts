/* The Pact: make a paw (the wallet), keep its words, join a clan (guild signup through the clan's
 * signer) and find a den (MsgPlanetExplore) — and, once sworn, the paw itself: its words, its marks,
 * and forgetting it. Keys never leave this tab. */
import { h, clear, confirmBox, toast, modal } from '../core/dom';
import { wallet } from '../wallet/wallet';
import { phraseProblem } from '../wallet/keys';
import { enlist, enlisting, retryEnlist } from '../game/enlist';
import { explore } from '../game/onboard';
import { guilds, guildsNow, DEFAULT_GUILD, type GuildEntry } from '../guild/directory';
import { clanColor, clanName, speak, tag } from '../lore';
import { glyph } from './glyphs';
import { empire } from '../game/empire';
import { txq } from '../wallet/queue';
import { claimJob, releaseClaim } from '../core/claims';
import { audio } from '../core/audio';
import { kinIcon } from './portrait';
import { pow } from '../pow/pow';
import { roster } from '../net/roster';
import { nameProblem as checkName } from '../game/names';
import { LCD_URL } from '../chain/lcd';

/** Which network this build plays: a test chain carries no money. */
const NET = (() => { try { const host = new URL(LCD_URL).hostname; return /^(127\.|localhost|\[::1\])/.test(host) ? 'DEVNET' : /test/i.test(host) ? 'TESTNET' : 'MAINNET'; } catch { return 'TESTNET'; } })();

let open: HTMLElement | null = null;

const STEPS: [string, Parameters<typeof glyph>[0]][] = [['PAW', 'paw'], ['WORDS', 'words'], ['CLAN', 'clan'], ['DEN', 'den']];
const FIRST = ['Vex', 'Nix', 'Rook', 'Kit', 'Zuri', 'Mox', 'Pip', 'Ash', 'Rue', 'Kael', 'Tash', 'Juno', 'Bram', 'Sly', 'Fen', 'Ozzy', 'Lux', 'Rix'];
const LAST = ['paw', 'tail', 'fur', 'mane', 'claw', 'whisk', 'fang', 'tuft', 'snout', 'ear', 'pelt', 'howl'];
const pick = <T>(a: T[]) => a[Math.floor(Math.random() * a.length)];
const clanOf = (id: string) => clanName(id, guildsNow()?.find((g) => g.id === id)?.meta?.name);

/** Every name already out there: the roster and the chiefs this client has read. */
const takenNames = () => [...(roster.roster?.chiefs || []).map((c) => c.name), ...[...empire.players.values()].map((p) => p.name)];
const nameProblem = (n: string) => checkName(n, takenNames());

export function openPact(start?: unknown) {
  if (open) return;
  const body = h('div');
  const veil = h('div', { class: 'veil', onclick: (e: Event) => { if (e.target === veil) close(); } },
    h('section', { class: 'panel', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'pact-title' }, body));
  open = veil;
  document.body.append(veil);
  // the bright button of each step takes the focus (ENTER DEN on the last)
  modal(veil, () => veil.querySelector<HTMLElement>('.cbtn.big, .choice:not(:disabled), input:not([type=checkbox]), .cbtn.yellow:not(:disabled)'));
  let offs: (() => unknown)[] = [];
  function close() { offs.forEach((f) => f()); if (seekClaim) releaseClaim(seekClaim); veil.remove(); open = null; document.removeEventListener('keydown', esc); window.removeEventListener('hashchange', close); }
  const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };

  type Mode = 'choose' | 'speak' | 'keep' | 'clan' | 'words' | 'pass';
  let mode: Mode = start === 'words' ? 'words' : 'choose';
  let passNext: Mode = 'words';
  let name = '';
  let clan = '';
  let clans: GuildEntry[] | null = null;
  let revealed = '';
  let revealing = false;
  let busy = false;
  let joinedHere = false;
  let ticked = false;
  let spoken = '';
  let passTyped = '';
  let err = '';
  let seekClaim = '';
  let markOpen = false;

  const head = (title: string, color = 'var(--pink)') => h('div', { class: 'dlg-head' },
    h('h2', { id: 'pact-title', style: { color } }, title),
    h('button', { type: 'button', class: 'x', 'aria-label': 'Close', onclick: close }, glyph('close', 20, '#FFF8E7')));
  // a step passed is ✓ only if it was done: WORDS put off with LATER stays open (a warning, not a tick)
  const road = (at: number) => h('ol', { class: 'steps', 'aria-label': 'Steps' },
    ...STEPS.map(([t, g], i) => {
      const skipped = i < at && t === 'WORDS' && !wallet.backedUp;
      return h('li', { class: skipped ? 'skipped' : i < at ? 'done' : i === at ? 'now' : '', 'aria-current': i === at ? 'step' : null, title: skipped ? 'WORDS NOT KEPT' : undefined },
        glyph(skipped ? 'warn' : i < at ? 'done' : g, 22, skipped ? '#FF2E88' : '#0A0612'), t);
    }));
  const errLine = () => (err ? h('p', { role: 'alert', style: { margin: '10px 0 0' } }, h('span', { class: 'refusal', title: err }, speak(err))) : '');

  async function reveal(next: Mode, passphrase?: string) {
    if (revealing) return;
    if (!wallet.deviceSealed && passphrase == null) { passNext = next; mode = 'pass'; err = ''; queueMicrotask(paint); return; }
    revealing = true;
    try { revealed = await wallet.revealPhrase(passphrase ?? ''); mode = next; err = ''; }
    catch (e) { err = (e as Error).message; }
    revealing = false; paint();
  }

  function wordsPanel(doneLabel: string, onDone: () => void, later?: () => void) {
    const kept = h('input', { type: 'checkbox', id: 'kept', checked: ticked }) as HTMLInputElement;
    const go = h('button', { type: 'button', class: 'cbtn yellow', disabled: !ticked, onclick: () => { ticked = false; wallet.markBackedUp(); onDone(); } }, doneLabel, glyph('go', 18, '#0A0612')) as HTMLButtonElement;
    kept.onchange = () => { ticked = kept.checked; go.disabled = !ticked; };
    const words = revealed.split(' ');
    return [
      h('p', { class: 'boomtxt', style: { fontSize: '24px', margin: '0' } }, `${words.length} WORDS · PAPER · SAFE`),
      h('div', { class: 'words', 'data-raw': '' }, ...words.map((w, i) => h('span', null, h('i', null, String(i + 1)), w))),
      h('p', { class: 'row', style: { margin: '4px 0', gap: '8px' } }, glyph('warn', 22, '#FF2E88'), h('span', { class: 'boomtxt', style: { fontSize: '20px', color: 'var(--pink)' } }, 'NEVER SHARE')),
      h('div', { class: 'row' },
        h('button', { type: 'button', class: 'cbtn small', onclick: () => {
          navigator.clipboard?.writeText(revealed).then(() => toast('COPIED', 'player'), () => toast('NO COPY', 'warn'));
        } }, glyph('copy', 18, '#0A0612'), 'COPY')),
      h('label', { class: 'check', for: 'kept' }, kept, h('span', null, 'KEPT')),
      h('div', { class: 'row between', style: { marginTop: '10px' } },
        later ? h('button', { type: 'button', class: 'cbtn small paper', onclick: later }, 'LATER') : h('span'),
        go),
    ];
  }

  function loadClans() {
    if (clans) return;
    guilds().then((g) => {
      clans = [...g].sort((a, b) => (b.id === DEFAULT_GUILD ? 1 : 0) - (a.id === DEFAULT_GUILD ? 1 : 0));
      if (!clan && clans.length) clan = clans[0].id;
      paint();
    }).catch(() => { clans = []; paint(); });
  }

  function clanPicker(onPick: () => void) {
    loadClans();
    if (!clans) return h('p', { class: 'boomtxt', style: { fontSize: '22px' } }, 'LISTENING…');
    if (!clans.length) return h('p', null, h('span', { class: 'refusal' }, 'NO CLAN'));
    const list = h('div', { class: 'stack', role: 'radiogroup', 'aria-label': 'Clans' });
    const draw = () => {
      clear(list);
      list.append(...clans!.map((g) => h('button', { type: 'button', role: 'radio', 'aria-checked': String(clan === g.id), class: 'choice clan' + (clan === g.id ? ' on' : ''), onclick: () => { clan = g.id; draw(); onPick(); audio.click(); } },
        h('span', { class: 'flag', style: { background: clanColor(g.id), transform: 'rotate(45deg) scale(.8)' } }),
        h('span', { style: { flex: '1', minWidth: '0' } }, clanName(g.id, g.meta?.name), h('small', null, g.id === DEFAULT_GUILD ? 'BEST FIRST' : g.meta?.tag ? String(g.meta.tag).toUpperCase() : `#${g.id}`)),
        clan === g.id ? glyph('done', 26, '#0A0612') : null)));
    };
    draw();
    return list;
  }

  async function join() {
    const g = clans?.find((c) => c.id === clan);
    if (!g || nameProblem(name)) return;
    busy = true; err = ''; paint();
    try { await enlist(name, g.id, clanName(g.id, g.meta?.name)); joinedHere = true; audio.pop(); }
    catch (e) { err = (e as Error).message; }
    busy = false; paint();
  }

  function paint() {
    const was = document.activeElement;
    const at = was instanceof HTMLInputElement || was instanceof HTMLTextAreaElement ? was : null;
    const keep = at && body.contains(at) && at.id ? { id: at.id, s: at.selectionStart, e: at.selectionEnd } : null;
    draw();
    const back = keep && document.getElementById(keep.id);
    if (back instanceof HTMLInputElement || back instanceof HTMLTextAreaElement) { back.focus(); try { back.setSelectionRange(keep!.s, keep!.e); } catch { /* not text */ } }
  }

  function draw() {
    clear(body);
    const a = wallet.active;
    const job = enlisting.current;

    if (mode === 'words' && revealed && wallet.unlocked) {
      body.append(head('PAW WORDS', 'var(--yellow)'),
        ...(wallet.backedUp
          ? [h('div', { class: 'words', 'data-raw': '' }, ...revealed.split(' ').map((w, i) => h('span', null, h('i', null, String(i + 1)), w))),
            h('div', { class: 'row end', style: { marginTop: '14px' } }, h('button', { type: 'button', class: 'cbtn', onclick: () => { revealed = ''; mode = 'choose'; paint(); } }, glyph('hide', 18, '#0A0612'), 'HIDE'))]
          : wordsPanel('DONE', () => { revealed = ''; mode = 'choose'; paint(); toast('WORDS · KEPT', 'player'); })));
      return;
    }
    if (mode === 'pass' && wallet.unlocked) {
      const pass = h('input', { type: 'password', id: 'pass-words', autocomplete: 'current-password', value: passTyped, oninput: (e: Event) => { passTyped = (e.target as HTMLInputElement).value; } }) as HTMLInputElement;
      body.append(head('KEY', 'var(--yellow)'),
        h('div', { class: 'field' }, h('label', { for: 'pass-words' }, 'KEY'), pass), errLine(),
        h('div', { class: 'row between', style: { marginTop: '14px' } },
          h('button', { type: 'button', class: 'cbtn paper', onclick: () => { mode = 'choose'; err = ''; passTyped = ''; paint(); } }, glyph('back', 18, '#0A0612'), 'BACK'),
          h('button', { type: 'button', class: 'cbtn yellow', onclick: () => { const v = pass.value; passTyped = ''; void reveal(passNext, v); } }, glyph('show', 18, '#0A0612'), 'SHOW')));
      return;
    }
    if (mode === 'words' && !revealed && wallet.unlocked) { void reveal('words'); body.append(head('PAW WORDS', 'var(--yellow)'), h('p', { class: 'boomtxt', style: { fontSize: '24px' } }, 'READING…')); return; }

    if (joinedHere && (a?.playerId || job?.status === 'done')) {
      const clanWord = (job?.guildName || clanOf(clan)).toUpperCase();
      if (!empire.commander?.planetId) {
        const seek = txq.jobs.filter((j) => a?.playerId && j.playerId === a.playerId && j.msgs.some((m) => /MsgPlanetExplore$/.test(m.typeUrl))).pop();
        const failed = seek?.status === 'failed' ? seek : null;
        if (seek && !failed) claimJob(seekClaim = seek.id);
        body.append(head(failed ? 'NO DEN' : 'ROAMING…', 'var(--cyan)'), road(3),
          h('p', { class: 'boomtxt', style: { fontSize: '26px', margin: '0 0 10px' } }, `${(job?.name || name).toUpperCase()} · ${clanWord}`),
          failed ? h('p', null, h('span', { class: 'refusal', title: failed.error || '' }, tag(failed.error))) : h('div', { class: 'row' }, glyph('roam', 40, '#22E4FF'), h('span', { class: 'boomtxt', style: { fontSize: '24px' } }, 'FINDING DEN')),
          h('div', { class: 'row end', style: { marginTop: '14px' } }, failed
            ? h('button', { type: 'button', class: 'cbtn yellow', onclick: () => { if (a?.playerId) explore(a.index, a.playerId); } }, glyph('roam', 20, '#0A0612'), 'ROAM AGAIN')
            : h('button', { type: 'button', class: 'cbtn small paper', onclick: close }, 'LOOK AROUND')));
        return;
      }
      body.append(head('DEN FOUND!', 'var(--yellow)'), road(4),
        h('div', { class: 'row center', style: { margin: '6px 0 12px' } }, kinIcon(1, 140, { crown: true })),
        h('p', { class: 'boomtxt', style: { fontSize: '30px', margin: '0', textAlign: 'center' } }, `${(job?.name || name).toUpperCase()} · ${clanWord}`),
        h('div', { class: 'row center', style: { marginTop: '16px' } },
          h('button', { type: 'button', class: 'cbtn big yellow', onclick: () => {
            try { sessionStorage.setItem('furrency.hatch', '1'); } catch { /* none */ }
            close();
            if (location.hash === '#/den') window.dispatchEvent(new HashChangeEvent('hashchange')); else location.hash = '#/den';
          } }, glyph('den', 30, '#0A0612'), 'ENTER DEN')),
        !wallet.backedUp ? h('div', { class: 'row center', style: { marginTop: '14px' } }, glyph('warn', 22, '#FF2E88'), h('button', { type: 'button', class: 'cbtn small pink', onclick: () => void reveal('words') }, 'KEEP WORDS')) : '');
      return;
    }

    if (job && job.status !== 'done' && !a?.playerId) {
      body.append(head(job.status === 'failed' ? 'STUCK' : 'JOINING…', 'var(--cyan)'), road(2),
        h('p', { class: 'boomtxt', style: { fontSize: '26px', margin: '0 0 8px' } }, `${job.name.toUpperCase()} · ${job.guildName.toUpperCase()}`),
        h('div', { class: 'stack', style: { gap: '4px' } }, ...job.steps.map((s, i) => h('div', { class: 'row', style: { gap: '8px' } }, glyph(i === job.steps.length - 1 && job.status === 'running' ? 'wait' : 'done', 20, '#0A0612'), h('span', { class: 'boomtxt', style: { fontSize: '22px' } }, tag(s) === 'NOPE' ? s : s)))),
        job.status === 'failed'
          ? h('div', { class: 'stack', style: { marginTop: '12px' } }, h('p', { style: { margin: 0 } }, h('span', { class: 'refusal', title: job.error || '' }, tag(job.error))), h('button', { type: 'button', class: 'cbtn yellow', onclick: () => retryEnlist() }, 'AGAIN'))
          : h('div', { class: 'row end', style: { marginTop: '12px' } }, h('button', { type: 'button', class: 'cbtn small paper', onclick: close }, 'LOOK AROUND')));
      return;
    }

    if (wallet.state === 'locked') {
      const pass = h('input', { type: 'password', id: 'pass', autocomplete: 'current-password', value: passTyped, oninput: (e: Event) => { passTyped = (e.target as HTMLInputElement).value; } }) as HTMLInputElement;
      body.append(head('PAW LOCKED', 'var(--yellow)'),
        h('div', { class: 'field' }, h('label', { for: 'pass' }, 'KEY'), pass), errLine(),
        h('div', { class: 'row end', style: { marginTop: '14px' } }, h('button', { type: 'button', class: 'cbtn yellow', onclick: async () => {
          try { await wallet.unlock(pass.value); passTyped = ''; err = ''; } catch (e) { err = (e as Error).message; paint(); }
        } }, glyph('lock', 18, '#0A0612'), 'UNLOCK')));
      return;
    }

    if (wallet.unlocked && a?.playerId) {
      loadClans();
      const p = empire.commander;
      body.append(head((a.label || 'CHIEF').toUpperCase(), 'var(--yellow)'),
        h('dl', { class: 'facts' },
          h('div', null, h('dt', null, 'CLAN'), h('dd', null, clanOf(p?.guildId || ''))),
          h('div', null, h('dt', null, 'WORDS'), h('dd', { style: { color: wallet.backedUp ? '#1a8a1a' : 'var(--pink)' } }, wallet.backedUp ? 'KEPT' : 'NOT KEPT')),
          h('div', null, h('dt', null, 'DEN'), h('dd', null, (p?.planet?.Planet.name || (p?.planetId ? 'YOURS' : '—')).toUpperCase())),
          h('div', null, h('dt', null, 'KIN'), h('dd', null, String(p ? [...p.structs.values()].filter((s) => !s.destroyed).length : 0))),
          // what a skeptic asks first: where the key lives, whether this is money, what runs on their machine
          h('div', null, h('dt', null, 'KEY'), h('dd', null, 'THIS BROWSER')),
          h('div', null, h('dt', null, 'NET'), h('dd', { style: { color: NET === 'MAINNET' ? 'var(--pink)' : '#1a8a1a' } }, NET === 'MAINNET' ? 'MAINNET' : `${NET} · NO MONEY`))),
        h('div', { class: 'row', style: { marginTop: '10px', gap: '8px', alignItems: 'center' } },
          glyph('howl', 20, '#0A0612'), h('span', { class: 'tag' }, 'HOWL · THIS COMPUTER'),
          h('button', { type: 'button', class: 'cbtn small ' + (pow.settings.enabled ? 'violet' : 'paper'), 'aria-pressed': String(pow.settings.enabled), onclick: () => { pow.save({ enabled: !pow.settings.enabled }); paint(); } }, pow.settings.enabled ? 'ON' : 'OFF')),
        h('details', { class: 'mark', open: markOpen, ontoggle: (e: Event) => { markOpen = (e.target as HTMLDetailsElement).open; } }, h('summary', { class: 'tag' }, 'PAW MARK'), h('p', { style: { fontFamily: 'var(--ui)', fontSize: '13px', wordBreak: 'break-all', margin: '6px 0 0' } }, a.address)),
        h('div', { class: 'row', style: { marginTop: '12px' } },
          h('button', { type: 'button', class: wallet.backedUp ? 'cbtn' : 'cbtn pink', onclick: () => void reveal('words') }, glyph('words', 18, wallet.backedUp ? '#0A0612' : '#FFF8E7'), wallet.backedUp ? 'WORDS' : 'KEEP WORDS'),
          location.hash === '#/den' ? null : h('a', { class: 'cbtn yellow', href: '#/den', onclick: close }, glyph('den', 18, '#0A0612'), 'DEN'),
          wallet.deviceSealed ? null : h('button', { type: 'button', class: 'cbtn small paper', style: { marginLeft: 'auto' }, onclick: () => { wallet.lock(); close(); } }, glyph('lock', 16, '#0A0612'), 'LOCK'),
          h('button', { type: 'button', class: 'cbtn small paper', style: { marginLeft: wallet.deviceSealed ? 'auto' : '0' }, onclick: async () => {
            if (await confirmBox('FORGET PAW?', ['WORDS = WAY BACK'], 'FORGET')) { wallet.forget(); close(); }
          } }, glyph('release', 16, '#0A0612'), 'FORGET')));
      return;
    }

    if (wallet.unlocked && !a?.playerId) {
      if (mode === 'choose') mode = !wallet.backedUp && wallet.deviceSealed ? 'keep' : 'clan';
      else if (mode === 'speak') mode = 'clan';
    }

    if (mode === 'choose') {
      body.append(head('JOIN', 'var(--pink)'), road(0),
        h('div', { class: 'stack', style: { marginTop: '6px' } },
          h('button', { type: 'button', class: 'choice', disabled: busy, onclick: async () => {
            busy = true; paint();
            try { if (wallet.state === 'empty') await wallet.createInstant(); revealed = await wallet.revealPhrase(''); mode = 'keep'; audio.pop(); }
            catch (e) { err = (e as Error).message; }
            busy = false; paint();
          } }, glyph('paw', 40, '#0A0612'), h('span', null, busy ? 'MAKING…' : 'NEW PAW', h('small', null, 'FRESH · THIS BROWSER'))),
          h('button', { type: 'button', class: 'choice', onclick: () => { mode = 'speak'; paint(); } }, glyph('words', 40, '#0A0612'), h('span', null, 'I HAVE WORDS', h('small', null, 'COME BACK')))),
        errLine());
      return;
    }

    if (mode === 'speak') {
      const words = h('textarea', { id: 'words', autocomplete: 'off', placeholder: '12 or 24 words', value: spoken, oninput: (e: Event) => { spoken = (e.target as HTMLTextAreaElement).value; } }) as HTMLTextAreaElement;
      words.spellcheck = false; words.setAttribute('spellcheck', 'false'); words.setAttribute('autocapitalize', 'off'); words.setAttribute('autocorrect', 'off');
      body.append(head('WORDS', 'var(--pink)'), road(0),
        h('div', { class: 'field' }, h('label', { for: 'words' }, 'PAW WORDS'), words), errLine(),
        h('div', { class: 'row between', style: { marginTop: '14px' } },
          h('button', { type: 'button', class: 'cbtn paper', onclick: () => { mode = 'choose'; err = ''; paint(); } }, glyph('back', 18, '#0A0612'), 'BACK'),
          h('button', { type: 'button', class: 'cbtn yellow', disabled: busy, onclick: async () => {
            const why = phraseProblem(words.value);
            if (why) { err = why; paint(); return; }
            busy = true; paint();
            try { await wallet.createInstant(words.value); spoken = ''; err = ''; wallet.markBackedUp(); await wallet.resolvePlayers(); toast('PAW · BACK', 'player'); mode = 'clan'; audio.howl(); }
            catch (e) { err = (e as Error).message; }
            busy = false; paint();
          } }, glyph('paw', 20, '#0A0612'), busy ? '…' : 'BIND')));
      return;
    }

    if (mode === 'keep') {
      if (!revealed) { void reveal('keep'); body.append(head('WORDS', 'var(--pink)'), road(1), h('p', { class: 'boomtxt', style: { fontSize: '24px' } }, 'READING…')); return; }
      body.append(head('KEEP WORDS', 'var(--pink)'), road(1),
        ...wordsPanel('NEXT', () => { revealed = ''; mode = 'clan'; paint(); }, () => { revealed = ''; mode = 'clan'; paint(); }));
      return;
    }

    // clan: a paw, no chief yet
    const rule = h('p', { class: 'tag', id: 'name-rule', style: { margin: '2px 0 0' } });
    const go = h('button', { type: 'button', class: 'cbtn big yellow', style: { width: '100%', marginTop: '16px' }, onclick: join }) as HTMLButtonElement;
    const check = () => {
      const why = nameProblem(name);
      rule.textContent = why === 'empty' ? '3–20 · A-Z 0-9 _ -' : why || 'GOOD NAME';
      rule.style.color = why && why !== 'empty' ? 'var(--pink)' : !why ? '#1a8a1a' : '';
      go.disabled = busy || !clan || !!why;
      clear(go); go.append(glyph('clan', 28, '#0A0612'), busy ? 'JOINING…' : !clan ? 'PICK CLAN' : why === 'empty' ? 'NAME FIRST' : why ? why : 'JOIN · ROAM');
    };
    const nameIn = h('input', { id: 'chief-name', value: name, maxLength: 20, autocomplete: 'nickname', placeholder: 'VexTail', 'aria-describedby': 'name-rule', oninput: (e: Event) => {
      const el = e.target as HTMLInputElement;
      const fixed = el.value.replace(/\s/g, '_');
      if (fixed !== el.value) { const at = el.selectionStart; el.value = fixed; el.setSelectionRange(at, at); }
      name = fixed; check();
    }, onkeydown: (e: KeyboardEvent) => { if (e.key === 'Enter' && !go.disabled) { e.preventDefault(); void join(); } } }) as HTMLInputElement;
    const roll = h('button', { type: 'button', class: 'cbtn small', 'aria-label': 'Random name', onclick: () => { name = pick(FIRST) + pick(LAST); nameIn.value = name; check(); audio.click(); } }, glyph('dice', 20, '#0A0612'));
    body.append(head('NAME · CLAN', 'var(--pink)'), road(2),
      h('div', { class: 'field' }, h('label', { for: 'chief-name' }, 'NAME'), h('div', { class: 'row', style: { flexWrap: 'nowrap', gap: '8px' } }, nameIn, roll), rule),
      h('p', { class: 'tag', style: { margin: '14px 0 6px' } }, 'CLAN'),
      clanPicker(check), go, errLine());
    check();
  }
  offs = [wallet.onChange(() => paint()), enlisting.onChange(() => paint()), empire.onChange(() => paint()), txq.onChange(() => { if (joinedHere) paint(); })];
  document.addEventListener('keydown', esc);
  window.addEventListener('hashchange', close);
}
