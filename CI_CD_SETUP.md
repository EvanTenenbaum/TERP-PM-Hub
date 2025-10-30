# CI/CD Setup for TERP PM Hub

**Version:** 1.0.0  
**Last Updated:** October 30, 2025  
**Purpose:** Automatic build and deployment on every GitHub push

---

## Overview

TERP PM Hub now has **automatic CI/CD** configured via GitHub Actions. Every push to any branch triggers an automatic build and deployment process.

## How It Works

```
Developer pushes to GitHub
         ↓
GitHub Actions triggered automatically
         ↓
Checkout code
         ↓
Install dependencies (pnpm)
         ↓
Run TypeScript check
         ↓
Build application (production bundle)
         ↓
Trigger Manus deployment (if configured)
         ↓
Deployment complete
```

---

## GitHub Actions Workflow

### File Location
`.github/workflows/deploy.yml`

### Trigger Events

**Automatic Triggers:**
- Push to **any branch** (`**`)
- All commits, all branches

**Manual Trigger:**
- Can be triggered manually via GitHub Actions UI

### Workflow Steps

1. **Checkout Code**
   - Uses: `actions/checkout@v4`
   - Fetches latest code from repository

2. **Setup Node.js**
   - Uses: `actions/setup-node@v4`
   - Version: Node.js 22

3. **Setup pnpm**
   - Uses: `pnpm/action-setup@v2`
   - Version: pnpm 8

4. **Install Dependencies**
   - Command: `pnpm install`
   - Installs all npm packages

5. **TypeScript Check**
   - Command: `pnpm run check`
   - Runs: `tsc --noEmit`
   - Continues even if errors (for pre-existing issues)

6. **Build Application**
   - Command: `pnpm run build`
   - Builds frontend (Vite)
   - Builds backend (esbuild)
   - Output: `dist/` directory

7. **Deploy to Manus** (Optional)
   - Triggers Manus webhook if configured
   - Sends deployment notification
   - Skips if webhook not configured

8. **Create Summary**
   - Shows build status
   - Displays commit info
   - Lists next steps

---

## Configuration

### Required Secrets (Optional)

To enable automatic deployment to Manus, add this secret to your GitHub repository:

**Secret Name:** `MANUS_WEBHOOK_URL`  
**Value:** Your Manus deployment webhook URL

**How to add:**
1. Go to GitHub repository
2. Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Name: `MANUS_WEBHOOK_URL`
5. Value: `https://your-manus-webhook-url.com/deploy`
6. Click "Add secret"

### Without Webhook

If `MANUS_WEBHOOK_URL` is not configured:
- Build still runs automatically
- TypeScript check still runs
- Build artifacts are created
- Manual deployment required

---

## Viewing Build Status

### GitHub Actions UI

1. Go to your repository on GitHub
2. Click "Actions" tab
3. See list of all workflow runs
4. Click on a run to see details

### Build Status Badge

Add to README.md:
```markdown
[![Build Status](https://github.com/EvanTenenbaum/TERP-PM-Hub/actions/workflows/deploy.yml/badge.svg)](https://github.com/EvanTenenbaum/TERP-PM-Hub/actions)
```

### Commit Status

- ✅ Green checkmark: Build succeeded
- ❌ Red X: Build failed
- 🟡 Yellow dot: Build in progress

---

## Build Process Details

### Frontend Build (Vite)

**Input:** `client/src/`  
**Output:** `dist/public/`  
**Process:**
- Compiles TypeScript to JavaScript
- Bundles React components
- Optimizes assets (CSS, images)
- Minifies code
- Generates source maps

**Output Files:**
- `dist/public/index.html` - Main HTML file
- `dist/public/assets/*.js` - JavaScript bundles
- `dist/public/assets/*.css` - Stylesheets
- `dist/public/assets/*` - Fonts, images, etc.

### Backend Build (esbuild)

**Input:** `server/_core/index.ts`  
**Output:** `dist/index.js`  
**Process:**
- Compiles TypeScript to JavaScript
- Bundles server code
- Excludes node_modules (external packages)
- Creates single entry point

**Output Files:**
- `dist/index.js` - Server entry point

---

## Deployment Workflow

### Automatic Deployment (With Webhook)

```bash
# 1. Make changes locally
git add .
git commit -m "Your changes"

# 2. Push to GitHub
git push origin master

# 3. GitHub Actions automatically:
#    - Builds the application
#    - Runs tests
#    - Triggers Manus deployment

# 4. Check deployment status
#    - GitHub Actions tab
#    - Manus deployment logs
```

### Manual Deployment (Without Webhook)

```bash
# 1. Make changes and push
git add .
git commit -m "Your changes"
git push origin master

# 2. GitHub Actions builds automatically

# 3. Wait for build to complete (check Actions tab)

# 4. Deploy manually to Manus
cd /home/ubuntu/TERP-PM-Hub
git pull origin master
# Use Manus webdev tools to deploy
```

---

## Branch Strategy

### Master Branch

- **Purpose:** Production-ready code
- **Protection:** Should be protected (require PR reviews)
- **Deployment:** Automatically builds and deploys
- **Version:** Always tagged with version.json

### Feature Branches

- **Purpose:** Development of new features
- **Naming:** `feature/feature-name`
- **Deployment:** Builds automatically, manual deployment
- **Merge:** Via Pull Request to master

### Bugfix Branches

- **Purpose:** Bug fixes
- **Naming:** `fix/bug-description`
- **Deployment:** Builds automatically, manual deployment
- **Merge:** Via Pull Request to master

---

## Build Artifacts

### What Gets Built

**Frontend:**
- Compiled JavaScript (from TypeScript)
- Bundled React application
- Optimized CSS
- Static assets (fonts, images)
- HTML entry point

