import { useMemo, useState, type ReactElement } from 'react'
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { useAppStore } from '../state/store'
import {
  computePlayerStats,
  computeTotalsRow,
  computeSystemStats,
  computeCustomActionStats,
  pct,
  type PlayerStatsRow,
  type SystemStatsRow,
  type CustomActionStatsRow
} from '../lib/stats'
import ShotChartCourt from '../components/ShotChartCourt'
import type { ShotPoint } from '../components/ShotChartCourt'

const columnHelper = createColumnHelper<PlayerStatsRow>()

const columns = [
  columnHelper.accessor('playerLabel', { header: 'Joueur' }),
  columnHelper.accessor('points', { header: 'Pts' }),
  columnHelper.display({
    id: 'fg2',
    header: '2pts',
    cell: (info) => {
      const r = info.row.original
      return `${r.fg2Made}/${r.fg2Att} (${pct(r.fg2Made, r.fg2Att)})`
    }
  }),
  columnHelper.display({
    id: 'fg3',
    header: '3pts',
    cell: (info) => {
      const r = info.row.original
      return `${r.fg3Made}/${r.fg3Att} (${pct(r.fg3Made, r.fg3Att)})`
    }
  }),
  columnHelper.display({
    id: 'ft',
    header: 'LF',
    cell: (info) => {
      const r = info.row.original
      return `${r.ftMade}/${r.ftAtt} (${pct(r.ftMade, r.ftAtt)})`
    }
  }),
  columnHelper.accessor('rebOff', { header: 'Reb.Off' }),
  columnHelper.accessor('rebDef', { header: 'Reb.Def' }),
  columnHelper.accessor('ast', { header: 'Ast' }),
  columnHelper.accessor('stl', { header: 'Int' }),
  columnHelper.accessor('blk', { header: 'Ctr' }),
  columnHelper.accessor('tov', { header: 'BP' }),
  columnHelper.accessor('fouls', { header: 'Fte' })
]

const systemColumnHelper = createColumnHelper<SystemStatsRow>()

const systemColumns = [
  systemColumnHelper.accessor('systemName', { header: 'Système' }),
  systemColumnHelper.accessor('runs', { header: 'Actions' }),
  systemColumnHelper.accessor('points', { header: 'Pts' }),
  systemColumnHelper.display({
    id: 'fg2',
    header: '2pts',
    cell: (info) => {
      const r = info.row.original
      return `${r.fg2Made}/${r.fg2Att} (${pct(r.fg2Made, r.fg2Att)})`
    }
  }),
  systemColumnHelper.display({
    id: 'fg3',
    header: '3pts',
    cell: (info) => {
      const r = info.row.original
      return `${r.fg3Made}/${r.fg3Att} (${pct(r.fg3Made, r.fg3Att)})`
    }
  }),
  systemColumnHelper.display({
    id: 'ft',
    header: 'LF',
    cell: (info) => {
      const r = info.row.original
      return `${r.ftMade}/${r.ftAtt} (${pct(r.ftMade, r.ftAtt)})`
    }
  }),
  systemColumnHelper.accessor('tov', { header: 'BP' }),
  systemColumnHelper.display({
    id: 'ppp',
    header: 'Pts/action',
    cell: (info) => info.row.original.pointsPerRun.toFixed(2)
  })
]

