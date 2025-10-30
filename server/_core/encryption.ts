/**
 * Simple encryption/decryption utilities for sensitive data like API keys.
 * Uses AES-256-GCM for encryption with a key derived from environment variable.
 */

import crypto from 'crypto';
import { ENV } from './env';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;
const ITERATIONS = 100000;

/**
 * Derives an encryption key from the cookie secret.
 * In production, ensure JWT_SECRET/cookieSecret is set to a secure value.
 */
function getEncryptionKey(): Buffer {
  const secret = ENV.cookieSecret;
  if (!secret) {
    throw new Error('JWT_SECRET must be set for encryption');
  }
  
  // Use a fixed salt for key derivation
  const salt = Buffer.from('terp-pm-hub-encryption-salt-v1');
  return crypto.pbkdf2Sync(secret, salt, ITERATIONS, KEY_LENGTH, 'sha256');
}

/**
 * Encrypts a string value (like an API key).
 * Returns a base64-encoded string containing: iv + tag + encrypted data
 */
export function encrypt(plaintext: string): string {
  if (!plaintext) {
    throw new Error('Cannot encrypt empty value');
  }

  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const tag = cipher.getAuthTag();

  // Combine iv + tag + encrypted data
  const combined = Buffer.concat([
    iv,
    tag,
    Buffer.from(encrypted, 'hex')
  ]);

  return combined.toString('base64');
}

/**
 * Decrypts a value encrypted with encrypt().
 * Expects a base64-encoded string containing: iv + tag + encrypted data
 */
export function decrypt(encryptedData: string): string {
  if (!encryptedData) {
    throw new Error('Cannot decrypt empty value');
  }

  try {
    const key = getEncryptionKey();
    const combined = Buffer.from(encryptedData, 'base64');

    // Extract iv, tag, and encrypted data
    const iv = combined.subarray(0, IV_LENGTH);
    const tag = combined.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
    const encrypted = combined.subarray(IV_LENGTH + TAG_LENGTH);

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString('utf8');
  } catch (error) {
    throw new Error(`Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Validates that a string looks like a Manus API key.
 * Basic format validation only - does not verify the key works.
 */
export function validateApiKeyFormat(apiKey: string): boolean {
  if (!apiKey || typeof apiKey !== 'string') {
    return false;
  }

  // Manus API keys should be non-empty strings
  return apiKey.trim().length > 10;
}
