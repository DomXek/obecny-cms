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

// ─── Legacy simple section (1–2 columns, no spanning) ─────────────────────────
export interface Column {
  width: number
  widget: WidgetType
  content?: ColumnContent
}

export interface SimpleSection {
  id: string
  mode?: 'simple' | undefined
  columns: Column[]
}

// ─── Grid section (CSS grid s rowSpan/colSpan) ─────────────────────────────────
export interface GridCell {
  id: string
  col: number      // 0-based start column
  row: number      // 0-based start row
  colSpan: number  // how many columns this cell occupies
  rowSpan: number  // how many rows this cell occupies
  widget: WidgetType
  content?: ColumnContent
}

export interface GridSection {
  id: string
  mode: 'grid'
  cols: number     // total number of columns in this grid (2, 3 or 4)
  cells: GridCell[]
}

export type Section = SimpleSection | GridSection

// ─── Grid helpers ──────────────────────────────────────────────────────────────
export function getTotalRows(cells: GridCell[]): number {
  if (cells.length === 0) return 1
  return Math.max(...cells.map(c => c.row + c.rowSpan))
}

/** Returns the cell occupying (col, row), excluding the given cellId */
export function cellAt(cells: GridCell[], col: number, row: number, excludeId?: string): GridCell | null {
  return cells.find(c =>
    c.id !== excludeId &&
    col >= c.col && col < c.col + c.colSpan &&
    row >= c.row && row < c.row + c.rowSpan
  ) ?? null
}

export function expandCell(section: GridSection, cellId: string, dir: 'right' | 'down'): GridSection {
  const cell = section.cells.find(c => c.id === cellId)
  if (!cell) return section
  let cells = [...section.cells]

  if (dir === 'right') {
    if (cell.col + cell.colSpan >= section.cols) return section // already at right edge
    // Displace overlapping cells in the newly claimed column+rows
    cells = cells.map(c => {
      if (c.id === cellId) return c
      const overlaps = c.col >= cell.col + cell.colSpan &&
        c.col < cell.col + cell.colSpan + 1 &&
        c.row >= cell.row && c.row < cell.row + cell.rowSpan
      return overlaps ? { ...c, widget: 'empty' as WidgetType, content: {} } : c
    })
    cells = cells.map(c => c.id === cellId ? { ...c, colSpan: c.colSpan + 1 } : c)
  }

  if (dir === 'down') {
    const totalRows = getTotalRows(cells)
    const newRow = cell.row + cell.rowSpan

    if (newRow >= totalRows) {
      // Add a new row: fill all columns except the ones the cell will claim
      for (let col = 0; col < section.cols; col++) {
        if (col < cell.col || col >= cell.col + cell.colSpan) {
          cells.push({ id: uid(), col, row: newRow, colSpan: 1, rowSpan: 1, widget: 'empty' })
        }
      }
    } else {
      // Displace cells in the newly claimed row
      cells = cells.map(c => {
        if (c.id === cellId) return c
        const overlaps = c.row >= newRow && c.row < newRow + 1 &&
          c.col >= cell.col && c.col < cell.col + cell.colSpan
        return overlaps ? { ...c, widget: 'empty' as WidgetType, content: {} } : c
      })
    }
    cells = cells.map(c => c.id === cellId ? { ...c, rowSpan: c.rowSpan + 1 } : c)
  }

  return { ...section, cells }
}

export function shrinkCell(section: GridSection, cellId: string, dir: 'left' | 'up'): GridSection {
  const cell = section.cells.find(c => c.id === cellId)
  if (!cell) return section
  let cells = [...section.cells]

  if (dir === 'left' && cell.colSpan > 1) {
    const freedCol = cell.col + cell.colSpan - 1
    for (let row = cell.row; row < cell.row + cell.rowSpan; row++) {
      if (!cellAt(cells, freedCol, row, cellId)) {
        cells.push({ id: uid(), col: freedCol, row, colSpan: 1, rowSpan: 1, widget: 'empty' })
      }
    }
    cells = cells.map(c => c.id === cellId ? { ...c, colSpan: c.colSpan - 1 } : c)
  }

  if (dir === 'up' && cell.rowSpan > 1) {
    const freedRow = cell.row + cell.rowSpan - 1
    for (let col = cell.col; col < cell.col + cell.colSpan; col++) {
      if (!cellAt(cells, col, freedRow, cellId)) {
        cells.push({ id: uid(), col, row: freedRow, colSpan: 1, rowSpan: 1, widget: 'empty' })
      }
    }
    cells = cells.map(c => c.id === cellId ? { ...c, rowSpan: c.rowSpan - 1 } : c)
  }

  return { ...section, cells }
}

export function addRowToGrid(section: GridSection): GridSection {
  const row = getTotalRows(section.cells)
  const cells = [...section.cells]
  for (let col = 0; col < section.cols; col++) {
    cells.push({ id: uid(), col, row, colSpan: 1, rowSpan: 1, widget: 'empty' })
  }
  return { ...section, cells }
}

export function makeDefaultGrid(cols: 2 | 3 | 4 = 2): GridSection {
  const cells: GridCell[] = []
  for (let col = 0; col < cols; col++) {
    cells.push({ id: uid(), col, row: 0, colSpan: 1, rowSpan: 1, widget: 'empty' })
  }
  return { id: uid(), mode: 'grid', cols, cells }
}

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

// ─── Hero ──────────────────────────────────────────────────────────────────────
export interface HeroConfig {
  height: number
  title: string
  subtitle: string
}

// ─── Nav ───────────────────────────────────────────────────────────────────────
export interface NavItem {
  slug: string
  label: string
}

export interface NavConfig {
  position: NavPosition
  items?: NavItem[]
}

// ─── PageLayout ────────────────────────────────────────────────────────────────
export interface PageLayout {
  nav: NavConfig
  hero: HeroConfig
  sections: Section[]
}

// ─── Widget metadata ───────────────────────────────────────────────────────────
export const WIDGETS: Record<WidgetType, { label: string; bg: string; text: string; icon: string }> = {
  empty:     { label: 'Prázdny blok',      bg: 'bg-gray-100',  text: 'text-gray-400',   icon: '□' },
  text:      { label: 'Textový blok',       bg: 'bg-blue-50',   text: 'text-blue-600',   icon: '¶' },
  notices:   { label: 'Úradná tabuľa',     bg: 'bg-amber-50',  text: 'text-amber-700',  icon: '📋' },
  news:      { label: 'Novinky',            bg: 'bg-green-50',  text: 'text-green-700',  icon: '📰' },
  events:    { label: 'Podujatia',          bg: 'bg-purple-50', text: 'text-purple-700', icon: '📅' },
  gallery:   { label: 'Galéria',            bg: 'bg-pink-50',   text: 'text-pink-700',   icon: '🖼' },
  contact:   { label: 'Kontaktný formulár', bg: 'bg-teal-50',   text: 'text-teal-700',   icon: '✉️' },
  documents: { label: 'Dokumenty',          bg: 'bg-orange-50', text: 'text-orange-700', icon: '📄' },
}

export const DEFAULT_LAYOUT: PageLayout = {
  nav: { position: 'right', items: undefined },
  hero: { height: 320, title: 'Vitajte', subtitle: 'Oficiálna stránka obce' },
  sections: [],
}
