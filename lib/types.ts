export type WidgetType =
  | 'text'
  | 'cta'
  | 'cards'
  | 'notices'
  | 'news'
  | 'events'
  | 'gallery'
  | 'contact'
  | 'map'

// ── Column layouts ────────────────────────────────────────────────────────────

export const COLUMN_LAYOUTS: Record<string, { cols: number[]; label: string }> = {
  '1':    { cols: [100],        label: '100%' },
  '½½':   { cols: [50, 50],     label: '50 / 50' },
  '⅓⅔':   { cols: [33, 67],     label: '33 / 67' },
  '⅔⅓':   { cols: [67, 33],     label: '67 / 33' },
  '¼¾':   { cols: [25, 75],     label: '25 / 75' },
  '¾¼':   { cols: [75, 25],     label: '75 / 25' },
  '⅓⅓⅓':  { cols: [33, 33, 34], label: '33 / 33 / 33' },
}

export type LayoutKey = keyof typeof COLUMN_LAYOUTS

export interface ColumnSlot {
  id: string
  type: WidgetType | null
  content: Record<string, unknown>
}

export interface PageRow {
  id: string
  layout: LayoutKey
  columns: ColumnSlot[]
  minHeight?: number   // px, optional — defaults to content height
}

// ── Legacy block (kept for DB migration only) ─────────────────────────────────
export interface Block {
  id: string
  type: WidgetType
  col: number
  row: number
  colSpan: number
  rowSpan: number
  content: Record<string, unknown>
}

// Convert old blocks[] layout to new rows[] layout
export function migrateLayout(l: PageLayout & { blocks?: Block[] }): PageLayout {
  if (l.rows) return { nav: l.nav, hero: l.hero, rows: l.rows }
  return {
    nav:  l.nav,
    hero: l.hero,
    rows: (l.blocks ?? []).map(b => ({
      id:      b.id,
      layout:  '1' as LayoutKey,
      columns: [{ id: uid(), type: b.type, content: b.content }],
    })),
  }
}

// Change row to a different column layout, preserving existing content
export function changeRowLayout(row: PageRow, newLayout: LayoutKey): PageRow {
  const count = COLUMN_LAYOUTS[newLayout].cols.length
  const cols  = [...row.columns]
  while (cols.length < count) cols.push({ id: uid(), type: null, content: {} })
  return { ...row, layout: newLayout, columns: cols.slice(0, count) }
}

export interface NavItem {
  id?: string
  label: string
  slug: string
  children?: NavItem[]   // Level 2 (dropdown items / mega column links)
}

export type NavStyle = 'simple' | 'dropdown' | 'mega'

export interface NavConfig {
  style?: NavStyle          // default: 'simple'
  position: 'left' | 'center' | 'right'
  items: NavItem[]
}

export interface HeroConfig {
  title: string
  subtitle: string
  height: number
  bgColor?: string   // solid color (overrides gradient)
  bgFrom?: string    // gradient start
  bgTo?: string      // gradient end
  bgImage?: string   // background photo URL
  bgOverlay?: number // dark overlay opacity 0–100 (default 40)
}

export interface PageLayout {
  nav: NavConfig
  hero: HeroConfig
  rows: PageRow[]
}

export interface Aktualita {
  id: string
  title: string
  slug: string
  perex: string | null
  content: string | null
  cover_url: string | null
  author: string | null
  published_at: string | null
  is_published: boolean
  created_at: string
  updated_at: string
}

export interface Page {
  id: string
  slug: string
  title: string
  layout: PageLayout
  is_published: boolean
  created_at: string
  updated_at: string
}

// Widget metadata for the sidebar
export const WIDGET_DEFS: Record<WidgetType, { label: string; icon: string; description: string; defaultContent: Record<string, unknown> }> = {
  text: {
    label: 'Text',
    icon: '¶',
    description: 'Textový blok s formátovaním',
    defaultContent: { html: '<h2>Nadpis sekcie</h2><p>Tu napíšte váš text. Kliknite pre editáciu.</p>' },
  },
  cta: {
    label: 'CTA sekcia',
    icon: '🎯',
    description: 'Výzva k akcii s nadpisom a tlačidlom',
    defaultContent: {
      heading: 'Kontaktujte nás',
      subtext: 'Sme tu pre vás každý pracovný deň',
      buttonLabel: 'Zistiť viac',
      buttonUrl: '/kontakt',
      align: 'center',
    },
  },
  cards: {
    label: 'Karty',
    icon: '🃏',
    description: 'Mriežka kariet — služby, tím, features',
    defaultContent: {
      columns: 3,
      items: [
        { icon: '⭐', title: 'Služba 1', desc: 'Krátky popis prvej služby alebo výhody.' },
        { icon: '🚀', title: 'Služba 2', desc: 'Krátky popis druhej služby alebo výhody.' },
        { icon: '💡', title: 'Služba 3', desc: 'Krátky popis tretej služby alebo výhody.' },
      ],
    },
  },
  notices: {
    label: 'Úradná tabuľa',
    icon: '📋',
    description: 'Zoznam úradných oznámení',
    defaultContent: {},
  },
  news: {
    label: 'Aktuality',
    icon: '📰',
    description: 'Najnovšie správy a novinky',
    defaultContent: {},
  },
  events: {
    label: 'Udalosti',
    icon: '📅',
    description: 'Kalendár podujatí',
    defaultContent: {},
  },
  gallery: {
    label: 'Galéria',
    icon: '🖼',
    description: 'Fotogaléria',
    defaultContent: {},
  },
  contact: {
    label: 'Kontakt',
    icon: '✉️',
    description: 'Kontaktné informácie',
    defaultContent: {},
  },
  map: {
    label: 'Mapa',
    icon: '🗺',
    description: 'Interaktívna mapa',
    defaultContent: {},
  },
}

// ── Footer ────────────────────────────────────────────────────────────────────

export type FooterStyle = 'columns' | 'simple' | 'minimal'

export type SocialPlatform = 'facebook' | 'instagram' | 'youtube' | 'twitter' | 'linkedin'

export interface FooterLink {
  label: string
  href: string
}

export interface FooterColumn {
  id: string
  heading: string
  links: FooterLink[]
}

export interface FooterSocialLink {
  platform: SocialPlatform
  url: string
}

export interface FooterConfig {
  style: FooterStyle
  siteName: string
  tagline?: string
  address?: string
  phone?: string
  email?: string
  ico?: string
  columns: FooterColumn[]
  socialLinks: FooterSocialLink[]
  copyright?: string
}

export const DEFAULT_FOOTER: FooterConfig = {
  style: 'columns',
  siteName: 'Obec',
  tagline: 'Oficiálna webstránka obce',
  address: '',
  phone: '',
  email: '',
  ico: '',
  columns: [
    { id: 'col1', heading: 'Rýchle odkazy', links: [{ label: 'Domov', href: '/' }, { label: 'Aktuality', href: '/aktuality' }] },
  ],
  socialLinks: [],
  copyright: '',
}

// ── Utilities ─────────────────────────────────────────────────────────────────

export function uid(): string {
  return Math.random().toString(36).slice(2, 10)
}
