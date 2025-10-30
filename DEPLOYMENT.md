# TERP PM Hub Deployment Guide

**Version:** 1.0.0  
**Last Updated:** October 30, 2025  
**Purpose:** Document the deployment workflow for TERP PM Hub with GitHub as primary source

## Overview

TERP PM Hub uses a **GitHub-first development workflow** where:
- **GitHub** is the source of truth for all code
- **Manus workspace** is the deployment and runtime environment
- Changes flow from GitHub → Manus workspace → Live deployment

## Architecture

```
┌─────────────┐
│   GitHub    │  ← Source of Truth
│  Repository │
└──────┬──────┘
       │ git pull
       ▼
┌─────────────┐
│   Manus     │  ← Development & Deployment
│  Workspace  │
└──────┬──────┘
       │ webdev_save_checkpoint
       ▼
┌─────────────┐
│    Live     │  ← Production
│ Deployment  │
└─────────────┘
```

## Development Workflow

### 1. Making Changes on GitHub

You can edit code directly on GitHub or push from your local machine:

**Option A: GitHub Web Editor**
1. Navigate to the file you want to edit on GitHub
2. Click the pencil icon (Edit this file)
3. Make your changes
4. Commit with a descriptive message
5. **IMPORTANT:** Update `version.json` before committing (see [Version Management](#version-management))

**Option B: Local Development**
```bash
# Clone the repository
git clone https://github.com/EvanTenenbaum/TERP-PM-Hub.git
cd TERP-PM-Hub

# Make your changes
# ... edit files ...

# Update version.json (MANDATORY)
# See Version Management section below

# Commit and push
git add .
git commit -m "Your descriptive commit message"
git push origin master
```

### 2. Pulling Changes into Manus Workspace

After pushing changes to GitHub, pull them into the Manus workspace:

```bash
cd /home/ubuntu/TERP-PM-Hub
git pull origin master
```

**What this does:**
- Fetches latest code from GitHub
- Merges changes into your workspace
- Updates all files to match GitHub

**Verify the pull:**
```bash
# Check current commit
git log -1 --oneline

# Verify version.json was updated
cat version.json
```

### 3. Testing Changes

Before deploying, test the changes in the development server:

```bash
# Start the dev server
pnpm run dev

# The server will start on port 3000
# Access it via the Manus-provided URL
```

**Test checklist:**
- [ ] Application starts without errors
- [ ] All pages load correctly
- [ ] New features work as expected
- [ ] No console errors in browser
- [ ] TypeScript compiles without errors: `pnpm exec tsc --noEmit`

### 4. Deploying to Production

Once testing is complete, deploy via Manus checkpoint:

```bash
# Save a checkpoint with descriptive message
# This will be done through Manus webdev tools
```

**Checkpoint message format:**
```
[Version X.Y.Z] Brief description of changes

- Feature/fix 1
- Feature/fix 2
- Feature/fix 3

Follows TERP Development Protocols
```

**After checkpoint:**
1. Publish the checkpoint to make it live
2. Verify deployment at the production URL
3. Check version display in the app header
4. Monitor for any errors (see [Deployment Monitoring](#deployment-monitoring))

## Version Management

**MANDATORY:** Every GitHub push MUST include a version.json update per TERP Development Protocols.

### version.json Format

```json
{
  "version": "1.0.0",
  "commit": "abc1234",
  "date": "2025-10-30",
  "description": "Brief description of changes"
}
```

### Update Process

**Before every git push:**

1. **Get current commit hash:**
   ```bash
   git add .
   git commit -m "Your commit message"
   git rev-parse --short HEAD
   ```

2. **Update version.json:**
   - Update `commit` field with the hash from step 1
   - Update `date` to current date (YYYY-MM-DD)
   - Update `description` with what changed
   - Increment `version` if applicable:
     - **Patch** (1.0.0 → 1.0.1): Bug fixes, minor changes
     - **Minor** (1.0.0 → 1.1.0): New features, enhancements
     - **Major** (1.0.0 → 2.0.0): Breaking changes

3. **Amend the commit:**
   ```bash
   git add version.json
   git commit --amend --no-edit
   git push origin master
   ```

### Version Display

The version is displayed in the application header:
- **Desktop:** Shows version number and commit hash
- **Mobile:** Shows commit hash only (space-constrained)

This allows users to verify they're running the correct version.

## Git Remotes Configuration

The repository has two remotes:

```bash
# View remotes
git remote -v

# Expected output:
# origin          https://github.com/EvanTenenbaum/TERP-PM-Hub.git (fetch)
# origin          https://github.com/EvanTenenbaum/TERP-PM-Hub.git (push)
# manus-internal  [Manus S3 URL] (fetch)
# manus-internal  [Manus S3 URL] (push)
```

**Remote purposes:**
- **origin (GitHub):** Primary source of truth, all development happens here
- **manus-internal (Manus S3):** Backup only, not used for active development

**Always use origin for push/pull:**
```bash
git pull origin master
git push origin master
```

## Deployment Monitoring

After deploying, monitor the application for issues:

### Immediate Checks (First 5 minutes)

1. **Application loads:**
   - Visit the production URL
   - Verify the homepage renders
   - Check version display matches deployed version

2. **Core functionality:**
   - Test navigation between pages
   - Verify dashboard loads data
   - Test AI features (if you have API key configured)
   - Check settings page

3. **Console errors:**
   - Open browser DevTools (F12)
   - Check Console tab for errors
   - Check Network tab for failed requests

### Extended Monitoring (First hour)

1. **Database operations:**
   - Test creating/updating PM items
   - Verify GitHub sync works
   - Check conversation history

2. **Performance:**
   - Page load times acceptable
   - No memory leaks
   - Smooth interactions

3. **Error logs:**
   - Check Manus deployment logs
   - Look for server-side errors
   - Monitor for repeated failures

### Rollback Procedure

If critical issues are found:

1. **Identify last working version:**
   ```bash
   git log --oneline
   ```

2. **Revert to previous commit:**
   ```bash
   git revert HEAD
   # Or for multiple commits:
   git reset --hard <previous-commit-hash>
   git push origin master --force
   ```

3. **Pull into Manus workspace:**
   ```bash
   cd /home/ubuntu/TERP-PM-Hub
   git pull origin master
   ```

4. **Redeploy:**
   - Save new checkpoint
   - Publish to production
   - Verify rollback successful

## Common Workflows

### Adding a New Feature

```bash
# 1. Pull latest code
cd /home/ubuntu/TERP-PM-Hub
git pull origin master

# 2. Make changes locally or on GitHub
# ... edit files ...

# 3. Test locally
pnpm run dev

# 4. Update version.json
# Increment minor version (e.g., 1.0.0 → 1.1.0)

# 5. Commit and push
git add .
git commit -m "Add new feature: [feature name]"
git rev-parse --short HEAD  # Get hash
# Update version.json with hash
git add version.json
git commit --amend --no-edit
git push origin master

# 6. Pull into workspace
git pull origin master

# 7. Deploy via Manus checkpoint
```

### Fixing a Bug

```bash
# 1. Pull latest code
git pull origin master

# 2. Fix the bug
# ... edit files ...

# 3. Test the fix
pnpm run dev

# 4. Update version.json
# Increment patch version (e.g., 1.0.0 → 1.0.1)

# 5. Commit and push
git add .
git commit -m "Fix: [bug description]"
git rev-parse --short HEAD
# Update version.json
git add version.json
git commit --amend --no-edit
git push origin master

# 6. Deploy immediately
git pull origin master
# Save checkpoint and publish
```

### Updating Documentation

```bash
# 1. Edit documentation files
# ... edit .md files ...

# 2. Update version.json
# Usually patch version (1.0.0 → 1.0.1)
# Or keep same version if docs-only

# 3. Commit and push
git add .
git commit -m "Docs: [what was updated]"
git push origin master

# 4. Pull into workspace (optional for docs-only)
git pull origin master
```

## Environment Variables

The PM Hub requires these environment variables:

### Required
- `DATABASE_URL`: MySQL database connection string
- `JWT_SECRET`: Secret for encrypting user API keys and sessions
- `BUILT_IN_FORGE_API_KEY`: Default Manus API key (fallback)

### Optional
- `GITHUB_TOKEN`: For GitHub API integration
- `OWNER_OPEN_ID`: Admin user OpenID

**Setting environment variables:**
1. In Manus workspace, environment variables are managed through the Manus platform
2. Never commit `.env` files to GitHub
3. Use `.env.example` as a template

## Troubleshooting

### "Git pull fails with merge conflicts"

```bash
# Stash local changes
git stash

# Pull from GitHub
git pull origin master

# Reapply local changes
git stash pop

# Resolve conflicts manually
# Then commit
git add .
git commit -m "Resolve merge conflicts"
```

### "TypeScript errors after pulling"

```bash
# Reinstall dependencies
pnpm install

# Check for errors
pnpm exec tsc --noEmit

# If errors persist, check the commit that introduced them
git log --oneline
```

### "Application won't start after deployment"

1. Check Manus deployment logs
2. Verify environment variables are set
3. Check database connectivity
4. Look for missing dependencies
5. Consider rolling back to previous version

### "Version display shows wrong version"

1. Verify `version.json` was updated
2. Check that the file was committed to GitHub
3. Confirm you pulled the latest code
4. Clear browser cache
5. Restart the development server

## Best Practices

### Do's ✅
- Always update `version.json` before pushing
- Test changes locally before deploying
- Write descriptive commit messages
- Monitor deployments for at least 5 minutes
- Keep GitHub as the single source of truth
- Follow TERP Development Protocols for all changes

### Don'ts ❌
- Don't push without updating `version.json`
- Don't deploy untested code
- Don't make changes directly in Manus workspace (use GitHub)
- Don't skip deployment monitoring
- Don't use `manus-internal` remote for development
- Don't commit sensitive data or API keys

## Integration with TERP Development Protocols

This deployment workflow follows the TERP Development Protocols:

1. **Impact Analysis:** Assess changes before pushing
2. **Production-Ready Code:** No placeholders or stubs
3. **Quality Standards:** TypeScript checks, testing
4. **Version Management:** Mandatory version.json updates
5. **Deployment Monitoring:** Post-deployment verification

**Always reference:** [TERP Development Protocols](https://github.com/EvanTenenbaum/TERP/blob/main/docs/DEVELOPMENT_PROTOCOLS.md)

## Support

For issues or questions:
1. Check this documentation
2. Review TERP Development Protocols
3. Check GitHub Issues
4. Contact the development team

## Changelog

### v1.0.0 (2025-10-30)
- Initial deployment documentation
- GitHub-first workflow established
- Version management integrated
- Deployment monitoring procedures defined
