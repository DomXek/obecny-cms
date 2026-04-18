export type WidgetType =
  | 'text'
  | 'notices'
  | 'news'
  | 'events'
  | 'gallery'
  | 'contact'
  | 'map'

export interface Widget {
  type: WidgetType
  content: Record<string, unknown>
}

export interface Block {
  id: string
  type: WidgetType
  col: number       // 0–11  (which column it starts at)
  row: number       // 0+    (which row it starts at)
  colSpan: number   // 1–12  (how many columns wide)
  rowSpan: number   // 1+    (how many rows tall)
  content: Record<string, unknown>
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
  blocks: Block[]
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
