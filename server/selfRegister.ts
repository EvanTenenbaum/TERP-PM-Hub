import { z } from 'zod';
import * as db from './db';

export const SelfRegisterSchema = z.object({
  itemId: z.string().optional(),
  type: z.enum(['FEAT', 'IDEA', 'BUG', 'IMPROVE', 'TECH']),
  title: z.string(),
  description: z.string(),
  action: z.enum(['created', 'updated', 'completed', 'tested', 'documented']),
  filesModified: z.array(z.string()).optional(),
  commitHash: z.string().optional(),
  prUrl: z.string().optional(),
  chatId: z.string().optional(),
  timestamp: z.string().optional(),
});

export type SelfRegisterInput = z.infer<typeof SelfRegisterSchema>;

export async function processSelfRegistration(input: SelfRegisterInput) {
  const timestamp = input.timestamp ? new Date(input.timestamp) : new Date();
  
  let status: string;
  switch (input.action) {
    case 'created': status = 'in-progress'; break;
    case 'completed': status = 'completed'; break;
    case 'tested': status = 'completed'; break;
    default: status = 'in-progress';
  }

  const metadata: any = {
    selfRegistered: true,
    chatId: input.chatId,
    action: input.action,
    timestamp: timestamp.toISOString(),
    filesModified: input.filesModified,
    commitHash: input.commitHash,
    prUrl: input.prUrl,
  };

  if (input.itemId) {
    const existing = await db.getPMItemById(input.itemId);
    if (existing) {
      await db.updatePMItem(existing.id, {
        description: input.description,
        status: status as any,
        metadata,
      });
      return { success: true, action: 'updated', itemId: input.itemId };
    }
  }

  // Create new item via upsert
  const newItemId = `TERP-${input.type}-${Date.now().toString().slice(-6)}`;
  await db.upsertPMItem({
    itemId: newItemId,
    type: input.type,
    title: input.title,
    description: input.description || null,
    status: status as any,
    tags: [],
    related: [],
    githubPath: null,
    metadata,
    lastSyncedAt: new Date(),
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  return { success: true, action: 'created', itemId: newItemId };
}
