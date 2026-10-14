/* Kin: every beast and totem, with its numbers as the chain keeps them. */
import { h } from '../core/dom';
import type { Ctx, Screen } from './types';
import { glyph } from '../ui/glyphs';
import { kinIcon } from '../ui/portrait';
import { STRUCT_TYPES, AMBIT_FLAG, type StructType } from '../data/catalogue';
import { AMBIT_OF_REALM, REALMS, REALM_COLOR, REALM_NAME, WARD_CRAFT, beastName, fmtMana, lore, reachOf, type Realm } from '../lore';

export function kin(_ctx: Ctx): Screen {
  const zonesOf = (t: StructType): Realm[] => REALMS.filter((r) => t.possibleAmbit & AMBIT_FLAG[AMBIT_OF_REALM[r]]);
  const card = (t: StructType) => {
    const L = lore(t.id), totem = t.category === 'planet';
    const zones = zonesOf(t);
    const hits = [...new Set([...reachOf(t.primaryWeaponAmbits), ...reachOf(t.secondaryWeaponAmbits)])];
    const fact = (k: string, v: string) => h('div', null, h('dt', null, k), h('dd', null, v));
    return h('article', { class: 'card', style: { '--c': totem ? 'var(--yellow)' : REALM_COLOR[zones[0] || 'root'] } },
      h('div', { style: { background: totem ? '#3A2A10' : '#1E1240', border: '4px solid var(--ink)', display: 'grid', placeItems: 'center' } }, kinIcon(t.id, 150, { crown: t.id === 1, seedFrom: `k${t.id}` })),
      h('div', { class: 'row between' }, h('h3', null, beastName(t.id)), h('span', { class: 'chip fill', style: { '--c': 'var(--pink)', color: 'var(--paper)' } }, L.role)),
      h('div', { class: 'row', style: { gap: '6px' } }, ...zones.map((r) => h('span', { class: 'chip', style: { color: '#0A0612', background: REALM_COLOR[r] } }, glyph(r, 14, '#0A0612'), REALM_NAME[r]))),
      h('dl', { class: 'facts', style: { color: 'var(--ink)' } },
        fact('FUR', t.maxHealth > 6 ? `♥ ×${t.maxHealth}` : '♥'.repeat(t.maxHealth)),
        fact('GLOW', `−${fmtMana(t.passiveDraw)}`),
        totem ? fact('DOES', t.planetaryMining !== 'noPlanetaryMining' ? 'DIG' : t.planetaryRefinery !== 'noPlanetaryRefinery' ? 'FORGE' : t.generatingRate ? 'GLOW' : t.planetaryShieldContribution ? `WARD +${t.planetaryShieldContribution}` : 'STING') : fact('HITS', t.id === 1 ? 'OWN ZONE' : hits.map((r) => REALM_NAME[r]).join(' ') || '—'),
        totem ? fact('MAX', t.buildLimit ? `${t.buildLimit}` : '∞') : fact('SKILL', WARD_CRAFT[t.unitDefenses] || 'NONE'),
        totem ? null : fact('DMG', `${t.primaryWeaponDamage}${t.secondaryWeaponDamage ? ` · ${t.secondaryWeaponDamage}` : ''}`),
        totem ? null : fact('BITE BACK', `${t.counterAttack}${t.counterAttackSameAmbit !== t.counterAttack ? ` · ${t.counterAttackSameAmbit}` : ''}`)));
  };
  const pack = STRUCT_TYPES.filter((t) => t.category === 'fleet').sort((a, b) => a.id - b.id);
  const totems = STRUCT_TYPES.filter((t) => t.category === 'planet').sort((a, b) => a.id - b.id);
  const el = h('div', { class: 'screen scrolls' }, h('div', { class: 'page' },
    h('h1', { class: 'h1' }, 'KIN'),
    h('h2', { class: 'h2' }, glyph('pack', 34, '#22E4FF'), 'PACK'),
    h('div', { class: 'grid' }, ...pack.map(card)),
    h('h2', { class: 'h2' }, glyph('den', 34, '#FFE53B'), 'TOTEMS'),
    h('div', { class: 'grid' }, ...totems.map(card))));
  return { el, title: 'KIN', leave: () => {} };
}
