export type NavPosition = 'left' | 'center' | 'right'

export type WidgetType =
  | 'empty'
  | 'text'
  | 'notices'
  | 'news'
  | 'events'
  | 'gallery'
  | 'contact'
  | 'documents'

export interface ColumnContent {
  html?: string
  [key: string]: unknown
}

export interface Column {
  width: number // percentage 0–100
  widget: WidgetType
  content?: ColumnContent
}

export interface Section {
  id: string
  columns: Column[]
}

export interface HeroConfig {
  height: number
  title: string
  subtitle: string
}

export interface PageLayout {
  nav: { position: NavPosition }
  hero: HeroConfig
  sections: Section[]
}

export const WIDGETS: Record<WidgetType, { label: string; bg: string; text: string; icon: string }> = {
  empty:     { label: 'Prázdny blok',       bg: 'bg-gray-100',   text: 'text-gray-400',   icon: '□' },
  text:      { label: 'Textový blok',        bg: 'bg-blue-50',    text: 'text-blue-600',   icon: '¶' },
  notices:   { label: 'Úradná tabuľa',      bg: 'bg-amber-50',   text: 'text-amber-700',  icon: '📋' },
  news:      { label: 'Novinky',             bg: 'bg-green-50',   text: 'text-green-700',  icon: '📰' },
  events:    { label: 'Podujatia',           bg: 'bg-purple-50',  text: 'text-purple-700', icon: '📅' },
  gallery:   { label: 'Galéria',             bg: 'bg-pink-50',    text: 'text-pink-700',   icon: '🖼' },
  contact:   { label: 'Kontaktný formulár',  bg: 'bg-teal-50',    text: 'text-teal-700',   icon: '✉️' },
  documents: { label: 'Dokumenty',           bg: 'bg-orange-50',  text: 'text-orange-700', icon: '📄' },
}

export const DEFAULT_LAYOUT: PageLayout = {
  nav: { position: 'right' },
  hero: { height: 320, title: 'Vitajte', subtitle: 'Oficiálna stránka obce' },
  sections: [],
}
