/**
 * Helper utilities for retrieving and using per-user API keys for LLM operations.
 */

import { TRPCError } from "@trpc/server";
import * as db from "../db";
import { decrypt } from "./encryption";

/**
 * Retrieves a user's decrypted Manus API key from the database.
 * Throws an error if the user doesn't have an API key configured.
 * 
 * @param openId - The user's Manus OAuth identifier
 * @returns The decrypted API key
 * @throws TRPCError if user not found or API key not configured
 */
export async function getUserApiKey(openId: string): Promise<string> {
  const user = await db.getUserByOpenId(openId);
  
  if (!user) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'User not found',
    });
  }

  if (!user.manusApiKey) {
    throw new TRPCError({
      code: 'PRECONDITION_FAILED',
      message: 'Please configure your Manus API key in Settings to use AI features. This ensures your Manus account is charged for AI operations.',
    });
  }

  try {
    return decrypt(user.manusApiKey);
  } catch (error) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to decrypt API key. Please update your API key in Settings.',
    });
  }
}

/**
 * Attempts to retrieve a user's API key, but returns undefined if not configured.
 * Useful for optional AI features that can fall back to system key.
 * 
 * @param openId - The user's Manus OAuth identifier
 * @returns The decrypted API key or undefined if not configured
 */
export async function getUserApiKeyOptional(openId: string): Promise<string | undefined> {
  try {
    return await getUserApiKey(openId);
  } catch (error) {
    if (error instanceof TRPCError && error.code === 'PRECONDITION_FAILED') {
      return undefined;
    }
    throw error;
  }
}
