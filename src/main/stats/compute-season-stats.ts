import type { SeasonEventRow } from '../db/repositories/season.repo'

export interface SeasonPlayerStatsRow {
  playerName: string
  matchesPlayed: number
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

function emptyRow(name: string): SeasonPlayerStatsRow {
  return {
    playerName: name,
    matchesPlayed: 0,
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

export function computeSeasonPlayerStats(events: SeasonEventRow[]): SeasonPlayerStatsRow[] {
  const rowsByName = new Map<string, SeasonPlayerStatsRow>()
  const projectsByName = new Map<string, Set<number>>()

  for (const e of events) {
    const name = `${e.first_name} ${e.last_name}`
    if (!rowsByName.has(name)) {
      rowsByName.set(name, emptyRow(name))
      projectsByName.set(name, new Set())
    }
    const row = rowsByName.get(name)!
    projectsByName.get(name)!.add(e.project_id)

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

  const rows = Array.from(rowsByName.values())
  for (const row of rows) {
    row.matchesPlayed = projectsByName.get(row.playerName)?.size ?? 0
  }

  return rows.sort((a, b) => b.points - a.points)
}
