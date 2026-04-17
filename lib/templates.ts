import { PageLayout, uid } from './types'

export interface Template {
  id: string
  name: string
  description: string
  category: string
  layout: PageLayout
}

const DEFAULT_NAV = {
  position: 'center' as const,
  items: [
    { label: 'Domov', slug: 'domov' },
    { label: 'Aktuality', slug: 'aktuality' },
    { label: 'Kontakt', slug: 'kontakt' },
  ],
}

const DEFAULT_HERO = {
  title: 'Vitajte v obci',
  subtitle: 'Oficiálna webová stránka obce',
  height: 380,
  bgFrom: '#1e3a5f',
  bgTo: '#2563eb',
}

export const TEMPLATES: Template[] = [
  // ─── 1. Prázdna ──────────────────────────────────────────────────────────────
  {
    id: 'blank',
    name: 'Prázdna',
    description: 'Čistý canvas bez blokov — začnite od nuly.',
    category: 'Základné',
    layout: {
      nav: DEFAULT_NAV,
      hero: DEFAULT_HERO,
      blocks: [],
    },
  },

  // ─── 2. Spravodajská ─────────────────────────────────────────────────────────
  {
    id: 'news-focused',
    name: 'Spravodajská',
    description: 'Aktuality v popredí, úradná tabuľa v bočnom stĺpci.',
    category: 'Odporúčané',
    layout: {
      nav: DEFAULT_NAV,
      hero: DEFAULT_HERO,
      blocks: [
        { id: uid(), type: 'news',    col: 0, row: 0, colSpan: 8, rowSpan: 5, content: {} },
        { id: uid(), type: 'notices', col: 8, row: 0, colSpan: 4, rowSpan: 5, content: {} },
      ],
    },
  },

  // ─── 3. Komunitná ────────────────────────────────────────────────────────────
  {
    id: 'community',
    name: 'Komunitná',
    description: 'Aktuality, udalosti, galéria a kontakt — všetko na jednej stránke.',
    category: 'Odporúčané',
    layout: {
      nav: DEFAULT_NAV,
      hero: { ...DEFAULT_HERO, height: 420 },
      blocks: [
        { id: uid(), type: 'news',    col: 0, row: 0, colSpan: 6, rowSpan: 4, content: {} },
        { id: uid(), type: 'events',  col: 6, row: 0, colSpan: 6, rowSpan: 4, content: {} },
        { id: uid(), type: 'gallery', col: 0, row: 4, colSpan: 8, rowSpan: 3, content: {} },
        { id: uid(), type: 'contact', col: 8, row: 4, colSpan: 4, rowSpan: 3, content: {} },
      ],
    },
  },

  // ─── 4. Úradná ───────────────────────────────────────────────────────────────
  {
    id: 'official',
    name: 'Úradná',
    description: 'Úradná tabuľa na prvom mieste, informačný text a kontakt dole.',
    category: 'Odporúčané',
    layout: {
      nav: { ...DEFAULT_NAV, position: 'left' as const },
      hero: { ...DEFAULT_HERO, height: 300, bgFrom: '#1c2e4a', bgTo: '#1e3a5f' },
      blocks: [
        { id: uid(), type: 'notices', col: 0, row: 0, colSpan: 12, rowSpan: 4, content: {} },
        { id: uid(), type: 'text',    col: 0, row: 4, colSpan: 7,  rowSpan: 3, content: { html: '<h2>O obci</h2><p>Tu napíšte krátky opis obce, históriu alebo dôležité informácie.</p>' } },
        { id: uid(), type: 'contact', col: 7, row: 4, colSpan: 5,  rowSpan: 3, content: {} },
      ],
    },
  },

  // ─── 5. Plná ─────────────────────────────────────────────────────────────────
  {
    id: 'full',
    name: 'Plná stránka',
    description: 'Kompletné rozloženie so všetkými typmi obsahu.',
    category: 'Pokročilé',
    layout: {
      nav: DEFAULT_NAV,
      hero: { ...DEFAULT_HERO, height: 460 },
      blocks: [
        { id: uid(), type: 'news',    col: 0, row: 0, colSpan: 8, rowSpan: 4, content: {} },
        { id: uid(), type: 'events',  col: 8, row: 0, colSpan: 4, rowSpan: 4, content: {} },
        { id: uid(), type: 'notices', col: 0, row: 4, colSpan: 6, rowSpan: 3, content: {} },
        { id: uid(), type: 'text',    col: 6, row: 4, colSpan: 6, rowSpan: 3, content: { html: '<h2>O obci</h2><p>Krátky opis obce a dôležité informácie pre návštevníkov.</p>' } },
        { id: uid(), type: 'gallery', col: 0, row: 7, colSpan: 7, rowSpan: 3, content: {} },
        { id: uid(), type: 'contact', col: 7, row: 7, colSpan: 5, rowSpan: 3, content: {} },
        { id: uid(), type: 'map',     col: 0, row: 10, colSpan: 12, rowSpan: 3, content: {} },
      ],
    },
  },
]

export const WIDGET_COLORS: Record<string, string> = {
  text:    '#3b82f6',
  news:    '#8b5cf6',
  notices: '#f59e0b',
  events:  '#10b981',
  gallery: '#ec4899',
  contact: '#6b7280',
  map:     '#14b8a6',
}
