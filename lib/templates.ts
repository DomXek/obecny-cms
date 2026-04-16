import { PageLayout, makeDefaultGrid, GridSection, WidgetType } from '@/components/builder/types'

export interface Template {
  id: string
  name: string
  description: string
  preview: string
  layout: PageLayout
}

function grid(cols: 2 | 3 | 4, widgets: string[][]): GridSection {
  const sec = makeDefaultGrid(cols)
  const cells = sec.cells.map((cell, i) => ({
    ...cell,
    widget: (widgets[0]?.[i] ?? 'empty') as import('@/components/builder/types').WidgetType,
    content: widgets[0]?.[i] === 'text' ? {
      html: '<h2>O našej obci</h2><p>Tu môžete napísať krátky úvod o vašej obci — história, počet obyvateľov, poloha. Kliknite na tento blok pre editáciu.</p>',
    } : {},
  }))
  return { ...sec, cells }
}

function grid2r(col1Widget: string, col2Widgets: [string, string]): GridSection {
  // 2 columns, col1 spans 2 rows, col2 has 2 separate cells
  const id = Math.random().toString(36).slice(2)
  return {
    id,
    mode: 'grid',
    cols: 2,
    cells: [
      { id: id + 'a', col: 0, row: 0, colSpan: 1, rowSpan: 2, widget: col1Widget as WidgetType, content: col1Widget === 'text' ? { html: '<h2>O obci</h2><p>Krátky popis obce.</p>' } : {} },
      { id: id + 'b', col: 1, row: 0, colSpan: 1, rowSpan: 1, widget: col2Widgets[0] as WidgetType, content: {} },
      { id: id + 'c', col: 1, row: 1, colSpan: 1, rowSpan: 1, widget: col2Widgets[1] as WidgetType, content: {} },
    ],
  }
}

export const TEMPLATES: Template[] = [
  {
    id: 'obec-zakladna',
    name: 'Základná obec',
    description: 'Jednoduchý web s hero sekciou, textom a úradnou tabuľou.',
    preview: '🏛️',
    layout: {
      nav: {
        position: 'right',
        items: [
          { slug: 'domov', label: 'Domov' },
          { slug: 'o-obci', label: 'O obci' },
          { slug: 'uradna-tabula', label: 'Úradná tabuľa' },
          { slug: 'kontakt', label: 'Kontakt' },
        ],
      },
      hero: { height: 360, title: 'Vitajte v obci', subtitle: 'Oficiálna webová stránka obce' },
      sections: [
        grid(2, [['text', 'notices']]),
        grid(2, [['news', 'events']]),
      ],
    },
  },
  {
    id: 'obec-rozsirena',
    name: 'Rozšírená obec',
    description: 'Kompletný web so stĺpcovým layoutom — text vedľa tabuľky.',
    preview: '🏗️',
    layout: {
      nav: {
        position: 'center',
        items: [
          { slug: 'domov', label: 'Domov' },
          { slug: 'o-obci', label: 'O obci' },
          { slug: 'uradna-tabula', label: 'Úradná tabuľa' },
          { slug: 'aktuality', label: 'Aktuality' },
          { slug: 'galeria', label: 'Galéria' },
          { slug: 'kontakt', label: 'Kontakt' },
        ],
      },
      hero: { height: 480, title: 'Vitajte v obci', subtitle: 'Moderná samospráva pre lepší život' },
      sections: [
        grid2r('text', ['notices', 'events']),
        grid(3, [['news', 'gallery', 'documents']]),
        grid(2, [['contact', 'empty']]),
      ],
    },
  },
  {
    id: 'mestska-cast',
    name: 'Mestská časť',
    description: 'Šablóna pre mestskú časť s širokým 3-stĺpcovým layoutom.',
    preview: '🏙️',
    layout: {
      nav: {
        position: 'left',
        items: [
          { slug: 'domov', label: 'Domov' },
          { slug: 'samosprava', label: 'Samospráva' },
          { slug: 'uradna-tabula', label: 'Úradná tabuľa' },
          { slug: 'aktuality', label: 'Aktuality' },
          { slug: 'projekty', label: 'Projekty' },
          { slug: 'kontakt', label: 'Kontakt' },
        ],
      },
      hero: { height: 420, title: 'Mestská časť', subtitle: 'Transparentná správa pre občanov' },
      sections: [
        grid(2, [['text', 'notices']]),
        grid(3, [['news', 'events', 'documents']]),
      ],
    },
  },
]
