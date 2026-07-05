CREATE TABLE IF NOT EXISTS systems (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id    INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

ALTER TABLE events ADD COLUMN system_id INTEGER REFERENCES systems(id) ON DELETE SET NULL;
