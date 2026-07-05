export const POSITION_ORDER = ['PG', 'SG', 'SF', 'PF', 'C'] as const

export function positionSortIndex(position: string | null): number {
  const idx = POSITION_ORDER.indexOf(position as (typeof POSITION_ORDER)[number])
  return idx === -1 ? POSITION_ORDER.length : idx
}
