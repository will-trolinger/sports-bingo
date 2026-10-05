-- Usernames are first come, first served and compared without case, so
-- "Will" and "will" cannot both exist.
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  username TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT NOT NULL,
  password_salt TEXT NOT NULL,
  created_at TEXT NOT NULL
);

-- Only a hash of each session token is stored, so a leaked database cannot
-- be used to log in as anyone.
CREATE TABLE sessions (
  token_hash TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL
);
CREATE INDEX sessions_user ON sessions(user_id);

-- One row per card, saved from its first tap. has_bingo and is_blackout
-- describe the current marks (the server works them out, never the
-- browser); first_bingo_at and blackout_at record when each first
-- happened. mode is "blackout" once the player chose to keep going.
CREATE TABLE boards (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sport TEXT NOT NULL,
  cells TEXT NOT NULL,
  marks TEXT NOT NULL,
  mode TEXT NOT NULL DEFAULT 'playing',
  has_bingo INTEGER NOT NULL DEFAULT 0,
  is_blackout INTEGER NOT NULL DEFAULT 0,
  first_bingo_at TEXT,
  blackout_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  finished_at TEXT
);
-- A player has at most one card in play per sport.
CREATE UNIQUE INDEX boards_one_active ON boards(user_id, sport) WHERE finished_at IS NULL;
CREATE INDEX boards_history ON boards(user_id, has_bingo, first_bingo_at);
