
# TERP PM Hub Deployment Guide

**Author:** Manus AI
**Date:** October 30, 2025

## 1. Introduction

This document provides comprehensive instructions for deploying, configuring, and verifying the TERP PM Hub application in a production environment. The application has been developed to include a per-user credit system, allowing individual users to utilize their own Manus API keys for AI-powered features. This guide ensures a smooth and successful deployment process.

## 2. Prerequisites

Before proceeding with the deployment, ensure the following software is installed and configured on your server:

- **Node.js:** v22.13.0 or later
- **pnpm:** v9.7.0 or later
- **PM2:** Latest version
- **Git:** Latest version
- **A valid Manus AI account and API key**

## 3. Environment Variables

Create a `.env` file in the root of the project directory with the following variables. Replace the placeholder values with your actual production credentials.

```env
# Database (replace with your production database URL)
DATABASE_URL=file:./.manus/db/sqlite.db

# OAuth (Manus) - Obtain these from your Manus AI developer settings
OAUTH_CLIENT_ID=your-oauth-client-id
OAUTH_CLIENT_SECRET=your-oauth-client-secret
OAUTH_SERVER_URL=https://oauth.manus.com
OAUTH_REDIRECT_URI=http://your-domain.com/auth/callback

# Owner
OWNER_OPEN_ID=your-owner-open-id

# LLM API (fallback key)
BUILT_IN_FORGE_API_KEY=your-fallback-manus-api-key

# Server
PORT=3000
NODE_ENV=production

# Encryption key for API keys (must be a 64-character hex string)
ENCRYPTION_KEY=your-64-char-hex-encryption-key

# Vite (Frontend) - These must start with VITE_ to be exposed to the client
VITE_APP_TITLE=TERP PM Hub
VITE_APP_LOGO=https://placehold.co/128x128/4F46E5/FFFFFF?text=TERP
VITE_OAUTH_PORTAL_URL=https://oauth.manus.com
VITE_APP_ID=terp-pm-hub
```

**Note:** The `ENCRYPTION_KEY` is critical for securing user API keys. Generate a secure, random 64-character hexadecimal string for this value.

## 4. Deployment Steps

Follow these steps to deploy the application:

1.  **Clone the Repository:**

    ```bash
    git clone https://github.com/EvanTenenbaum/TERP-PM-Hub.git
    cd TERP-PM-Hub
    ```

2.  **Install Dependencies:**

    ```bash
    pnpm install
    ```

3.  **Build the Application:**

    ```bash
    pnpm run build
    ```

4.  **Start with PM2:**

    Ensure your `.env` file is correctly configured, then start the application with PM2:

    ```bash
    NODE_ENV=production pm2 start dist/index.js --name terp-pm-hub
    ```

5.  **Save PM2 Configuration:**

    To ensure the application restarts on server reboot, save the PM2 configuration:

    ```bash
    pm2 save
    ```

6.  **Set up Startup Script:**

    Generate and execute the startup script command provided by PM2:

    ```bash
    pm2 startup
    # Follow the instructions provided by the command output
    ```

## 5. Verification and Testing

After deployment, verify that the application is running correctly:

1.  **Check PM2 Status:**

    ```bash
    pm2 status
    ```

    The `terp-pm-hub` process should be `online`.

2.  **Access the Application:**

    Open your web browser and navigate to `http://your-domain.com:3000` (or the configured port). You should see the TERP PM Hub homepage.

3.  **Test User Authentication:**

    -   Click "Sign In to Get Started" and log in with your Manus AI account.
    -   After successful login, you should be redirected to the dashboard.

4.  **Test Per-User Credit System:**

    -   Navigate to the **Settings** page (`/settings`).
    -   Add your Manus API key and verify that it is saved correctly.
    -   Test one of the AI features (e.g., Triage, PRD Generation) and confirm that your API key is being used.

## 6. Troubleshooting

-   **Blank Page:** If you encounter a blank page, check the browser's developer console for any JavaScript errors. Ensure that the `NODE_ENV` is set to `production` and that the application was rebuilt after any changes.
-   **502 Bad Gateway:** This may indicate that the PM2 process is not running or is crashing. Check the PM2 logs for errors:

    ```bash
    pm2 logs terp-pm-hub
    ```

-   **OAuth Errors:** Verify that your OAuth credentials and redirect URI are correctly configured in the `.env` file and in your Manus AI developer settings.