function StatsView(): ReactElement {
  const project = useAppStore((s) => s.currentProject)
  const events = useAppStore((s) => s.events)
  const players = useAppStore((s) => s.players)
  const shots = useAppStore((s) => s.shots)
  const systems = useAppStore((s) => s.systems)
  const eventTypes = useAppStore((s) => s.eventTypes)
  const [exporting, setExporting] = useState(false)
  const [exportedPath, setExportedPath] = useState<string | null>(null)
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null)
  const [selectedSystemId, setSelectedSystemId] = useState<number | null>(null)

  const data = useMemo(() => computePlayerStats(events, players), [events, players])
  const totalsRow = useMemo(() => computeTotalsRow(data), [data])
  const systemData = useMemo(() => computeSystemStats(events, systems), [events, systems])

  const customEventTypes = useMemo(
    () => eventTypes.filter((t) => t.category === 'CUSTOM'),
    [eventTypes]
  )
  const customData = useMemo(
    () => computeCustomActionStats(events, players, customEventTypes),
    [events, players, customEventTypes]
  )
  const customColumnHelper = useMemo(() => createColumnHelper<CustomActionStatsRow>(), [])
  const customColumns = useMemo(
    () => [
      customColumnHelper.accessor('playerLabel', { header: 'Joueur' }),
      ...customEventTypes.map((t) =>
        customColumnHelper.display({
          id: `custom-${t.id}`,
          header: t.label,
          cell: (info) => info.row.original.counts[t.id] ?? 0
        })
      ),
      customColumnHelper.accessor('total', { header: 'Total' })
    ],
    [customColumnHelper, customEventTypes]
  )
  const customTable = useReactTable({
    data: customData,
    columns: customColumns,
    getCoreRowModel: getCoreRowModel()
  })

  async function handleExport(format: 'csv' | 'xlsx'): Promise<void> {
    if (!project) return
    setExporting(true)
    setExportedPath(null)
    try {
      const result = await window.houd.statsExport({ projectId: project.id, format })
      setExportedPath(result.filePath)
    } catch (err) {
      alert(`Erreur export stats : ${err}`)
    } finally {
      setExporting(false)
    }
  }

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel()
  })

  const systemTable = useReactTable({
    data: systemData,
    columns: systemColumns,
    getCoreRowModel: getCoreRowModel()
  })

  const eventsById = useMemo(() => new Map(events.map((e) => [e.id, e])), [events])

  const shotPoints: ShotPoint[] = useMemo(() => {
    return shots
      .filter((s) => {
        const event = eventsById.get(s.eventId)
        if (!event) return false
        if (selectedPlayerId != null) return event.playerId === selectedPlayerId
        if (selectedSystemId != null) return event.systemId === selectedSystemId
        return true
      })
      .map((s) => {
        const event = eventsById.get(s.eventId)
        return { x: s.x, y: s.y, made: event?.eventTypeIsMade ?? null }
      })
  }, [shots, eventsById, selectedPlayerId, selectedSystemId])

  const shotChartTitle = (() => {
    if (selectedPlayerId != null) {
      const p = data.find((r) => r.playerId === selectedPlayerId)
      return p ? `Shot chart — ${p.playerLabel}` : 'Shot chart'
    }
    if (selectedSystemId != null) {
      const s = systemData.find((r) => r.systemId === selectedSystemId)
      return s ? `Shot chart — ${s.systemName}` : 'Shot chart'
    }
    return 'Shot chart — équipe'
  })()

  function togglePlayerSelection(playerId: number): void {
    setSelectedSystemId(null)
    setSelectedPlayerId((prev) => (prev === playerId ? null : playerId))
  }

  function toggleSystemSelection(systemId: number): void {
    setSelectedPlayerId(null)
    setSelectedSystemId((prev) => (prev === systemId ? null : systemId))
  }

  return (
    <div className="stats-view">
      <div className="stats-top-row">
        <div className="stats-table-wrap">
          <div className="stats-export-bar">
            <button disabled={exporting} onClick={() => handleExport('csv')}>
              Export CSV
            </button>
            <button disabled={exporting} onClick={() => handleExport('xlsx')}>
              Export Excel
            </button>
            {exportedPath && <span className="export-success">Exporté : {exportedPath}</span>}
          </div>
          <table className="stats-table">
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((h) => (
                    <th key={h.id}>{flexRender(h.column.columnDef.header, h.getContext())}</th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className={
                    selectedPlayerId === row.original.playerId ? 'stats-row-clickable stats-row-selected' : 'stats-row-clickable'
                  }
                  onClick={() => togglePlayerSelection(row.original.playerId)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                  ))}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="stats-total-row">
                <td>{totalsRow.playerLabel}</td>
                <td>{totalsRow.points}</td>
                <td>
                  {totalsRow.fg2Made}/{totalsRow.fg2Att} ({pct(totalsRow.fg2Made, totalsRow.fg2Att)})
                </td>
                <td>
                  {totalsRow.fg3Made}/{totalsRow.fg3Att} ({pct(totalsRow.fg3Made, totalsRow.fg3Att)})
                </td>
                <td>
                  {totalsRow.ftMade}/{totalsRow.ftAtt} ({pct(totalsRow.ftMade, totalsRow.ftAtt)})
                </td>
                <td>{totalsRow.rebOff}</td>
                <td>{totalsRow.rebDef}</td>
                <td>{totalsRow.ast}</td>
                <td>{totalsRow.stl}</td>
                <td>{totalsRow.blk}</td>
                <td>{totalsRow.tov}</td>
                <td>{totalsRow.fouls}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="stats-shotchart">
          <h3>
            {shotChartTitle} ({shotPoints.length} tirs)
          </h3>
          {(selectedPlayerId != null || selectedSystemId != null) && (
            <button
              className="shotchart-reset-btn"
              onClick={() => {
                setSelectedPlayerId(null)
                setSelectedSystemId(null)
              }}
            >
              Voir toute l'équipe
            </button>
          )}
          <ShotChartCourt shots={shotPoints} />
          <p className="shotchart-legend">
            <span className="legend-dot made" /> marqué &nbsp;
            <span className="legend-dot missed" /> manqué
          </p>
        </div>
      </div>

      <div className="stats-systems">
        <h3>Systèmes de jeu</h3>
        {systemData.length === 0 && <p>Aucun système tagué pour l'instant.</p>}
        {systemData.length > 0 && (
          <table className="stats-table">
            <thead>
              {systemTable.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((h) => (
                    <th key={h.id}>{flexRender(h.column.columnDef.header, h.getContext())}</th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {systemTable.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className={
                    selectedSystemId === row.original.systemId
                      ? 'stats-row-clickable stats-row-selected'
                      : 'stats-row-clickable'
                  }
                  onClick={() => toggleSystemSelection(row.original.systemId)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {customEventTypes.length > 0 && (
        <div className="stats-custom-actions">
          <h3>Actions personnalisées</h3>
          <table className="stats-table">
            <thead>
              {customTable.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((h) => (
                    <th key={h.id}>{flexRender(h.column.columnDef.header, h.getContext())}</th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {customTable.getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default StatsView
