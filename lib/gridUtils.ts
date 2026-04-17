export const COLS = 12
export const ROW_H = 90   // px — height of one row unit
export const GAP = 10     // px — gap between cells AND canvas padding

/** Column width in px, derived from canvas element's actual width */
export function colWidth(canvasEl: HTMLElement): number {
  const usable = canvasEl.getBoundingClientRect().width - 2 * GAP
  return (usable - (COLS - 1) * GAP) / COLS
}

/** Convert clientX → 0-based column index (clipped to 0…COLS-1) */
export function xToCol(clientX: number, canvasEl: HTMLElement): number {
  const cw = colWidth(canvasEl)
  const relX = clientX - canvasEl.getBoundingClientRect().left - GAP
  return Math.max(0, Math.min(COLS - 1, Math.floor(relX / (cw + GAP))))
}

/** Convert clientY → 0-based row index */
export function yToRow(clientY: number, canvasEl: HTMLElement): number {
  const relY = clientY - canvasEl.getBoundingClientRect().top - GAP
  return Math.max(0, Math.floor(relY / (ROW_H + GAP)))
}

/** Convert clientX delta → column span change */
export function dxToColDelta(dx: number, canvasEl: HTMLElement): number {
  const cw = colWidth(canvasEl)
  return Math.round(dx / (cw + GAP))
}

/** Convert clientY delta → row span change */
export function dyToRowDelta(dy: number): number {
  return Math.round(dy / (ROW_H + GAP))
}
