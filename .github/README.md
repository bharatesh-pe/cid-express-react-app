# GitHub Actions & CI/CD Setup

This repository includes comprehensive GitHub Actions workflows for automated validation, testing, and deployment.

## Workflows Overview

### 1. CI/CD Pipeline (`ci.yml`)
**Triggers:** Push to `main`/`develop` branches, Pull Requests

**Jobs:**
- **Backend Validation**: Linting, security audit, testing with PostgreSQL & Redis
- **Frontend Validation**: Linting, security audit, testing, build verification
- **Docker Validation**: Docker image builds and compose validation
- **Security Scan**: Vulnerability scanning with Trivy (PR only)
- **Code Quality**: CodeQL analysis (PR only)
- **Deploy to Staging**: Automatic deployment to staging on `develop` branch

### 2. Pull Request Checks (`pr-checks.yml`)
**Triggers:** Pull Request events

**Jobs:**
- **PR Size Check**: Validates PR size and file count
- **Code Coverage Check**: Runs tests with coverage reporting
- **Dependency Check**: Checks for outdated dependencies and vulnerabilities
- **File Type Check**: Validates file sizes and sensitive file detection
- **Commit Message Check**: Enforces conventional commit format

### 3. Release Workflow (`release.yml`)
**Triggers:** Git tags (e.g., `v1.0.0`)

**Features:**
- Automated release creation
- Docker image building and pushing to GitHub Container Registry
- Comprehensive testing before release

## Configuration Files

### ESLint Configuration (`.eslintrc.js`)
- Comprehensive linting rules for JavaScript/TypeScript
- Security-focused rules
- Code quality metrics
- Separate configurations for test files

### Dependabot Configuration (`.github/dependabot.yml`)
- Automated dependency updates
- Weekly schedule for security updates
- Separate tracking for backend, frontend, and Docker dependencies

### Pre-commit Hooks (`.pre-commit-config.yaml`)
- Local validation before commits
- ESLint, security checks, and testing
- Large file detection

## Validation Features

### Backend Validation
- **Linting**: ESLint with TypeScript support
- **Security**: npm audit with configurable severity levels
- **Testing**: Jest with database integration
- **Database**: PostgreSQL and Redis service integration
- **Build**: Application startup verification

### Frontend Validation
- **Linting**: ESLint with React support
- **Security**: npm audit for vulnerabilities
- **Testing**: React Testing Library with coverage
- **Build**: Production build verification
- **Artifacts**: Build artifacts uploaded for deployment

### Docker Validation
- **Multi-stage builds**: Backend and frontend containers
- **Compose validation**: Docker Compose configuration testing
- **Registry**: Automated image pushing to GitHub Container Registry
- **Caching**: Build cache optimization

### Security Features
- **Vulnerability Scanning**: Trivy for container and filesystem scanning
- **Dependency Auditing**: Automated security updates via Dependabot
- **Code Analysis**: CodeQL for security pattern detection
- **Sensitive File Detection**: Prevents accidental commits of secrets

## Usage

### Running Validations Locally

```bash
# Backend validation
cd backend
npm run validate

# Frontend validation
cd frontend
npm run validate

# Full project validation
npm run validate  # (if added to root package.json)
```

### Pre-commit Setup

```bash
# Install pre-commit
pip install pre-commit

# Install pre-commit hooks
pre-commit install

# Run hooks manually
pre-commit run --all-files
```

### Manual Workflow Triggers

You can manually trigger workflows from the GitHub Actions tab:
1. Go to Actions tab in your repository
2. Select the workflow you want to run
3. Click "Run workflow"

## Environment Variables

The workflows use the following environment variables:

- `NODE_VERSION`: Node.js version (default: 18)
- `POSTGRES_PASSWORD`: Database password
- `POSTGRES_DB`: Database name
- `POSTGRES_USER`: Database user
- `REDIS_PASSWORD`: Redis password

## Secrets Required

For full functionality, ensure these secrets are configured in your repository:

- `GITHUB_TOKEN`: Automatically provided
- `DOCKER_REGISTRY_TOKEN`: For Docker registry access (if using external registry)

## Monitoring and Notifications

- Workflow status is displayed on pull requests
- Failed workflows block merging (if branch protection rules are enabled)
- Security alerts are sent to repository administrators
- Dependabot creates pull requests for dependency updates

## Customization

### Adding New Validation Steps

1. Edit the appropriate workflow file (`.github/workflows/`)
2. Add new steps to the relevant job
3. Update the README if needed

### Modifying Linting Rules

1. Edit `.eslintrc.js` for JavaScript/TypeScript rules
2. Update pre-commit configuration if needed
3. Test changes locally before committing

### Adding New Tests

1. Add test files following the existing patterns
2. Update package.json scripts if needed
3. Ensure tests run in CI environment

## Troubleshooting

### Common Issues

1. **Tests failing in CI but passing locally**
   - Check environment variables
   - Verify database connections
   - Check for missing dependencies

2. **Docker builds failing**
   - Verify Dockerfile syntax
   - Check for missing files in build context
   - Ensure proper .dockerignore configuration

3. **Linting errors**
   - Run `npm run lint:fix` to auto-fix issues
   - Update ESLint configuration if needed
   - Check for TypeScript type errors

### Getting Help

- Check workflow logs in the Actions tab
- Review the specific step that failed
- Ensure all required secrets are configured
- Verify environment variables are set correctly


