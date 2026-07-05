import type { GameEventDto, PlayerDto, SystemDto, EventTypeDto } from '@shared/types'
import { positionSortIndex } from '@shared/position-order'

export function playerLabel(p: PlayerDto): string {
  return `${p.jerseyNumber != null ? '#' + p.jerseyNumber + ' ' : ''}${p.firstName} ${p.lastName}`
}

export function sortPlayersByPosition(players: PlayerDto[]): PlayerDto[] {
  return [...players].sort(
    (a, b) =>
      positionSortIndex(a.position) - positionSortIndex(b.position) ||
      (a.jerseyNumber ?? 999) - (b.jerseyNumber ?? 999)
  )
}

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

function emptyRow(p: PlayerDto): PlayerStatsRow {
  return {
    playerId: p.id,
    playerLabel: playerLabel(p),
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

export function computePlayerStats(
  events: GameEventDto[],
  players: PlayerDto[]
): PlayerStatsRow[] {
  const sortedPlayers = sortPlayersByPosition(players)

  const map = new Map<number, PlayerStatsRow>()
  for (const p of sortedPlayers) map.set(p.id, emptyRow(p))

  for (const e of events) {
    if (e.playerId == null) continue
    const row = map.get(e.playerId)
    if (!row) continue

    row.points += e.eventTypePoints ?? 0

    switch (e.eventTypeCode) {
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

export function computeTotalsRow(rows: PlayerStatsRow[]): PlayerStatsRow {
  const total: PlayerStatsRow = {
    playerId: -1,
    playerLabel: 'Total équipe',
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
  for (const r of rows) {
    total.points += r.points
    total.fg2Made += r.fg2Made
    total.fg2Att += r.fg2Att
    total.fg3Made += r.fg3Made
    total.fg3Att += r.fg3Att
    total.ftMade += r.ftMade
    total.ftAtt += r.ftAtt
    total.rebOff += r.rebOff
    total.rebDef += r.rebDef
    total.ast += r.ast
    total.stl += r.stl
    total.blk += r.blk
    total.tov += r.tov
    total.fouls += r.fouls
  }
  return total
}

export interface SystemStatsRow {
  systemId: number
  systemName: string
  runs: number
  points: number
  fg2Made: number
  fg2Att: number
  fg3Made: number
  fg3Att: number
  ftMade: number
  ftAtt: number
  tov: number
  pointsPerRun: number
}

function emptySystemRow(s: SystemDto): SystemStatsRow {
  return {
    systemId: s.id,
    systemName: s.name,
    runs: 0,
    points: 0,
    fg2Made: 0,
    fg2Att: 0,
    fg3Made: 0,
    fg3Att: 0,
    ftMade: 0,
    ftAtt: 0,
    tov: 0,
    pointsPerRun: 0
  }
}

export function computeSystemStats(events: GameEventDto[], systems: SystemDto[]): SystemStatsRow[] {
  const map = new Map<number, SystemStatsRow>()
  for (const s of systems) map.set(s.id, emptySystemRow(s))

  for (const e of events) {
    if (e.systemId == null) continue
    const row = map.get(e.systemId)
    if (!row) continue

    row.runs++
    row.points += e.eventTypePoints ?? 0

    switch (e.eventTypeCode) {
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
      case 'TOV':
        row.tov++
        break
    }
  }

  const rows = Array.from(map.values())
  for (const r of rows) r.pointsPerRun = r.runs === 0 ? 0 : r.points / r.runs
  return rows.sort((a, b) => b.pointsPerRun - a.pointsPerRun)
}

export function pct(made: number, att: number): string {
  if (att === 0) return '—'
  return `${Math.round((made / att) * 100)}%`
}

export interface CustomActionStatsRow {
  playerId: number
  playerLabel: string
  counts: Record<number, number>
  total: number
}

export function computeCustomActionStats(
  events: GameEventDto[],
  players: PlayerDto[],
  customEventTypes: EventTypeDto[]
): CustomActionStatsRow[] {
  const sortedPlayers = sortPlayersByPosition(players)

  const rows: CustomActionStatsRow[] = sortedPlayers.map((p) => ({
    playerId: p.id,
    playerLabel: playerLabel(p),
    counts: Object.fromEntries(customEventTypes.map((t) => [t.id, 0])),
    total: 0
  }))
  const rowById = new Map(rows.map((r) => [r.playerId, r]))

  for (const e of events) {
    if (e.eventTypeCategory !== 'CUSTOM' || e.playerId == null) continue
    const row = rowById.get(e.playerId)
    if (!row) continue
    row.counts[e.eventTypeId] = (row.counts[e.eventTypeId] ?? 0) + 1
    row.total++
  }

  return rows
}
