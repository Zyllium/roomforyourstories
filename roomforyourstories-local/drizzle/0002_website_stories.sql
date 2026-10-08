CREATE TABLE IF NOT EXISTS website_stories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  request TEXT NOT NULL UNIQUE,
  digest TEXT NOT NULL,
  text TEXT NOT NULL,
  created INTEGER NOT NULL,
  deleted INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS website_stories_visible ON website_stories(deleted, id);
