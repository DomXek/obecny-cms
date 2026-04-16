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

export interface CmsColumn {
  id: string
  width: number   // percentage, e.g. 50 = 50%
  widget: Widget | null
}

export interface CmsRow {
  id: string
  columns: CmsColumn[]
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
  bgColor?: string
}

export interface PageLayout {
  nav: NavConfig
  hero: HeroConfig
  rows: CmsRow[]
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
