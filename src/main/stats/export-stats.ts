import { writeFileSync } from 'fs'
import ExcelJS from 'exceljs'
import type { PlayerStatsRow } from './compute-stats'

const HEADERS = [
  'Joueur',
  'Pts',
  '2pts M',
  '2pts T',
  '3pts M',
  '3pts T',
  'LF M',
  'LF T',
  'Reb.Off',
  'Reb.Def',
  'Ast',
  'Int',
  'Ctr',
  'BP',
  'Fte'
]

function toRowArray(r: PlayerStatsRow): (string | number)[] {
  return [
    r.playerLabel,
    r.points,
    r.fg2Made,
    r.fg2Att,
    r.fg3Made,
    r.fg3Att,
    r.ftMade,
    r.ftAtt,
    r.rebOff,
    r.rebDef,
    r.ast,
    r.stl,
    r.blk,
    r.tov,
    r.fouls
  ]
}

export function writeStatsCsv(rows: PlayerStatsRow[], filePath: string): void {
  const lines = [HEADERS.join(';'), ...rows.map((r) => toRowArray(r).join(';'))]
  writeFileSync(filePath, lines.join('\n'), 'utf-8')
}

export async function writeStatsXlsx(rows: PlayerStatsRow[], filePath: string): Promise<void> {
  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet('Stats')
  sheet.addRow(HEADERS)
  for (const r of rows) sheet.addRow(toRowArray(r))
  sheet.getRow(1).font = { bold: true }
  sheet.columns.forEach((col) => {
    col.width = 14
  })
  await workbook.xlsx.writeFile(filePath)
}
