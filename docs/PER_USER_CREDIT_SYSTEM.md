# Per-User Credit System Documentation

## Overview

The TERP PM Hub now supports **per-user credit usage** for AI operations. This means each logged-in user can configure their own Manus API key, and all AI operations (triage, PRD generation, queue analysis, chat conversations) will charge **their Manus account** instead of the project owner's account.

## How It Works

### 1. User Configuration

Users can configure their Manus API key in the Settings page:

1. Navigate to **Settings** (accessible via `/settings` route or navigation menu)
2. Enter your personal Manus API key
3. Click "Save API Key"

The API key is encrypted before being stored in the database for security.

### 2. AI Operations

When a user with a configured API key performs an AI operation:

1. The system automatically retrieves the user's encrypted API key from the database
2. Decrypts the key
3. Uses it to make the AI API call
4. The user's Manus account is charged for the operation

**No manual parameter passing required** - the system automatically detects the logged-in user and uses their API key.

### 3. Fallback Behavior

If a user has **not** configured their API key:

- AI operations will use the system default API key (project owner's)
- This ensures the system continues to work for users who haven't configured their own keys
- Users can configure their key at any time to start using their own credits

## Architecture

### Database Schema

Added two fields to the `users` table:

```sql
ALTER TABLE `users` ADD `manusApiKey` text;
ALTER TABLE `users` ADD `apiKeyUpdatedAt` timestamp;
```

### Backend Components

1. **Encryption Module** (`server/_core/encryption.ts`)
   - Encrypts API keys before storage using AES-256-GCM
   - Decrypts API keys when needed for AI calls
   - Validates API key format

2. **User API Key Helper** (`server/_core/userApiKey.ts`)
   - `getUserApiKey(openId)`: Retrieves and decrypts user's API key (throws error if not found)
   - `getUserApiKeyOptional(openId)`: Returns undefined if not configured (no error)

3. **LLM Module** (`server/_core/llm.ts`)
   - Updated `InvokeParams` to accept optional `apiKey` parameter
   - Uses provided API key or falls back to system default
   - Modified `invokeLLM()` function to use per-user keys

4. **LLM Smart Module** (`server/_core/llm-smart.ts`)
   - Updated `SmartLLMOptions` to accept `userOpenId`
   - Automatically retrieves user's API key when `userOpenId` is provided
   - Passes API key to `invokeLLM()`

5. **Settings Router** (`server/routers.ts`)
   - `settings.getApiKeyStatus`: Returns whether user has API key configured
   - `settings.setApiKey`: Saves encrypted API key for user
   - `settings.removeApiKey`: Removes user's API key

6. **All AI Procedures** (`server/routers.ts`)
   - Updated all `invokeLLM()` calls to automatically use logged-in user's API key
   - Retrieves API key from context: `ctx.user.openId`
   - Falls back to system key if user hasn't configured their own

### Frontend Components

1. **Settings Page** (`client/src/pages/Settings.tsx`)
   - UI for configuring Manus API key
   - Shows/hides API key input
   - Displays configuration status
   - Provides instructions for obtaining API key

2. **App Router** (`client/src/App.tsx`)
   - Added `/settings` route
   - Integrated Settings page component

## Security

### Encryption

- API keys are encrypted using **AES-256-GCM**
- Encryption key derived from `JWT_SECRET` environment variable
- Keys are only decrypted when making AI API calls

### Access Control

- Users can only view/edit their own API key
- API keys are never returned to the frontend after being saved
- Only the configuration status is exposed via API

### Best Practices

1. **JWT_SECRET**: Ensure `JWT_SECRET` is set to a strong, unique value in production
2. **HTTPS**: Always use HTTPS to protect API keys in transit
3. **Key Rotation**: Users can update their API key at any time
4. **Audit Logging**: Consider adding audit logs for API key changes

## Usage Example

### Backend: Automatic Per-User API Key Usage

```typescript
// In any tRPC procedure with protectedProcedure
someAIProcedure: protectedProcedure
  .input(z.object({ prompt: z.string() }))
  .mutation(async ({ ctx, input }) => {
    // Automatically get user's API key
    const apiKey = ctx.user ? await getUserApiKeyOptional(ctx.user.openId) : undefined;
    
    // Use it for LLM call
    const result = await invokeLLM({
      messages: [{ role: "user", content: input.prompt }],
      apiKey, // Automatically uses user's key or falls back to system key
    });
    
    return result;
  }),
```

### Frontend: Checking API Key Status

```typescript
const { data: apiKeyStatus } = trpc.settings.getApiKeyStatus.useQuery();

if (!apiKeyStatus?.hasApiKey) {
  return (
    <Alert>
      <AlertDescription>
        Configure your Manus API key in Settings to use your own credits.
      </AlertDescription>
    </Alert>
  );
}
```

## Migration Guide

### For Existing Users

1. **No Immediate Action Required**: Existing functionality continues to work with system API key
2. **Configure API Key**: Users can configure their API key in Settings at any time
3. **Gradual Transition**: Users can configure keys at their own pace

### For Administrators

1. **Update Documentation**: Inform users about the new per-user credit system
2. **Monitor Usage**: Track which users have configured API keys
3. **Support**: Help users obtain and configure their Manus API keys

## Troubleshooting

### "Please configure your Manus API key" Error

**Cause**: User has not configured their API key and system key is not available

**Solution**: Navigate to Settings and configure your Manus API key

### "Failed to decrypt API key" Error

**Cause**: API key encryption/decryption failed (possibly due to changed JWT_SECRET)

**Solution**: Remove and re-add your API key in Settings

### "Invalid API key format" Error

**Cause**: The provided API key doesn't meet format requirements

**Solution**: Verify you've copied the complete API key from your Manus account

## Implementation Details

### All Updated AI Operations

The following AI operations now automatically use the logged-in user's API key:

1. **PM Item Enhancement** (`pmItems.enhanceWithContext`)
2. **Chat Conversations** (`conversations.sendMessage`)
3. **Feedback Analysis** (`feedback.generateSuggestions`)
4. **Queue Analysis** (`queue.addToQueue`)

All procedures automatically:
- Retrieve the user's API key from context
- Pass it to `invokeLLM()`
- Fall back to system key if not configured

## Future Enhancements

1. **OAuth Token-Based**: Use OAuth tokens instead of manual API key entry
2. **Usage Tracking**: Show users their AI credit usage within the app
3. **Credit Limits**: Allow users to set spending limits
4. **Shared Pool**: Option for admin to provide a shared API key for trial users
5. **API Key Validation**: Test API key validity before saving
6. **Usage Analytics**: Dashboard showing credit consumption per user

## Related Files

### Backend
- `drizzle/schema.ts` - Database schema
- `drizzle/0006_add_user_api_key.sql` - Migration file
- `server/_core/encryption.ts` - Encryption utilities
- `server/_core/userApiKey.ts` - User API key helpers
- `server/_core/llm.ts` - LLM module
- `server/_core/llm-smart.ts` - Smart LLM module
- `server/routers.ts` - All routers including settings

### Frontend
- `client/src/pages/Settings.tsx` - Settings page with API key UI
- `client/src/App.tsx` - App router with settings route

## Support

For questions or issues with the per-user credit system, please:
1. Check this documentation
2. Review the Settings page instructions
3. Contact the development team
4. Submit an issue on GitHub

## Version History

- **v1.0.0** (2025-10-30): Initial implementation of per-user credit system
  - Database schema updates
  - Encryption utilities
  - Settings UI
  - Automatic API key usage in all AI operations
