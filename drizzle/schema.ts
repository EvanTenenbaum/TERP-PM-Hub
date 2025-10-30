import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, json } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Chat conversations with AI agents
 * Each conversation is with a specific agent type (inbox, planning, qa)
 */
export const conversations = mysqlTable("conversations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  agentType: mysqlEnum("agentType", ["inbox", "planning", "qa", "expert"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  /** Related item ID if conversation is about specific feature/idea/bug */
  relatedItemId: varchar("relatedItemId", { length: 64 }),
  /** Conversation metadata (context, settings, etc.) */
  metadata: json("metadata").$type<Record<string, any>>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = typeof conversations.$inferInsert;

/**
 * Messages within conversations
 */
export const messages = mysqlTable("messages", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: int("conversationId").notNull(),
  role: mysqlEnum("role", ["user", "assistant", "system"]).notNull(),
  content: text("content").notNull(),
  /** Message metadata (tokens used, processing time, etc.) */
  metadata: json("metadata").$type<Record<string, any>>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

/**
 * PM items (features, ideas, bugs, improvements)
 * Synced from GitHub product-management directory
 */
export const pmItems = mysqlTable("pmItems", {
  id: int("id").autoincrement().primaryKey(),
  /** Unique ID from PM system (e.g., TERP-FEAT-001) */
  itemId: varchar("itemId", { length: 64 }).notNull().unique(),
  type: mysqlEnum("type", ["IDEA", "FEAT", "BUG", "IMPROVE", "TECH"]).notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  status: mysqlEnum("status", ["inbox", "backlog", "planned", "in-progress", "completed", "on-hold", "archived"]).notNull(),
  /** Priority level */
  priority: mysqlEnum("priority", ["low", "medium", "high", "critical"]).default("medium"),
  /** Tags as JSON array */
  tags: json("tags").$type<string[]>(),
  /** Related item IDs as JSON array */
  related: json("related").$type<string[]>(),
  /** GitHub file path */
  githubPath: varchar("githubPath", { length: 500 }),
  /** Full metadata from GitHub */
  metadata: json("metadata").$type<Record<string, any>>(),
  /** AI-generated suggestions for where/how to apply feedback */
  aiSuggestions: json("aiSuggestions").$type<{
    where: string[];
    how: string;
    confidence: number;
    generatedAt: string;
  }>(),
  /** Last sync timestamp */
  lastSyncedAt: timestamp("lastSyncedAt"),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
});

export type PmItem = typeof pmItems.$inferSelect;
export type InsertPmItem = typeof pmItems.$inferInsert;

/**
 * GitHub sync status
 * Tracks last sync time and errors
 */
export const githubSync = mysqlTable("githubSync", {
  id: int("id").autoincrement().primaryKey(),
  /** What was synced (codebase, features, ideas, etc.) */
  syncType: varchar("syncType", { length: 64 }).notNull(),
  /** Sync status */
  status: mysqlEnum("status", ["success", "failed", "in-progress"]).notNull(),
  /** Number of items synced */
  itemCount: int("itemCount").default(0),
  /** Error message if failed */
  error: text("error"),
  /** Sync metadata (duration, changes, etc.) */
  metadata: json("metadata").$type<Record<string, any>>(),
  startedAt: timestamp("startedAt").notNull(),
  completedAt: timestamp("completedAt"),
});

export type GithubSync = typeof githubSync.$inferSelect;
export type InsertGithubSync = typeof githubSync.$inferInsert;

/**
 * Implementation Queue
 * Structured work items ready for agent implementation
 * All development tasks flow through this queue before going to Manus agent
 */
export const implementationQueue = mysqlTable("implementationQueue", {
  id: int("id").autoincrement().primaryKey(),
  /** Reference to original PM item */
  pmItemId: varchar("pmItemId", { length: 64 }).notNull(),
  /** Work item title */
  title: varchar("title", { length: 500 }).notNull(),
  /** Detailed description */
  description: text("description").notNull(),
  /** LLM-generated diagnosis of what needs to be done */
  diagnosis: text("diagnosis").notNull(),
  /** Priority level (auto-calculated + user-adjustable) */
  priority: mysqlEnum("priority", ["critical", "high", "medium", "low"]).notNull(),
  /** Estimated implementation time in minutes */
  estimatedMinutes: int("estimatedMinutes").notNull(),
  /** Dependencies (array of pmItemIds that must be completed first) */
  dependencies: json("dependencies").$type<string[]>(),
  /** QA requirements and acceptance criteria */
  qaRequirements: text("qaRequirements").notNull(),
  /** Step-by-step implementation guide */
  implementationSteps: json("implementationSteps").$type<string[]>().notNull(),
  /** Current status */
  status: mysqlEnum("status", ["queued", "in-progress", "completed", "blocked"]).default("queued").notNull(),
  /** Order in queue (for manual reordering) */
  queueOrder: int("queueOrder").default(0),
  /** Optional assignment for team features */
  assignedTo: varchar("assignedTo", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export type ImplementationQueueItem = typeof implementationQueue.$inferSelect;
export type InsertImplementationQueueItem = typeof implementationQueue.$inferInsert;

/**
 * User preferences and settings
 */
export const userPreferences = mysqlTable("userPreferences", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  /** Preferred agent for quick access */
  defaultAgent: mysqlEnum("defaultAgent", ["inbox", "planning", "qa", "expert"]).default("inbox"),
  /** UI preferences */
  uiSettings: json("uiSettings").$type<Record<string, any>>(),
  /** Notification preferences */
  notificationSettings: json("notificationSettings").$type<Record<string, any>>(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserPreference = typeof userPreferences.$inferSelect;
export type InsertUserPreference = typeof userPreferences.$inferInsert;
