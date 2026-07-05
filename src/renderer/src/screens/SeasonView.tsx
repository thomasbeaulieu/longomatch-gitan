import { useEffect, useMemo, useState, type ReactElement } from 'react'
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import type { SeasonPlayerStatsRow, SeasonShotPoint } from '@shared/types'
import { useAppStore } from '../state/store'
import { pct } from '../lib/stats'
import ShotChartCourt from '../components/ShotChartCourt'
import type { ShotPoint } from '../components/ShotChartCourt'

const columnHelper = createColumnHelper<SeasonPlayerStatsRow>()

const columns = [
  columnHelper.accessor('playerName', { header: 'Joueur' }),
  columnHelper.accessor('matchesPlayed', { header: 'Matchs' }),
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

function SeasonView(): ReactElement {
  const goHome = useAppStore((s) => s.goHome)
  const [loading, setLoading] = useState(true)
  const [players, setPlayers] = useState<SeasonPlayerStatsRow[]>([])
  const [shots, setShots] = useState<SeasonShotPoint[]>([])
  const [selectedPlayerName, setSelectedPlayerName] = useState<string | null>(null)

  useEffect(() => {
    window.houd
      .seasonStats()
      .then((result) => {
        setPlayers(result.players)
        setShots(result.shots)
      })
      .finally(() => setLoading(false))
  }, [])

  const table = useReactTable({
    data: players,
    columns,
    getCoreRowModel: getCoreRowModel()
  })

  function togglePlayerSelection(name: string): void {
    setSelectedPlayerName((prev) => (prev === name ? null : name))
  }

  const shotPoints: ShotPoint[] = useMemo(() => {
    return shots
      .filter((s) => selectedPlayerName == null || s.playerName === selectedPlayerName)
      .map((s) => ({ x: s.x, y: s.y, made: s.made }))
  }, [shots, selectedPlayerName])

  const shotChartTitle = selectedPlayerName
    ? `Shot chart — ${selectedPlayerName}`
    : 'Shot chart — saison complète'

  return (
    <div className="project-home season-view">
      <button className="back-btn" onClick={goHome}>
        ← Retour à l'accueil
      </button>
      <h1>Vue saison — tous les matchs</h1>

      {loading && <p>Chargement...</p>}
      {!loading && players.length === 0 && <p>Aucune donnée pour l'instant.</p>}

      {!loading && players.length > 0 && (
        <div className="stats-top-row">
          <div className="stats-table-wrap">
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
                      selectedPlayerName === row.original.playerName
                        ? 'stats-row-clickable stats-row-selected'
                        : 'stats-row-clickable'
                    }
                    onClick={() => togglePlayerSelection(row.original.playerName)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="stats-shotchart">
            <h3>
              {shotChartTitle} ({shotPoints.length} tirs)
            </h3>
            {selectedPlayerName != null && (
              <button className="shotchart-reset-btn" onClick={() => setSelectedPlayerName(null)}>
                Voir toute la saison
              </button>
            )}
            <ShotChartCourt shots={shotPoints} />
            <p className="shotchart-legend">
              <span className="legend-dot made" /> marqué &nbsp;
              <span className="legend-dot missed" /> manqué
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default SeasonView
