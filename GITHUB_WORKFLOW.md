# GitHub Workflow for TERP PM Hub

**Version:** 1.0.0  
**Last Updated:** October 30, 2025  
**Purpose:** Explain the GitHub-first development workflow and git remote configuration

## Overview

TERP PM Hub uses **GitHub as the source of truth** for all code. This document explains how to work with the repository, manage the two git remotes, and integrate with TERP Development Protocols.

## Git Remotes Configuration

The repository has two remotes configured:

### origin (GitHub) - PRIMARY

```bash
origin  https://github.com/EvanTenenbaum/TERP-PM-Hub.git
```

**Purpose:** Source of truth for all development
**Usage:** All development work, code reviews, version control
**When to use:** Always for push/pull operations

### manus-internal (Manus S3) - BACKUP ONLY

```bash
manus-internal  [Manus S3 URL]
```

**Purpose:** Backup and internal Manus integration
**Usage:** Automatic backups, not for active development
**When to use:** Rarely, only for recovery scenarios

## Development Workflows

### Workflow 1: Develop Locally, Push to GitHub

**Best for:** Complex features, multiple file changes, testing locally

```bash
# 1. Clone repository (first time only)
git clone https://github.com/EvanTenenbaum/TERP-PM-Hub.git
cd TERP-PM-Hub

# 2. Pull latest changes
git pull origin master

# 3. Install dependencies
pnpm install

# 4. Make your changes
# ... edit files ...

# 5. Test locally
pnpm run dev
# Test at http://localhost:3000

# 6. Check TypeScript
pnpm exec tsc --noEmit

# 7. Stage changes
git add .

# 8. Commit changes
git commit -m "Descriptive commit message"

# 9. Get commit hash for version.json
git rev-parse --short HEAD

# 10. Update version.json
# Edit version.json with:
# - New commit hash
# - Current date
# - Description of changes
# - Incremented version number

# 11. Amend commit with version.json
git add version.json
git commit --amend --no-edit

# 12. Push to GitHub
git push origin master

# 13. Deploy from Manus workspace
# See DEPLOYMENT.md for deployment steps
```

### Workflow 2: Edit on GitHub, Deploy from Manus

**Best for:** Quick fixes, documentation updates, single file changes

```bash
# 1. Edit file on GitHub
# - Navigate to file on GitHub
# - Click pencil icon (Edit)
# - Make changes

# 2. Update version.json on GitHub
# - Edit version.json
# - Update commit, date, description, version
# - Commit both files together

# 3. Pull into Manus workspace
cd /home/ubuntu/TERP-PM-Hub
git pull origin master

# 4. Test if needed
pnpm run dev

# 5. Deploy via Manus checkpoint
# See DEPLOYMENT.md for deployment steps
```

### Workflow 3: Collaborative Development

**Best for:** Multiple developers working on the same codebase

```bash
# 1. Create feature branch
git checkout -b feature/your-feature-name

# 2. Make changes
# ... edit files ...

# 3. Commit changes
git add .
git commit -m "Feature: description"

# 4. Update version.json
# Follow version management protocol

# 5. Push feature branch
git push origin feature/your-feature-name

# 6. Create Pull Request on GitHub
# - Go to GitHub repository
# - Click "New Pull Request"
# - Select your feature branch
# - Add description
# - Request review

# 7. After PR approval, merge to master
# - Merge on GitHub
# - Delete feature branch

# 8. Pull merged changes into Manus workspace
cd /home/ubuntu/TERP-PM-Hub
git checkout master
git pull origin master

# 9. Deploy to production
# See DEPLOYMENT.md
```

## Working with Two Remotes

### Viewing Remotes

```bash
# List all remotes
git remote -v

# Expected output:
# origin          https://github.com/EvanTenenbaum/TERP-PM-Hub.git (fetch)
# origin          https://github.com/EvanTenenbaum/TERP-PM-Hub.git (push)
# manus-internal  [Manus S3 URL] (fetch)
# manus-internal  [Manus S3 URL] (push)
```

### Default Remote Operations

```bash
# Pull from GitHub (default)
git pull origin master

# Push to GitHub (default)
git push origin master

# Check remote tracking
git branch -vv
# Should show: master -> origin/master
```

### When to Use manus-internal

**Rarely needed!** The manus-internal remote is primarily for:

1. **Recovery scenarios:** If GitHub is unavailable
2. **Manus platform integration:** Automatic backups
3. **Emergency rollback:** Accessing Manus-stored versions

**Normal development:** Always use `origin` (GitHub)

### Syncing Both Remotes (if needed)

```bash
# Push to both remotes (rarely needed)
git push origin master
git push manus-internal master

# Pull from specific remote
git pull origin master
# or
git pull manus-internal master
```

## Integration with TERP Development Protocols

This workflow follows TERP Development Protocols:

### 1. Impact Analysis

Before making changes:
- Identify affected files
- Map dependencies
- Check for ripple effects
- Create update checklist

### 2. Production-Ready Code

All code must be:
- Fully functional, no placeholders
- Properly typed (TypeScript)
- Tested locally
- Free of console errors

### 3. Version Management

**MANDATORY for every push:**
- Update `version.json`
- Include commit hash
- Update date
- Increment version number
- Add description

### 4. Quality Standards

Before pushing:
- [ ] TypeScript compiles: `pnpm exec tsc --noEmit`
- [ ] No console errors
- [ ] All features work
- [ ] Responsive design maintained
- [ ] Follows design system

### 5. Deployment Monitoring

After deploying:
- Verify application loads
- Test core functionality
- Check console for errors
- Monitor for 5+ minutes

