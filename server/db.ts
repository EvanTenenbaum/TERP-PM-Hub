import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, pmItems, InsertPmItem, conversations, InsertConversation, messages, InsertMessage, githubSync, InsertGithubSync } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// PM Items

export async function upsertPMItem(item: InsertPmItem) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert PM item: database not available");
    return;
  }

  await db.insert(pmItems).values(item).onDuplicateKeyUpdate({
    set: {
      title: item.title,
      description: item.description,
      status: item.status,
      tags: item.tags,
      related: item.related,
      metadata: item.metadata,
      lastSyncedAt: new Date(),
      updatedAt: item.updatedAt,
    },
  });
}

export async function getAllPMItems() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get PM items: database not available");
    return [];
  }

  return await db.select().from(pmItems);
}

export async function getPMItemById(itemId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get PM item: database not available");
    return null;
  }

  const result = await db.select().from(pmItems).where(eq(pmItems.itemId, itemId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updatePMItem(id: number, updates: Partial<InsertPmItem>) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update PM item: database not available");
    return null;
  }

  await db.update(pmItems).set({
    ...updates,
    updatedAt: new Date()
  }).where(eq(pmItems.id, id));
  
  const result = await db.select().from(pmItems).where(eq(pmItems.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function deletePMItem(id: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete PM item: database not available");
    return;
  }

  await db.delete(pmItems).where(eq(pmItems.id, id));
}

// Conversations

export async function createConversation(conversation: InsertConversation) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create conversation: database not available");
    return null;
  }

  const result = await db.insert(conversations).values(conversation);
  return result[0].insertId;
}

export async function getUserConversations(userId: number, agentType?: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get conversations: database not available");
    return [];
  }

  if (agentType) {
    return await db.select().from(conversations).where(eq(conversations.userId, userId));
  }

  return await db.select().from(conversations).where(eq(conversations.userId, userId));
}

export async function getConversationById(id: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get conversation: database not available");
    return null;
  }

  const result = await db.select().from(conversations).where(eq(conversations.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

// Messages

export async function createMessage(message: InsertMessage) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create message: database not available");
    return null;
  }

  const result = await db.insert(messages).values(message);
  return result[0].insertId;
}

export async function getConversationMessages(conversationId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get messages: database not available");
    return [];
  }

  return await db.select().from(messages).where(eq(messages.conversationId, conversationId));
}

// GitHub Sync

export async function createSyncRecord(sync: InsertGithubSync) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create sync record: database not available");
    return null;
  }

  const result = await db.insert(githubSync).values(sync);
  return result[0].insertId;
}

export async function updateSyncRecord(id: number, updates: Partial<InsertGithubSync>) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update sync record: database not available");
    return;
  }

  await db.update(githubSync).set(updates as any).where(eq(githubSync.id, id));
}

export async function getLatestSync(syncType: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get latest sync: database not available");
    return null;
  }

  const result = await db.select().from(githubSync).where(eq(githubSync.syncType, syncType)).orderBy(githubSync.startedAt).limit(1);
  return result.length > 0 ? result[0] : null;
}
