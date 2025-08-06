# Publishing Guide for AdView Monorepo

This guide explains how to publish packages from the AdView monorepo to npm.

## Overview

The AdView monorepo contains multiple packages:

- **Core package**: `@adview/core` - Shared utilities, types, and common functionality
- **Framework packages**: `@adview/react` - Framework-specific implementations

All packages are configured for publication to npm with proper build pipelines and version management.

## Prerequisites

### 1. npm Account and Permissions

- Create an npm account at [npmjs.com](https://npmjs.com)
- Request publishing permissions for the `@adview` scope
- Ensure you're added as a collaborator to existing packages

### 2. Local Setup

```bash
# Install dependencies
npm install

# Verify build system works
make build

# Check package readiness
make publish-check
```

## Publishing Process

### Step 1: Authentication

Login to npm registry:

```bash
npm login
```

Verify authentication:

```bash
npm whoami
```

### Step 2: Pre-Publication Checks

Run comprehensive checks:

```bash
# Check all packages are ready for publishing
make publish-check

# Verify current versions
make version-check

# Ensure clean build
make clean && make build
```

### Step 3: Choose Publishing Method

#### Method A: Manual Publishing (Simple)

Publish packages individually:

```bash
# Build all packages
make build

# Publish root package
npm publish

# Publish React package
cd packages/react
npm publish
cd ../..
```

#### Method B: Using Changesets (Recommended)

Use the automated versioning and publishing system:

```bash
# 1. Add changeset describing your changes
npx changeset add

# 2. Version packages according to changesets
npx changeset version

# 3. Build and publish
npm run publish
```

#### Method C: CI/CD Publishing

For automated publishing in continuous integration:

```bash
# Set npm token in environment
export NPM_TOKEN="your-npm-token"

# Run publish command
npm run publish
```

## Package Details

### Core Package: `@adview/core`

- **Package Name**: `@adview/core`
- **Scope**: `@adview`
- **Registry**: `https://registry.npmjs.org/`
- **Public Access**: ✅
- **Build Target**: ESM + CommonJS
- **TypeScript**: ✅ (with `.d.ts` files)

**Exports:**

- Main: `./dist/index.js`
- Utils: `./dist/utils.js`
- Typings: `./dist/typings.js`

### React Package: `@adview/react`

- **Package Name**: `@adview/react`
- **Scope**: `@adview`
- **Registry**: `https://registry.npmjs.org/`
- **Public Access**: ✅
- **Build Target**: ESM + CommonJS
- **TypeScript**: ✅ (with `.d.ts` files)

**Exports:**

- Main: `./dist/index.js`
- Server: `./dist/server.js`

## Adding New Packages

### Creating Framework Packages

To add new framework support (e.g., Vue, Angular, Vanilla JS):

```bash
# Generate package structure
make create-package name=vue framework=Vue language=typescript

# Navigate to new package
cd packages/vue

# Implement framework-specific code
# ... add your Vue components ...

# Test build
npm run build

# Verify package contents
npm publish --dry-run
```

### Package Structure

New packages should follow this structure:

```
packages/[framework]/
├── src/
│   ├── index.ts                 # Main entry point
│   └── [framework-components]   # Framework-specific code
├── dist/                        # Built files (generated)
├── package.json                 # Package configuration
├── tsup.config.ts              # Build configuration
├── README.md                   # Package documentation
├── LICENSE                     # Apache 2.0 license
└── CONTRIBUTING.md             # Contribution guidelines
```

## Version Management

### Semantic Versioning

Follow [semantic versioning](https://semver.org/):

- **MAJOR** (1.0.0): Breaking changes
- **MINOR** (0.1.0): New features (backward compatible)
- **PATCH** (0.0.1): Bug fixes (backward compatible)

### Version Synchronization

- Keep all packages at the same major version when possible
- Use changesets for coordinated version bumps
- Update dependencies between packages when needed

### Example Version Workflow

```bash
# 1. Make changes to packages
# ... edit code ...

# 2. Add changeset
npx changeset add
# Choose packages to update and change types

# 3. Version packages
npx changeset version

# 4. Review generated changes
git diff

# 5. Commit version changes
git add .
git commit -m "Version packages"

# 6. Build and publish
npm run publish

# 7. Push changes and tags
git push
git push --tags
```

## Troubleshooting

### Common Issues

#### 1. Permission Denied (E403)

```
npm ERR! code E403
npm ERR! 403 Forbidden - PUT https://registry.npmjs.org/@adview%2freact
```

**Solution:**

- Verify you have publishing permissions for the `@adview` scope
- Contact scope owner to add you as a maintainer

#### 2. Authentication Error (E401)

```
npm ERR! code E401
npm ERR! 401 Unauthorized
```

**Solution:**

- Run `npm login` again
- Check if your npm token is valid
- Verify 2FA settings if enabled

#### 3. Version Already Exists (E409)

```
npm ERR! code E409
npm ERR! Cannot publish over existing version
```

**Solution:**

- Increment version in `package.json`
- Use `npx changeset version` for automated versioning

#### 4. Build Failures

```
Build failed: tsup encountered errors
```

**Solution:**

- Check TypeScript compilation errors
- Verify all dependencies are installed
- Run `make clean && make build`

### Debug Commands

```bash
# Check what would be published
npm publish --dry-run

# Verify package contents
npm pack
tar -tf adview-1.0.0.tgz

# Check registry status
npm view adview
npm view @adview/react

# Verify authentication
npm whoami
npm access list packages
```

## Best Practices

### Before Publishing

1. **Test thoroughly**: Run all tests and verify functionality
2. **Update documentation**: Ensure README and API docs are current
3. **Clean build**: Always start with a clean build
4. **Version appropriately**: Follow semantic versioning
5. **Check dependencies**: Ensure all peer dependencies are documented

### During Publishing

1. **Use dry-run first**: Always test with `--dry-run`
2. **Monitor output**: Check for warnings or errors
3. **Verify contents**: Ensure correct files are included
4. **Test install**: Verify packages can be installed after publishing

### After Publishing

1. **Test installation**: Install from npm and verify functionality
2. **Update examples**: Ensure documentation examples work
3. **Tag releases**: Create git tags for version tracking
4. **Announce**: Communicate changes to users

## Security Considerations

### npm Security

- Enable 2FA on your npm account
- Use scoped packages (`@adview/`) to prevent name conflicts
- Regularly audit dependencies with `npm audit`
- Keep npm token secure and rotate periodically

### Package Security

- Review all dependencies before publishing
- Use `npm ci` in CI/CD for reproducible builds
- Include only necessary files in published packages
- Regularly update dependencies for security patches

## CI/CD Integration

### GitHub Actions Workflows

The repository includes several GitHub Actions workflows for automated testing and publishing:

#### 1. CI Workflow (`.github/workflows/ci.yml`)

Runs on every push and pull request to `main` and `develop` branches:

- **Matrix testing**: Tests on Node.js 18 and 20
- **Linting**: Runs ESLint on codebase
- **Building**: Ensures all packages build successfully
- **Dry-run publishing**: Tests package publication without actually publishing
- **Changeset validation**: Warns if changesets are missing in PRs

#### 2. Release Workflow (`.github/workflows/release.yml`)

Runs on pushes to `main` branch using Changesets:

- **Automated versioning**: Uses changesets to determine version bumps
- **Release PR creation**: Creates PRs for version updates
- **Automated publishing**: Publishes to npm when release PR is merged
- **Git tagging**: Creates git tags for published versions

#### 3. Manual Tag Publishing (`.github/workflows/publish.yml`)

Runs when version tags are manually created:

- **Tag-based publishing**: Triggers on `v*` or `*.*.*` tags
- **Security checks**: Only runs on actual tags
- **Full publication**: Builds and publishes all packages
- **GitHub releases**: Creates GitHub releases with changelog

### Setup Requirements

#### 1. GitHub Secrets

Configure these secrets in your GitHub repository settings:

**Required:**

- `NPM_TOKEN`: Your npm authentication token with publishing permissions

**Optional (auto-provided by GitHub):**

- `GITHUB_TOKEN`: Automatically provided for GitHub API access

#### 2. npm Token Setup

1. **Create npm token:**

   ```bash
   # Login to npm
   npm login
   
   # Create automation token (recommended for CI/CD)
   npm token create --type=automation
   ```

2. **Add to GitHub secrets:**
   - Go to repository Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `NPM_TOKEN`
   - Value: Your npm token

#### 3. Permissions Setup

Ensure your npm account has:

- Publishing permissions for `@adview` scope
- 2FA enabled (recommended)
- Automation tokens properly scoped

### Publishing Workflows

#### Method 1: Changesets (Recommended)

This is the main workflow for regular releases:

```bash
# 1. Make your changes
git checkout -b feature/my-feature

# 2. Add changeset describing changes
npx changeset add

# 3. Commit and create PR
git add .
git commit -m "feat: add new feature"
git push origin feature/my-feature

# 4. Merge PR to main
# → Triggers release workflow
# → Creates version PR or publishes if version PR is merged
```

#### Method 2: Manual Tag Publishing

For hotfixes or manual releases:

```bash
# 1. Ensure main branch is ready
git checkout main
git pull origin main

# 2. Create and push version tag
git tag v1.0.1
git push origin v1.0.1

# → Triggers publish workflow
# → Publishes packages and creates GitHub release
```

### Workflow Examples

#### Example 1: Feature Release

```bash
# Developer workflow
git checkout -b feature/new-component
# ... make changes ...
npx changeset add  # Choose minor version bump
git commit -am "feat: add new AdView component"
git push origin feature/new-component

# Create PR → CI runs → Merge to main
# → Release workflow creates version PR
# → Merge version PR → Packages published automatically
```

#### Example 2: Hotfix Release

```bash
# Hotfix workflow
git checkout -b hotfix/critical-bug
# ... fix bug ...
npx changeset add  # Choose patch version bump
git commit -am "fix: resolve critical rendering bug"
git push origin hotfix/critical-bug

# Create PR → CI runs → Merge to main
# → Release workflow publishes immediately
```

#### Example 3: Manual Emergency Release

```bash
# Emergency manual release
git checkout main
git pull origin main
# Manually update version in package.json if needed
git tag v1.0.2
git push origin v1.0.2
# → Publishes immediately via tag workflow
```

### Advanced Configuration

#### Custom Workflow Triggers

Modify `.github/workflows/publish.yml` for custom triggers:

```yaml
on:
  push:
    tags:
      - 'v*'           # Version tags
      - 'release/*'    # Release branches
  workflow_dispatch:    # Manual trigger
    inputs:
      version:
        description: 'Version to publish'
        required: true
```

#### Multi-Environment Publishing

For staging/production environments:

```yaml
jobs:
  publish-staging:
    if: contains(github.ref, 'beta')
    # ... publish to staging registry
    
  publish-production:
    if: "!contains(github.ref, 'beta')"
    # ... publish to main registry
```

#### Slack/Discord Notifications

Add notification steps:

```yaml
- name: Notify team
  if: success()
  uses: 8398a7/action-slack@v3
  with:
    status: success
    text: "📦 Published ${{ github.ref_name }} to npm!"
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

### Troubleshooting CI/CD

#### Common Issues

1. **npm Token Invalid:**

   ```
   npm ERR! code E401

   npm ERR! 401 Unauthorized
   ```

   **Solution:** Regenerate npm token and update GitHub secret

2. **Permission Denied:**

   ```
   npm ERR! code E403
   npm ERR! 403 Forbidden

   ```

   **Solution:** Verify @adview scope permissions

3. **Build Failures:**

   ```
   Error: Command failed: make build
   ```

   **Solution:** Check dependencies and TypeScript errors

4. **Tag Already Exists:**

   ```

   fatal: tag 'v1.0.0' already exists
   ```

   **Solution:** Use a different version number

## CI/CD Integration

### GitHub Actions Workflows

The repository includes three automated workflows:

#### 1. CI Workflow (`.github/workflows/ci.yml`)

**Triggered on**: Push to main/develop branches, Pull Requests
**What it does**:

- Tests builds on Node.js 18 and 20
- Runs linting and tests
- Performs dry-run publish checks

- Verifies package contents
- Checks for changeset files on PRs

#### 2. Publish Workflow (`.github/workflows/publish.yml`)

**Triggered on**: Version tag push (e.g., `v1.0.0`, `1.2.3`)
**What it does**:

- Validates semantic version format
- Builds all packages
- Runs tests and linting
- Publishes to npm registry
- Creates GitHub release
- Provides detailed success/failure notifications

#### 3. Release Workflow (`.github/workflows/release.yml`)

**Triggered on**: Push to main branch
**What it does**:

- Manages changeset-based releases
- Creates release PRs for version bumps
- Auto-publishes when release PR is merged

### Publishing via Tags

The easiest way to trigger automated publishing:

```bash
# Create and push a version tag
git tag v1.0.1
git push origin v1.0.1

# Or use npm version to create tag automatically
npm version patch  # creates v1.0.1 tag
git push --follow-tags
```

### Setup Requirements

#### Repository Secrets

Configure these secrets in GitHub repository settings:

1. **`NPM_TOKEN`**: npm authentication token

   ```bash
   # Generate token on npmjs.com
   npm login
   npm token create --read-and-publish
   ```

2. **`GITHUB_TOKEN`**: Automatically provided by GitHub Actions

#### Branch Protection

Recommended branch protection rules for `main`:

- Require pull request reviews
- Require status checks (CI workflow)  
- Require branches to be up to date
- Restrict pushes to admins only

#### Debug Commands

Add debug steps to workflows:

```yaml
- name: Debug environment
  run: |
    echo "Node version: $(node --version)"
    echo "npm version: $(npm --version)"
    echo "Current user: $(npm whoami || echo 'Not logged in')"
    echo "Registry: $(npm config get registry)"
    ls -la packages/
```

### Security Best Practices

1. **Token Security:**
   - Use automation tokens for CI/CD
   - Rotate tokens regularly
   - Never commit tokens to code

2. **Workflow Security:**
   - Pin action versions (`@v4` not `@main`)
   - Use `permissions` blocks to limit access
   - Enable branch protection rules

3. **Package Security:**
   - Enable npm provenance
   - Use scoped packages
   - Regular dependency audits

### GitHub Actions Example

```yaml
name: Publish Packages
on:
  push:
    tags: ['v*']

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'
      - run: npm ci
      - run: make build
      - run: npm run publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### Environment Variables

- `NPM_TOKEN`: npm authentication token
- `NODE_AUTH_TOKEN`: Alternative name for npm token
- `NPM_CONFIG_REGISTRY`: Custom registry URL if needed

## Support

For questions or issues with publishing:

1. Check this guide first
2. Review npm documentation
3. Open an issue in the repository
4. Contact the maintainers

---

**Happy Publishing! 🚀**
