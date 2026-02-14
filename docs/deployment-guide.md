# Deployment Guide

**Project**: WorkfitAI
**Last Updated**: 2026-02-14
**Version**: 1.0.0
**Stack**: Next.js 16 + React 19 + TailwindCSS v4 + shadcn/ui

---

## Table of Contents

1. [Local Development](#local-development)
2. [Production Build](#production-build)
3. [Environment Configuration](#environment-configuration)
4. [Deployment Platforms](#deployment-platforms)
5. [Monitoring & Health Checks](#monitoring--health-checks)
6. [Troubleshooting](#troubleshooting)

---

## Local Development

### Prerequisites

- **Node.js**: 20+ (LTS recommended)
- **npm**: 10+ (included with Node.js)
- **Git**: Latest version

### Initial Setup

```bash
# Clone repository
git clone <repository-url>
cd workfitai

# Install dependencies
npm install

# Verify installation
npm run build
```

### Development Server

```bash
# Start development server with hot reload
npm run dev

# Server will be available at:
# http://localhost:3000

# Press Ctrl+C to stop the server
```

**Development Server Features**:
- Hot Module Replacement (HMR) - Changes reflect instantly
- Fast Refresh - React state preserved during edits
- Error Overlay - Compilation errors shown in browser
- Source Maps - Debug original TypeScript/JSX

### Development Workflow

```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Run linter
npm run lint

# Terminal 3: Run tests (when available)
npm test

# Terminal 4: Monitor for changes
npm run build -- --watch
```

### Code Quality Checks

```bash
# Run ESLint
npm run lint

# Fix linting issues (where possible)
npm run lint -- --fix

# Check TypeScript
npx tsc --noEmit
```

---

## Production Build

### Building for Production

```bash
# Create optimized production build
npm run build

# Output directory: .next/
# Built files are optimized and minified
```

**Build Output**:
- `.next/` - Compiled application
- `.next/static/` - Static assets and bundles
- `.next/server/` - Server-side code

### Production Server

```bash
# Start production server
npm start

# Server listens on port 3000 by default
# http://localhost:3000
```

### Build Process Details

**Compilation Stages**:
1. TypeScript compilation and type checking
2. Next.js App Router optimization
3. TailwindCSS processing (dead code elimination)
4. Code splitting per route
5. Asset minification and optimization
6. Static generation (for static pages)

**Build Time Optimization**:
- Minimal dependencies = faster builds
- No SCSS compilation needed (TailwindCSS v4 handles all styling)
- Automatic code splitting reduces bundle size
- Tree-shaking removes unused code

### Build Configuration

**Configuration File**: `next.config.ts`

```typescript
// next.config.ts - Key settings for production

// Image optimization
images: {
  domains: ['example.com']  // Add external image domains
}

// Webpack configuration
webpack: (config) => {
  // Custom webpack settings
  return config
}

// Environment variables
env: {
  // Public variables (accessible in browser)
  // Use NEXT_PUBLIC_ prefix
}
```

---

## Environment Configuration

### Environment Variables

**Development** (`.env.local`):
```env
# Development API endpoints
# Add as needed for your features
```

**Production** (`.env.production`):
```env
# Production API endpoints
# Add as needed for your features
```

**Important Notes**:
- `.env.local` - Never commit (gitignored)
- `.env.production` - Never commit (gitignored)
- `NEXT_PUBLIC_*` - Accessible in browser
- Other vars - Server-side only

### Vercel Environment Variables

If deploying to Vercel:

1. Go to Project Settings
2. Navigate to Environment Variables
3. Add variables for Production/Preview/Development
4. Redeploy to apply changes

**Example**:
```
Variable: NEXT_PUBLIC_API_URL
Value: https://api.example.com
Environments: Production
```

### Docker Environment

For Docker deployments, use environment variables:

```dockerfile
ENV NODE_ENV=production
ENV NEXT_PUBLIC_API_URL=https://api.example.com
```

---

## Deployment Platforms

### Option 1: Vercel (Recommended)

Vercel is the official Next.js hosting platform with zero-config deployment.

#### Setup

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow prompts to connect GitHub account and configure project
```

#### Configuration (`vercel.json`)

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "nodeVersion": "20.x"
}
```

**Vercel Features**:
- Automatic deployments from GitHub
- Preview deployments for pull requests
- Environment variables management
- Built-in edge caching
- Automatic scaling

#### Environment Variables on Vercel

1. Project Settings → Environment Variables
2. Add variables for each environment
3. Redeploy to apply

#### Deployment URL

After deployment, your app will be available at:
```
https://[project-name].vercel.app
```

---

### Option 2: AWS Amplify

AWS Amplify provides a managed hosting solution with CI/CD.

#### Setup

```bash
# Install Amplify CLI
npm install -g @aws-amplify/cli

# Initialize Amplify
amplify init

# Add hosting
amplify add hosting

# Publish
amplify publish
```

#### Configuration

Create `amplify.yml`:
```yaml
version: 1
frontend:
  phases:
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - 'node_modules/**/*'
```

---

### Option 3: Netlify

Netlify offers easy deployment with automatic builds.

#### Setup

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=.next
```

#### Configuration (`netlify.toml`)

```toml
[build]
command = "npm run build"
publish = ".next"

[build.environment]
NODE_VERSION = "20"

[[redirects]]
from = "/*"
to = "/index.html"
status = 200
```

---

### Option 4: Docker Containerization

Deploy using Docker containers.

#### Dockerfile

```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Runtime stage
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./

EXPOSE 3000
CMD ["npm", "start"]
```

#### Build & Run

```bash
# Build image
docker build -t workfitai:latest .

# Run container
docker run -p 3000:3000 workfitai:latest

# Access at http://localhost:3000
```

#### Docker Compose

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      # Add environment variables
    restart: unless-stopped
```

---

### Option 5: Self-Hosted (Linux/Unix)

Deploy on your own server using systemd.

#### Prerequisites

- Linux server with Node.js 20+
- SSH access
- Domain configured to server IP

#### Deployment Steps

```bash
# 1. SSH into server
ssh user@your-server.com

# 2. Clone repository
cd /var/www
git clone <repository-url> workfitai
cd workfitai

# 3. Install dependencies
npm install

# 4. Build
npm run build

# 5. Create systemd service
sudo nano /etc/systemd/system/workfitai.service
```

#### Service File

```ini
[Unit]
Description=WorkfitAI Next.js Application
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/workfitai
Environment="NODE_ENV=production"
ExecStart=/usr/bin/npm start
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

#### Enable & Start Service

```bash
# Enable service
sudo systemctl enable workfitai

# Start service
sudo systemctl start workfitai

# Check status
sudo systemctl status workfitai

# View logs
sudo journalctl -u workfitai -f
```

---

## Monitoring & Health Checks

### Health Check Endpoint (Future)

When you add an API layer, create a health check endpoint:

```typescript
// app/api/health/route.ts
export async function GET() {
  return Response.json({ status: 'ok' }, { status: 200 })
}
```

### Vercel Monitoring

- Vercel Analytics (built-in)
- Web Vitals tracking
- Performance monitoring
- Error tracking

### Application Monitoring

For production monitoring, consider:

**Error Tracking**:
- Sentry
- Rollbar
- LogRocket

**Performance Monitoring**:
- Google Analytics
- Mixpanel
- Amplitude

**Logging**:
- CloudWatch (AWS)
- Stackdriver (GCP)
- ELK Stack (self-hosted)

### Uptime Monitoring

Services to monitor uptime:
- UptimeRobot
- Pingdom
- StatusCake

Configuration (UptimeRobot example):
```
URL: https://your-domain.com
Check Interval: 5 minutes
Alert: Email on downtime
```

---

## Performance Optimization

### Build Performance

**Current Setup Optimizations**:
- ✅ TailwindCSS v4 automatic dead code elimination
- ✅ Next.js automatic code splitting per route
- ✅ Geist fonts optimized via next/font
- ✅ Image optimization via Next.js Image
- ✅ Minimal dependencies

### Runtime Performance

**Targets**:
- First Contentful Paint (FCP): < 1.5s
- Largest Contentful Paint (LCP): < 2.5s
- Cumulative Layout Shift (CLS): < 0.1

**How to Measure**:
```bash
# Lighthouse CLI
npm install -g @lhci/cli@latest
lhci autorun
```

### Caching Strategy

**Static Pages**:
```typescript
// app/page.tsx - Static page
export default function Page() {
  return <div>Static content</div>
}
```

**Dynamic Content**:
```typescript
// app/api/data/route.ts
export const revalidate = 60  // Revalidate every 60 seconds (ISR)

export async function GET() {
  // Fetch and return data
  return Response.json({ data: [] })
}
```

---

## Troubleshooting

### Build Fails

**Error**: `ESLint error during build`

**Solution**:
```bash
npm run lint -- --fix
npm run build
```

**Error**: `Out of memory during build`

**Solution**:
```bash
# Increase Node.js memory
NODE_OPTIONS=--max-old-space-size=4096 npm run build
```

### Development Server Issues

**Error**: `Port 3000 already in use`

**Solution**:
```bash
# Use different port
npm run dev -- -p 3001

# Or kill process using port
lsof -ti:3000 | xargs kill -9
```

### Performance Issues

**Large build size**:
1. Check for unused dependencies: `npm ls`
2. Use dynamic imports: `import dynamic from 'next/dynamic'`
3. Monitor bundle size: `npm install --save-dev webpack-bundle-analyzer`

**Slow development server**:
1. Clear `.next` directory: `rm -rf .next`
2. Clear npm cache: `npm cache clean --force`
3. Reinstall dependencies: `rm -rf node_modules && npm install`

### Deployment Issues

**Vercel Build Fails**:
1. Check build logs in Vercel dashboard
2. Verify environment variables are set
3. Ensure Node.js version is 20+

**Docker Container Won't Start**:
1. Check logs: `docker logs <container-id>`
2. Verify port mapping: `docker port <container-id>`
3. Check environment variables are passed

---

## Rollback Procedure

### Vercel Rollback

1. Go to Project → Deployments
2. Find previous successful deployment
3. Click menu → Promote to Production

### Git-Based Rollback

```bash
# Find previous commit
git log --oneline

# Revert to previous commit
git revert <commit-hash>

# Push and redeploy
git push origin main
```

### Manual Rollback

```bash
# Build previous version
git checkout <previous-commit>
npm install
npm run build
npm start
```

---

## Checklists

### Pre-Deployment Checklist

- [ ] All tests passing
- [ ] ESLint checks pass (`npm run lint`)
- [ ] No TypeScript errors (`npx tsc --noEmit`)
- [ ] Build successful (`npm run build`)
- [ ] Environment variables configured
- [ ] Security headers configured
- [ ] Performance targets met
- [ ] Monitoring configured

### Post-Deployment Checklist

- [ ] Application accessible at deployment URL
- [ ] Health check endpoint responds
- [ ] No console errors in browser
- [ ] Performance metrics acceptable
- [ ] Environment variables working correctly
- [ ] Error tracking configured
- [ ] Monitoring active
- [ ] Team notified of deployment

---

## Support & Resources

### Documentation
- [Next.js 16 Docs](https://nextjs.org/docs)
- [React 19 Docs](https://react.dev)
- [TailwindCSS v4 Docs](https://tailwindcss.com/docs)
- [shadcn/ui Docs](https://ui.shadcn.com)

### Deployment Resources
- [Vercel Deployment](https://vercel.com/docs/deployments/overview)
- [AWS Amplify Docs](https://docs.amplify.aws)
- [Netlify Docs](https://docs.netlify.com)
- [Docker Documentation](https://docs.docker.com)

### Community
- [Next.js Discord](https://discord.gg/nextjs)
- [React Community](https://react.dev/community)
- [TailwindCSS Discord](https://tailwindcss.com/discord)

---

## Frequently Asked Questions

**Q: What's the recommended deployment platform?**
A: Vercel is recommended for Next.js - it's the official platform with zero-config setup.

**Q: How long does a build take?**
A: ~30 seconds for a clean build. Development rebuild: ~2-5 seconds.

**Q: Can I use Docker?**
A: Yes, see Docker section above for containerization.

**Q: How do I set environment variables?**
A: Create `.env.production` file or use platform-specific environment variable settings.

**Q: What's the minimum Node.js version?**
A: Node.js 20+ (LTS recommended)

---

**Generated**: 2026-02-14
**Maintained by**: WorkfitAI Development Team
**Last Reviewed**: 2026-02-14
