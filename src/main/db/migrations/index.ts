import m001Init from './001_init.sql?raw'
import m002Systems from './002_systems.sql?raw'
import m003SystemsActiveAndAutoPlaylist from './003_systems_active_and_auto_playlist.sql?raw'

export interface Migration {
  name: string
  sql: string
}

export const migrations: Migration[] = [
  { name: '001_init.sql', sql: m001Init },
  { name: '002_systems.sql', sql: m002Systems },
  { name: '003_systems_active_and_auto_playlist.sql', sql: m003SystemsActiveAndAutoPlaylist }
]
