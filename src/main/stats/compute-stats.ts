import type { EventJoinedRow } from '../db/repositories/event.repo'
import type { PlayerRow } from '../db/repositories/player.repo'

export interface PlayerStatsRow {
  playerId: number
  playerLabel: string
  points: number
  fg2Made: number
  fg2Att: number
  fg3Made: number
  fg3Att: number
  ftMade: number
  ftAtt: number
  rebOff: number
  rebDef: number
  ast: number
  stl: number
  blk: number
  tov: number
  fouls: number
}

function emptyRow(p: PlayerRow): PlayerStatsRow {
  const label = `${p.jersey_number != null ? '#' + p.jersey_number + ' ' : ''}${p.first_name} ${p.last_name}`
  return {
    playerId: p.id,
    playerLabel: label,
    points: 0,
    fg2Made: 0,
    fg2Att: 0,
    fg3Made: 0,
    fg3Att: 0,
    ftMade: 0,
    ftAtt: 0,
    rebOff: 0,
    rebDef: 0,
    ast: 0,
    stl: 0,
    blk: 0,
    tov: 0,
    fouls: 0
  }
}

export function computePlayerStatsRows(
  events: EventJoinedRow[],
  players: PlayerRow[]
): PlayerStatsRow[] {
  const map = new Map<number, PlayerStatsRow>()
  for (const p of players) map.set(p.id, emptyRow(p))

  for (const e of events) {
    if (e.player_id == null) continue
    const row = map.get(e.player_id)
    if (!row) continue

    row.points += e.event_type_points ?? 0

    switch (e.event_type_code) {
      case 'FG2_MADE':
        row.fg2Made++
        row.fg2Att++
        break
      case 'FG2_MISS':
        row.fg2Att++
        break
      case 'FG3_MADE':
        row.fg3Made++
        row.fg3Att++
        break
      case 'FG3_MISS':
        row.fg3Att++
        break
      case 'FT_MADE':
        row.ftMade++
        row.ftAtt++
        break
      case 'FT_MISS':
        row.ftAtt++
        break
      case 'REB_OFF':
        row.rebOff++
        break
      case 'REB_DEF':
        row.rebDef++
        break
      case 'AST':
        row.ast++
        break
      case 'STL':
        row.stl++
        break
      case 'BLK':
        row.blk++
        break
      case 'TOV':
        row.tov++
        break
      case 'FOUL':
        row.fouls++
        break
    }
  }

  return Array.from(map.values())
}
