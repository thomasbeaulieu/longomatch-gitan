CREATE TABLE IF NOT EXISTS projects (
  id                 INTEGER PRIMARY KEY AUTOINCREMENT,
  name               TEXT NOT NULL,
  video_path         TEXT NOT NULL,
  video_duration_ms  INTEGER,
  video_fps          REAL,
  video_width        INTEGER,
  video_height       INTEGER,
  created_at         TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at         TEXT NOT NULL DEFAULT (datetime('now')),
  notes              TEXT
);

CREATE TABLE IF NOT EXISTS teams (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id    INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  is_home       INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS players (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  team_id       INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  first_name    TEXT NOT NULL,
  last_name     TEXT NOT NULL,
  jersey_number INTEGER,
  position      TEXT,
  photo_path    TEXT,
  is_active     INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS event_types (
  id                      INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id              INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  code                    TEXT NOT NULL,
  label                   TEXT NOT NULL,
  category                TEXT NOT NULL,
  points                  INTEGER DEFAULT 0,
  is_made                 INTEGER,
  requires_shot_location  INTEGER NOT NULL DEFAULT 0,
  hotkey                  TEXT,
  color                   TEXT,
  sort_order              INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS events (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id          INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  event_type_id       INTEGER NOT NULL REFERENCES event_types(id),
  player_id           INTEGER REFERENCES players(id) ON DELETE SET NULL,
  quarter             INTEGER NOT NULL,
  video_timestamp_ms  INTEGER NOT NULL,
  clip_start_ms       INTEGER,
  clip_end_ms         INTEGER,
  notes               TEXT,
  created_at          TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_events_project_time ON events(project_id, video_timestamp_ms);

CREATE TABLE IF NOT EXISTS shots (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id      INTEGER NOT NULL UNIQUE REFERENCES events(id) ON DELETE CASCADE,
  x             REAL NOT NULL,
  y             REAL NOT NULL,
  distance_ft   REAL
);

CREATE TABLE IF NOT EXISTS drawings (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id      INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  shape_type    TEXT NOT NULL,
  data_json     TEXT NOT NULL,
  color         TEXT NOT NULL DEFAULT '#FF3B30',
  stroke_width  REAL NOT NULL DEFAULT 4
);

CREATE TABLE IF NOT EXISTS clips (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id    INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  event_id      INTEGER REFERENCES events(id) ON DELETE SET NULL,
  file_path     TEXT NOT NULL,
  start_ms      INTEGER NOT NULL,
  end_ms        INTEGER NOT NULL,
  has_overlay   INTEGER NOT NULL DEFAULT 0,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS playlists (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id    INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS playlist_items (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  playlist_id   INTEGER NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
  event_id      INTEGER REFERENCES events(id) ON DELETE SET NULL,
  clip_id       INTEGER REFERENCES clips(id) ON DELETE SET NULL,
  sort_order    INTEGER NOT NULL DEFAULT 0
);