**Full protocols:** [TERP Development Protocols](https://github.com/EvanTenenbaum/TERP/blob/main/docs/DEVELOPMENT_PROTOCOLS.md)

## Common Git Operations

### Checking Status

```bash
# View changed files
git status

# View commit history
git log --oneline

# View specific file history
git log --oneline -- path/to/file

# View current branch and tracking
git branch -vv
```

### Undoing Changes

```bash
# Discard local changes (not committed)
git restore path/to/file
# or all files:
git restore .

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1

# Revert a specific commit (creates new commit)
git revert <commit-hash>
```

### Handling Merge Conflicts

```bash
# If pull creates conflicts
git pull origin master
# CONFLICT messages appear

# View conflicted files
git status

# Edit files to resolve conflicts
# Look for <<<<<<< HEAD markers

# After resolving
git add .
git commit -m "Resolve merge conflicts"
git push origin master
```

### Stashing Changes

```bash
# Save work in progress
git stash

# List stashes
git stash list

# Apply most recent stash
git stash pop

# Apply specific stash
git stash apply stash@{0}

# Clear all stashes
git stash clear
```

## Branch Management

### Creating Branches

```bash
# Create and switch to new branch
git checkout -b feature/new-feature

# Create branch without switching
git branch feature/new-feature

# Switch to existing branch
git checkout feature/new-feature
```

### Merging Branches

```bash
# Switch to master
git checkout master

# Pull latest
git pull origin master

# Merge feature branch
git merge feature/new-feature

# Push merged changes
git push origin master

# Delete feature branch (local)
git branch -d feature/new-feature

# Delete feature branch (remote)
git push origin --delete feature/new-feature
```

### Viewing Branches

```bash
# List local branches
git branch

# List all branches (including remote)
git branch -a

# View branch tracking
git branch -vv
```

## GitHub-Specific Features

### Pull Requests

1. **Create PR:**
   - Push feature branch to GitHub
   - Navigate to repository on GitHub
   - Click "New Pull Request"
   - Select base (master) and compare (feature) branches
   - Add title and description
   - Request reviewers

2. **Review PR:**
   - View changed files
   - Add comments on specific lines
   - Approve or request changes
   - Merge when approved

3. **Merge PR:**
   - Click "Merge pull request"
   - Choose merge type (merge commit, squash, rebase)
   - Confirm merge
   - Delete feature branch

### Issues

Track bugs, features, and tasks:
- Create issues on GitHub
- Link commits to issues: `git commit -m "Fix #123: description"`
- Close issues automatically: `git commit -m "Closes #123: description"`

### GitHub Actions (Future)

Potential automation:
- Run tests on push
- Deploy automatically
- Check code quality
- Update version automatically

## Troubleshooting

### "Failed to push to origin"

```bash
# Pull first to get latest changes
git pull origin master

# If conflicts, resolve them
# Then push
git push origin master
```

### "Detached HEAD state"

```bash
# Return to master branch
git checkout master

# If you made changes in detached HEAD
git checkout -b temp-branch
git checkout master
git merge temp-branch
```

### "Remote origin already exists"

```bash
# View current remote
git remote -v

# Update remote URL
git remote set-url origin https://github.com/EvanTenenbaum/TERP-PM-Hub.git

# Or remove and re-add
git remote remove origin
git remote add origin https://github.com/EvanTenenbaum/TERP-PM-Hub.git
```

### "Permission denied (publickey)"

```bash
# Use HTTPS instead of SSH
git remote set-url origin https://github.com/EvanTenenbaum/TERP-PM-Hub.git

# Or set up SSH keys
# See GitHub documentation for SSH key setup
```

## Best Practices

### Commit Messages

**Good commit messages:**
```
Add per-user credit system for AI operations
Fix navigation bug in settings page
Update deployment documentation
Refactor LLM module for better error handling
```

**Bad commit messages:**
```
update
fix bug
changes
wip
asdf
```

**Format:**
```
<type>: <description>

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Formatting, no code change
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance tasks

### Commit Frequency

- **Commit often:** Small, focused commits are better than large ones
- **Atomic commits:** Each commit should represent one logical change
- **Test before committing:** Ensure code works before committing

### Branch Naming

**Good branch names:**
```
feature/per-user-credits
fix/navigation-bug
docs/deployment-guide
refactor/llm-module
```

**Bad branch names:**
```
my-branch
test
updates
branch1
```

### Pull Request Guidelines

1. **Title:** Clear, descriptive title
2. **Description:** Explain what changed and why
3. **Testing:** Describe how you tested the changes
4. **Screenshots:** Include for UI changes
5. **Breaking changes:** Clearly mark any breaking changes
6. **Link issues:** Reference related issues

## Security Considerations

### Never Commit

- API keys or secrets
- `.env` files
- Database credentials
- User data
- Private keys

### Use .gitignore

Ensure `.gitignore` includes:
```
.env
.env.local
.env.production
node_modules/
dist/
build/
*.log
.DS_Store
```

### Sensitive Data

- Use environment variables
- Store secrets in Manus platform
- Use `.env.example` as template (without actual values)

## Resources

### Documentation
- [TERP Development Protocols](https://github.com/EvanTenenbaum/TERP/blob/main/docs/DEVELOPMENT_PROTOCOLS.md)
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment procedures
- [README.md](./README.md) - Project overview

### Git Resources
- [Git Documentation](https://git-scm.com/doc)
- [GitHub Guides](https://guides.github.com/)
- [Atlassian Git Tutorials](https://www.atlassian.com/git/tutorials)

### TERP PM Hub
- [GitHub Repository](https://github.com/EvanTenenbaum/TERP-PM-Hub)
- [Main TERP Repository](https://github.com/EvanTenenbaum/TERP)

## Changelog

### v1.0.0 (2025-10-30)
- Initial GitHub workflow documentation
- Documented two-remote configuration
- Integrated TERP Development Protocols
- Added common workflows and troubleshooting
