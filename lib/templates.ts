import { PageLayout, PageRow, ColumnSlot, LayoutKey, uid } from './types'

export interface Template {
  id: string
  name: string
  description: string
  category: string
  layout: PageLayout
}

function row(layout: LayoutKey, ...slots: Array<{ type: string; content?: Record<string, unknown> }>): PageRow {
  return {
    id: uid(),
    layout,
    columns: slots.map(s => ({
      id:      uid(),
      type:    s.type as ColumnSlot['type'],
      content: s.content ?? {},
    })),
  }
}

const DEFAULT_NAV = {
  position: 'center' as const,
  items: [
    { label: 'Domov',     slug: 'domov' },
    { label: 'Aktuality', slug: 'aktuality' },
    { label: 'Kontakt',   slug: 'kontakt' },
  ],
}

const DEFAULT_HERO = {
  title:    'Vitajte v obci',
  subtitle: 'Oficiálna webová stránka obce',
  height:   380,
  bgFrom:   '#1e3a5f',
  bgTo:     '#2563eb',
}

export const TEMPLATES: Template[] = [
  // ─── 1. Prázdna ──────────────────────────────────────────────────────────────
  {
    id:          'blank',
    name:        'Prázdna',
    description: 'Čistý canvas bez blokov — začnite od nuly.',
    category:    'Základné',
    layout: { nav: DEFAULT_NAV, hero: DEFAULT_HERO, rows: [] },
  },

  // ─── 2. Spravodajská ─────────────────────────────────────────────────────────
  {
    id:          'news-focused',
    name:        'Spravodajská',
    description: 'Aktuality v popredí, úradná tabuľa v bočnom stĺpci.',
    category:    'Odporúčané',
    layout: {
      nav:  DEFAULT_NAV,
      hero: DEFAULT_HERO,
      rows: [
        row('⅔⅓', { type: 'news' }, { type: 'notices' }),
      ],
    },
  },

  // ─── 3. Komunitná ────────────────────────────────────────────────────────────
  {
    id:          'community',
    name:        'Komunitná',
    description: 'Aktuality, udalosti, galéria a kontakt — všetko na jednej stránke.',
    category:    'Odporúčané',
    layout: {
      nav:  DEFAULT_NAV,
      hero: { ...DEFAULT_HERO, height: 420 },
      rows: [
        row('½½',  { type: 'news' }, { type: 'events' }),
        row('⅔⅓',  { type: 'gallery' }, { type: 'contact' }),
      ],
    },
  },

  // ─── 4. Úradná ───────────────────────────────────────────────────────────────
  {
    id:          'official',
    name:        'Úradná',
    description: 'Úradná tabuľa na prvom mieste, informačný text a kontakt dole.',
    category:    'Odporúčané',
    layout: {
      nav:  { ...DEFAULT_NAV, position: 'left' as const },
      hero: { ...DEFAULT_HERO, height: 300, bgFrom: '#1c2e4a', bgTo: '#1e3a5f' },
      rows: [
        row('1',   { type: 'notices' }),
        row('⅔⅓',  { type: 'text', content: { html: '<h2>O obci</h2><p>Tu napíšte krátky opis obce, históriu alebo dôležité informácie.</p>' } }, { type: 'contact' }),
      ],
    },
  },

  // ─── 5. Plná ─────────────────────────────────────────────────────────────────
  {
    id:          'full',
    name:        'Plná stránka',
    description: 'Kompletné rozloženie so všetkými typmi obsahu.',
    category:    'Pokročilé',
    layout: {
      nav:  DEFAULT_NAV,
      hero: { ...DEFAULT_HERO, height: 460 },
      rows: [
        row('⅔⅓',  { type: 'news' },    { type: 'events' }),
        row('½½',  { type: 'notices' }, { type: 'text', content: { html: '<h2>O obci</h2><p>Krátky opis obce.</p>' } }),
        row('⅔⅓',  { type: 'gallery' }, { type: 'contact' }),
        row('1',   { type: 'map' }),
      ],
    },
  },
]

export const WIDGET_COLORS: Record<string, string> = {
  text:    '#3b82f6',
  cta:     '#2563eb',
  cards:   '#7c3aed',
  news:    '#8b5cf6',
  notices: '#f59e0b',
  events:  '#10b981',
  gallery: '#ec4899',
  contact: '#6b7280',
  map:     '#14b8a6',
}
