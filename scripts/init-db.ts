import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import * as schema from '../drizzle/schema';

const dbPath = process.env.DATABASE_URL?.replace('file:', '') || './.manus/db/sqlite.db';

console.log(`Initializing database at: ${dbPath}`);

const sqlite = new Database(dbPath);
const db = drizzle(sqlite, { schema });

// Create tables manually since migrations are MySQL-specific
console.log('Creating tables...');

sqlite.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    openId TEXT NOT NULL UNIQUE,
    name TEXT,
    email TEXT,
    avatarUrl TEXT,
    manusApiKey TEXT,
    apiKeyUpdatedAt INTEGER,
    createdAt INTEGER NOT NULL DEFAULT (unixepoch()),
    updatedAt INTEGER NOT NULL DEFAULT (unixepoch())
  );

  CREATE TABLE IF NOT EXISTS pmItems (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('idea', 'bug', 'improvement')),
    status TEXT NOT NULL CHECK(status IN ('inbox', 'triaged', 'prd_generated', 'in_queue', 'completed', 'archived')),
    priority TEXT CHECK(priority IN ('low', 'medium', 'high', 'critical')),
    diagnosis TEXT,
    prd TEXT,
    githubIssueUrl TEXT,
    createdBy TEXT NOT NULL,
    createdAt INTEGER NOT NULL DEFAULT (unixepoch()),
    updatedAt INTEGER NOT NULL DEFAULT (unixepoch()),
    FOREIGN KEY (createdBy) REFERENCES users(openId)
  );

  CREATE TABLE IF NOT EXISTS conversations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pmItemId TEXT NOT NULL,
    title TEXT NOT NULL,
    createdAt INTEGER NOT NULL DEFAULT (unixepoch()),
    updatedAt INTEGER NOT NULL DEFAULT (unixepoch()),
    FOREIGN KEY (pmItemId) REFERENCES pmItems(id)
  );

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    conversationId INTEGER NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    createdAt INTEGER NOT NULL DEFAULT (unixepoch()),
    FOREIGN KEY (conversationId) REFERENCES conversations(id)
  );

  CREATE TABLE IF NOT EXISTS githubSync (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pmItemId TEXT NOT NULL,
    githubIssueNumber INTEGER NOT NULL,
    githubIssueUrl TEXT NOT NULL,
    syncedAt INTEGER NOT NULL DEFAULT (unixepoch()),
    FOREIGN KEY (pmItemId) REFERENCES pmItems(id)
  );

  CREATE TABLE IF NOT EXISTS implementationQueue (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pmItemId TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    diagnosis TEXT NOT NULL,
    priority TEXT NOT NULL CHECK(priority IN ('low', 'medium', 'high', 'critical')),
    estimatedMinutes INTEGER NOT NULL,
    dependencies TEXT,
    status TEXT NOT NULL CHECK(status IN ('pending', 'in_progress', 'completed', 'blocked')),
    assignedTo TEXT,
    queuePosition INTEGER NOT NULL,
    createdAt INTEGER NOT NULL DEFAULT (unixepoch()),
    updatedAt INTEGER NOT NULL DEFAULT (unixepoch()),
    startedAt INTEGER,
    completedAt INTEGER,
    FOREIGN KEY (pmItemId) REFERENCES pmItems(id),
    FOREIGN KEY (assignedTo) REFERENCES users(openId)
  );

  CREATE INDEX IF NOT EXISTS idx_pmItems_status ON pmItems(status);
  CREATE INDEX IF NOT EXISTS idx_pmItems_createdBy ON pmItems(createdBy);
  CREATE INDEX IF NOT EXISTS idx_conversations_pmItemId ON conversations(pmItemId);
  CREATE INDEX IF NOT EXISTS idx_messages_conversationId ON messages(conversationId);
  CREATE INDEX IF NOT EXISTS idx_implementationQueue_status ON implementationQueue(status);
  CREATE INDEX IF NOT EXISTS idx_implementationQueue_queuePosition ON implementationQueue(queuePosition);
`);

console.log('✅ Database initialized successfully!');
console.log('✅ All tables created including new API key fields in users table');

sqlite.close();
