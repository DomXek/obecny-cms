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
  label: string
  slug: string
}

export interface NavConfig {
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

export function uid(): string {
  return Math.random().toString(36).slice(2, 10)
}