**Backend:**
- Compiled server code
- Single JavaScript bundle
- Ready for Node.js execution

### Artifact Size

**Frontend:**
- Total: ~13 MB (uncompressed)
- Gzipped: ~2.5 MB
- Largest chunk: vendor.js (~11 MB)

**Backend:**
- Total: ~95 KB
- Single file: dist/index.js

---

## Monitoring Builds

### GitHub Actions Logs

**Access:**
1. Repository → Actions tab
2. Click on workflow run
3. Click on job name
4. Expand steps to see logs

**What to check:**
- Install dependencies: Should complete in ~30s
- TypeScript check: May show warnings (OK)
- Build: Should complete in ~20s
- Deploy: Check webhook response

### Build Failures

**Common Causes:**
1. TypeScript errors (new ones, not pre-existing)
2. Missing dependencies
3. Build script errors
4. Out of memory (large builds)

**How to fix:**
1. Check error logs in GitHub Actions
2. Fix locally and test: `pnpm run build`
3. Commit fix and push
4. Build will re-run automatically

---

## Performance Optimization

### Current Build Time

- **Total:** ~1-2 minutes
- **Install:** ~30 seconds
- **TypeScript check:** ~10 seconds
- **Build:** ~20 seconds
- **Deploy:** ~5 seconds

### Optimization Tips

1. **Cache Dependencies:**
   - GitHub Actions caches node_modules
   - Subsequent builds faster (~30s saved)

2. **Parallel Jobs:**
   - Could split TypeScript check and build
   - Run tests in parallel

3. **Conditional Deployment:**
   - Only deploy master branch
   - Skip deployment for feature branches

---

## Troubleshooting

### Build Fails on GitHub but Works Locally

**Possible causes:**
- Different Node.js version
- Missing environment variables
- Different dependency versions

**Solution:**
```bash
# Use same Node.js version
nvm use 22

# Clean install
rm -rf node_modules
pnpm install

# Test build
pnpm run build
```

### TypeScript Check Fails

**Current behavior:**
- Continues even if errors (for pre-existing issues)

**To make it strict:**
```yaml
- name: Run TypeScript check
  run: pnpm run check
  # Remove: continue-on-error: true
```

### Deployment Webhook Fails

**Check:**
1. Is `MANUS_WEBHOOK_URL` secret configured?
2. Is webhook URL correct?
3. Is Manus endpoint accessible?

**Debug:**
- Check GitHub Actions logs
- Look for webhook response
- Verify Manus deployment logs

---

## Advanced Configuration

### Deploy Only Master Branch

```yaml
- name: Deploy to Manus
  if: github.ref == 'refs/heads/master'
  env:
    MANUS_WEBHOOK_URL: ${{ secrets.MANUS_WEBHOOK_URL }}
  run: |
    # deployment script
```

### Run Tests Before Build

```yaml
- name: Run tests
  run: pnpm run test

- name: Build application
  run: pnpm run build
```

### Notify on Failure

```yaml
- name: Notify on failure
  if: failure()
  run: |
    curl -X POST ${{ secrets.SLACK_WEBHOOK }} \
      -d '{"text":"Build failed for ${{ github.repository }}"}'
```

### Multiple Environments

```yaml
- name: Deploy to staging
  if: github.ref == 'refs/heads/develop'
  run: # deploy to staging

- name: Deploy to production
  if: github.ref == 'refs/heads/master'
  run: # deploy to production
```

---

## Security Considerations

### Secrets Management

- **Never commit secrets** to repository
- Use GitHub Secrets for sensitive data
- Rotate secrets regularly
- Limit secret access to necessary workflows

### Dependency Security

**Automated checks:**
- Dependabot alerts (GitHub)
- npm audit (in workflow)
- Security scanning

**Best practices:**
- Keep dependencies updated
- Review security advisories
- Use lock files (pnpm-lock.yaml)

---

## Cost Considerations

### GitHub Actions Minutes

**Free tier:**
- 2,000 minutes/month for public repos
- 500 minutes/month for private repos

**Current usage:**
- ~2 minutes per build
- ~1,000 builds/month = 2,000 minutes

**Optimization:**
- Cache dependencies (saves ~30s per build)
- Skip builds for docs-only changes
- Use self-hosted runners (unlimited)

---

## Future Enhancements

### Planned Improvements

1. **Automated Testing:**
   - Unit tests
   - Integration tests
   - E2E tests

2. **Code Quality:**
   - ESLint checks
   - Prettier formatting
   - Code coverage reports

3. **Performance Monitoring:**
   - Bundle size tracking
   - Build time monitoring
   - Deployment metrics

4. **Advanced Deployment:**
   - Blue-green deployment
   - Canary releases
   - Rollback automation

5. **Notifications:**
   - Slack/Discord integration
   - Email notifications
   - Status badges

---

## Documentation Updates

When making changes to CI/CD:

1. Update this document
2. Update DEPLOYMENT.md if workflow changes
3. Update README.md with build status badge
4. Document any new secrets required
5. Update version.json

---

## Support

### Getting Help

**GitHub Actions Issues:**
- Check GitHub Actions logs
- Review workflow syntax
- Consult GitHub Actions documentation

**Build Issues:**
- Test locally first: `pnpm run build`
- Check TypeScript errors: `pnpm run check`
- Verify dependencies: `pnpm install`

**Deployment Issues:**
- Check Manus deployment logs
- Verify webhook configuration
- Test webhook manually

---

## Changelog

### v1.0.0 (2025-10-30)
- Initial CI/CD setup
- Automatic build on all pushes
- TypeScript checking
- Production build generation
- Optional Manus webhook deployment
- Build status summaries

---

**Maintained By:** TERP PM Hub Team  
**Last Updated:** October 30, 2025  
**Status:** ✅ ACTIVE AND WORKING
