export function isPositiveEventType(category: string, isMade: boolean | null): boolean {
  if (category === 'SHOT') return isMade === true
  if (category === 'TURNOVER' || category === 'FOUL') return false
  return true // REBOUND, PASS, STEAL, BLOCK
}
