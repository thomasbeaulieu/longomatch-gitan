import { getDb } from '../connection'

export interface PlaylistRow {
  id: number
  project_id: number
  name: string
  auto_player_id: number | null
  created_at: string
}

export interface PlaylistItemRow {
  id: number
  playlist_id: number
  event_id: number | null
  clip_id: number | null
  sort_order: number
}

export function createPlaylist(input: {
  projectId: number
  name: string
  autoPlayerId?: number | null
}): PlaylistRow {
  const db = getDb()
  const info = db
    .prepare('INSERT INTO playlists (project_id, name, auto_player_id) VALUES (?, ?, ?)')
    .run(input.projectId, input.name, input.autoPlayerId ?? null)
  return db.prepare('SELECT * FROM playlists WHERE id = ?').get(info.lastInsertRowid) as PlaylistRow
}

export function listPlaylistsByProject(projectId: number): PlaylistRow[] {
  return getDb()
    .prepare('SELECT * FROM playlists WHERE project_id = ? ORDER BY created_at')
    .all(projectId) as PlaylistRow[]
}

export function deletePlaylist(id: number): void {
  getDb().prepare('DELETE FROM playlists WHERE id = ?').run(id)
}

export function getAutoPlaylistForPlayer(
  projectId: number,
  playerId: number
): PlaylistRow | undefined {
  return getDb()
    .prepare('SELECT * FROM playlists WHERE project_id = ? AND auto_player_id = ?')
    .get(projectId, playerId) as PlaylistRow | undefined
}

export function addPlaylistItem(input: {
  playlistId: number
  eventId: number
  sortOrder: number
}): PlaylistItemRow {
  const db = getDb()
  const info = db
    .prepare(
      'INSERT INTO playlist_items (playlist_id, event_id, sort_order) VALUES (@playlistId, @eventId, @sortOrder)'
    )
    .run(input)
  return db
    .prepare('SELECT * FROM playlist_items WHERE id = ?')
    .get(info.lastInsertRowid) as PlaylistItemRow
}

export function removePlaylistItem(id: number): void {
  getDb().prepare('DELETE FROM playlist_items WHERE id = ?').run(id)
}

export function listPlaylistItems(playlistId: number): PlaylistItemRow[] {
  return getDb()
    .prepare('SELECT * FROM playlist_items WHERE playlist_id = ? ORDER BY sort_order')
    .all(playlistId) as PlaylistItemRow[]
}

export function listPlaylistItemsByProject(projectId: number): PlaylistItemRow[] {
  return getDb()
    .prepare(
      `SELECT pi.* FROM playlist_items pi JOIN playlists p ON p.id = pi.playlist_id WHERE p.project_id = ? ORDER BY pi.sort_order`
    )
    .all(projectId) as PlaylistItemRow[]
}

export function reorderPlaylistItem(id: number, sortOrder: number): void {
  getDb().prepare('UPDATE playlist_items SET sort_order = ? WHERE id = ?').run(sortOrder, id)
}
