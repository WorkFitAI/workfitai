# System Architecture

**Last Updated**: 2026-04-27
**Version**: 1.1.0
**Project**: WorkfitAI
**Stack**: Next.js 16 + React 19 + TailwindCSS v4 + shadcn/ui

## Overview

WorkfitAI is built with a modern, minimal architecture that leverages the latest web technologies. The system follows a client-server architecture with Server-Side Rendering (SSR) capabilities via Next.js 16, React Server Components (RSC), and a component-driven design using shadcn/ui.

**Architecture Type**: Client-Server with Server Components

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Browser / Client                         │
├─────────────────────────────────────────────────────────────┤
│  React 19.2.3 Components + TailwindCSS v4 + shadcn/ui      │
│  - React Server Components (RSC)                            │
│  - Client Components ("use client")                         │
│  - Dark Mode Support (CSS Variables)                        │
└────────────────┬────────────────────────────────────────────┘
                 │
                 │ HTTP/HTTPS
                 │
┌────────────────▼────────────────────────────────────────────┐
│              Next.js 16 App Router (Server)                 │
├─────────────────────────────────────────────────────────────┤
│  - File-based routing (app/ directory)                      │
│  - Server-Side Rendering (SSR)                             │
│  - Static Generation (SSG - future)                        │
│  - API Routes (future)                                     │
│  - Middleware (future)                                     │
└─────────────────────────────────────────────────────────────┘
```

## System Components

### 1. Presentation Layer

#### Next.js App Router (`app/`)

**Responsibilities**:
- File-based routing
- Server-side rendering
- Layout management
- Page rendering
- Metadata generation

**Current Structure**:
```
app/
├── layout.tsx           # Root layout with Geist fonts + metadata
├── page.tsx             # Home page
├── globals.css          # Global styles + theme configuration
└── favicon.ico          # Site icon
```

**Future Expansion** (when features are added):
```
app/
├── (candidate)/         # Public routes group
│   ├── layout.tsx
│   ├── page.tsx
│   └── [route]/page.tsx
├── (control)/           # Admin routes group
│   ├── layout.tsx
│   ├── admin/page.tsx
│   └── [route]/page.tsx
├── layout.tsx           # Root layout
├── page.tsx             # Home page
└── globals.css          # Global styles
```

#### React Components (`components/`)

**Component Types**:

1. **Server Components** (default)
   - Rendered on the server
   - Have access to backend resources
   - Cannot use hooks or event listeners
   - Examples: Layout wrappers, page components

2. **Client Components** (`"use client"`)
   - Rendered on the client
   - Have access to browser APIs
   - Can use hooks (useState, useEffect, etc.)
   - Examples: Forms, interactive UI, state management

**Component Organization**:
```
components/
├── ui/                  # shadcn/ui components (auto-generated)
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   └── ...
└── [custom components]  # Domain-specific components (future)
```

**Best Practices**:
- Keep components small and focused
- Use TypeScript interfaces for all props
- Leverage shadcn/ui components as building blocks
- Use `cn()` utility for conditional styling

### 2. Styling Layer

#### TailwindCSS v4 (CSS-First)

**Configuration**: No `tailwind.config.js`
- All configuration in `app/globals.css`
- CSS-first approach with `@import` and `@theme`

**Key Files**:
- `app/globals.css` - Global styles and theme

**Features**:
- Utility-first CSS classes
- Dark mode via CSS variables
- Responsive design (mobile-first)
- Design tokens system

**Design Token System** (`globals.css`):

**Color Tokens** (Light Mode - `:root`):
```css
--background: oklch(1 0 0)              /* White */
--foreground: oklch(0.145 0 0)          /* Dark text */
--primary: oklch(0.205 0 0)             /* Primary action */
--secondary: oklch(0.97 0 0)            /* Secondary */
--muted: oklch(0.97 0 0)                /* Muted backgrounds */
--accent: oklch(0.97 0 0)               /* Accent color */
--destructive: oklch(0.577 0.245 27)    /* Error/destructive */
```

**Color Tokens** (Dark Mode - `.dark`):
- Inverted oklch values for contrast
- Semi-transparent overlays
- Enhanced saturation for dark backgrounds

**Radius Tokens**:
- `--radius: 0.625rem` (base)
- `--radius-sm` through `--radius-4xl` (computed variants)

**Font Tokens**:
- `--font-sans: var(--font-geist-sans)` (Geist Sans via Google Fonts)
- `--font-mono: var(--font-geist-mono)` (Geist Mono via Google Fonts)

#### shadcn/ui Integration

**What is shadcn/ui?**
- Collection of high-quality React components
- Built on Radix UI primitives
- Styled with TailwindCSS
- Fully customizable and copyable

**Configuration** (`components.json`):
```json
{
  "style": "new-york",              // Design style
  "rsc": true,                      // React Server Components
  "tsx": true,                      // TypeScript
  "tailwind": {
    "css": "app/globals.css",
    "cssVariables": true            // Use CSS variables
  },
  "iconLibrary": "lucide",          // Icon library (lucide-react)
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui"
  }
}
```

**Adding Components**:
```bash
# Single component
npx shadcn add button

# Multiple components
npx shadcn add card dialog form input
```

**Using Components**:
```typescript
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function Example() {
  return (
    <Card>
      <CardContent>
        <Button>Click me</Button>
      </CardContent>
    </Card>
  )
}
```

### 3. Utilities Layer

#### Core Utilities (`lib/utils.ts`)

**Main Function: `cn()`**
```typescript
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

**Purpose**: Safely merge TailwindCSS class names
- Handles conditional classes via `clsx()`
- Resolves conflicts via `tailwind-merge()`
- Always use for dynamic className merging

**Usage**:
```typescript
import { cn } from "@/lib/utils"

<button className={cn(
  "px-4 py-2 rounded-md",
  isActive && "bg-primary text-primary-foreground",
  isDisabled && "opacity-50"
)}>
  Click
</button>
```

#### Future Utilities (to be added as needed)
- API clients
- Custom hooks
- Data validation
- Authentication
- Form utilities

### 4. Type System

**TypeScript Configuration**:
- Strict mode enabled
- Path alias: `@/*` maps to root directory
- Target: ES2017
- Module: ESNext

**Type Organization** (future):
```
types/
├── index.ts              # Re-exports
├── api.ts               # API response types
├── domain.ts            # Domain models
└── components.ts        # Component prop types
```

**Type Best Practices**:
- Define interfaces for all component props
- Use generics for reusable types
- Avoid `any` type
- Explicit return types on functions

### 5. Data Layer

**Current Implementation**:

1. **API Client** (`lib/api-client.ts`)
   - Centralized fetch wrapper with auth headers
   - 401 error handling with silent token refresh
   - Concurrent refresh deduplication
   - Supports GET, POST, PUT, PATCH, DELETE
   - FormData upload method for multipart requests

2. **Service Layer** (`lib/cv/cv-service.ts`, `lib/auth/auth-service.ts`)
   - Business logic abstraction for API calls
   - Type-safe request/response handling
   - Auth: login, register, token refresh, password reset, OAuth
   - CV: list (paginated), upload, update, delete, download

3. **Custom Hooks** (`hooks/useCVs.ts`)
   - React state management for async data
   - Pagination logic (page → API offset conversion)
   - Error handling and loading states

4. **Type Safety** (`types/cv.ts`, `types/auth.ts`, `types/response.ts`)
   - TypeScript interfaces for all API models
   - Generic ApiResponse wrapper
   - Entity-specific types (CVMetadata, CVListResponse, etc.)

## Design Principles

### 1. Server-First

Leverage Next.js 16 Server Components:
- Render on server by default
- Only use `"use client"` when necessary
- Reduce JavaScript sent to browser
- Direct access to backend resources

### 2. Component-Driven

Use shadcn/ui as foundation:
- Build on Radix UI primitives
- Consistent design system
- Accessibility built-in
- Highly customizable

### 3. Utility-First Styling

TailwindCSS v4 CSS-first approach:
- No custom CSS files
- All styling via utilities
- Semantic design tokens
- Dark mode via CSS variables

### 4. Type Safety

TypeScript strict mode:
- Explicit types everywhere
- Compile-time error detection
- Better IDE support
- Improved developer experience

## Technology Stack Details

### Core Framework
- **Next.js 16.1.6**: React framework with App Router
- **React 19.2.3**: UI library with automatic batching
- **React DOM 19.2.3**: React rendering engine

### Styling
- **TailwindCSS v4**: Utility-first CSS framework
- **@tailwindcss/postcss v4**: PostCSS plugin for v4
- **shadcn/ui 3.8.4**: Component library
- **Radix UI 1.4.3**: Headless UI primitives
- **class-variance-authority 0.7.1**: Type-safe component variants
- **clsx 2.1.1**: Conditional class concatenation
- **tailwind-merge 3.4.0**: TailwindCSS class merging
- **tw-animate-css 1.4.0**: Animation utilities

### Icons & Typography
- **lucide-react 0.564.0**: SVG icon library
- **Geist fonts**: Via next/font/google (GeistSans + GeistMono)

### Development
- **TypeScript 5**: Language and type system
- **ESLint 9**: Code linting
- **eslint-config-next 16.1.6**: Next.js ESLint configuration

## Data Flow

### Current Implementation

```
User Input
    ↓
React Component ("use client" for interactive)
    ↓
Event Handler / Custom Hook (useCVs, etc.)
    ↓
Service Layer (cvService, authService)
    ↓
API Client (apiClient.get/post/patch/upload)
    ↓
Backend Server (CV Service @ localhost:9085 + MinIO)
    ↓
Response JSON → TypeScript Model (CVMetadata, CVListResponse)
    ↓
State Update (useState, custom hook state)
    ↓
Component Re-render
    ↓
Browser Display + Toast Notification
```

**Key Features**:
- 401 Error Handling: Automatic silent token refresh + retry
- Concurrent Refresh Deduplication: Only one refresh promise per browser tab
- Type Safety: All responses parsed to TypeScript interfaces
- Error States: Loading, error messages, and retry mechanisms
- Authentication: Bearer token + X-Device-Id header on all requests

## Performance Considerations

### Built-in Optimizations

1. **Code Splitting**: Next.js automatically splits code per route
2. **Image Optimization**: Next.js Image component for lazy loading
3. **Font Optimization**: Google Fonts via `next/font`
4. **CSS Optimization**: TailwindCSS only includes used classes
5. **Tree Shaking**: Unused code removed by build process

### Future Optimizations (as needed)

- Dynamic imports for large components
- React.memo for expensive components
- Request deduplication via React Query/SWR
- Caching strategies
- Service Workers for offline support

## Security Considerations

### Current Implementation

1. **TypeScript**: Prevents type-related vulnerabilities
2. **Next.js Defaults**: Secure by default
3. **Content Security Policy**: Can be configured in `next.config.ts`

### Future Considerations

- Authentication/Authorization layer
- CSRF protection
- XSS prevention
- Rate limiting
- Input validation
- Secure headers

## Scalability

### Current Architecture

**Strengths**:
- Minimal dependencies
- Fast build times
- Small bundle size
- Easy to extend

**Growth Path**:
1. Add feature-specific components
2. Implement state management (if needed)
3. Add API layer
4. Introduce data fetching strategies
5. Implement authentication
6. Add testing framework

### Horizontal Scaling (Future)

```
Load Balancer
    ↓
┌───────────────────────────────────┐
│  Next.js Instance (Server 1)      │
├───────────────────────────────────┤
│  Next.js Instance (Server 2)      │
├───────────────────────────────────┤
│  Next.js Instance (Server N)      │
└───────────────────────────────────┘
    ↓
Backend API Gateway
```

## Deployment Architecture

### Local Development

```
npm run dev
↓
localhost:3000
(Hot reload enabled)
```

### Production Build

```
npm run build
↓
.next/ directory
↓
npm start
↓
Production Server
```

### Environment Configuration

**Development** (`.env.local`):
```env
# Add as needed
```

**Production** (`.env.production`):
```env
# Add as needed
```

## File Structure Summary

```
workfitai/
├── app/                    # Next.js App Router
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css        # Global styles + theme
│   └── favicon.ico
├── components/            # React components
│   └── ui/               # shadcn/ui components
├── lib/
│   └── utils.ts          # Utility functions
├── public/               # Static assets
├── docs/                 # Documentation
├── components.json       # shadcn/ui config
├── package.json
├── tsconfig.json
├── next.config.ts
└── postcss.config.js
```

## Development Workflow

### Setup
```bash
npm install
```

### Development
```bash
npm run dev
# http://localhost:3000
```

### Build
```bash
npm run build
npm start
```

### Linting
```bash
npm run lint
```

## Future Architecture Phases

### Phase 1: Feature Foundation (Current)
- ✅ Next.js 16 + React 19 setup
- ✅ TailwindCSS v4 configured
- ✅ shadcn/ui integrated
- ✅ Base layout and home page

### Phase 2: Feature Development
- Add feature-specific components
- Implement application routes
- Build feature pages
- Add necessary shadcn/ui components

### Phase 3: State Management
- Identify state management needs
- Implement Zustand, Redux, or Context API
- Add global state handling

### Phase 4: Data Integration
- Build API client layer
- Implement data fetching
- Add error handling
- Implement caching strategies

### Phase 5: Authentication
- Implement auth layer
- Add protected routes
- Add session management

### Phase 6: Testing
- Add unit tests (Vitest)
- Add component tests (React Testing Library)
- Add integration tests
- Add e2e tests (Playwright/Cypress)

## CV Management System

### Backend Integration

**CV Service API**: `http://localhost:9085`

**Endpoints**:
- `GET /cv/candidate/{username}?page=0&size=10` — List CVs (paginated, 0-indexed)
- `POST /cv/upload` — Upload CV (multipart/form-data, PDF only, ≤5MB)
- `PATCH /cv/candidate/{cvId}` — Update CV metadata (filename, templateType, isDefault)
- `DELETE /cv/candidate/{cvId}` — Soft-delete CV (204 No Content)
- `GET /cv/candidate/download/{objectName}` — Download CV file as blob

**Storage**: MinIO (S3-compatible object storage)

### Frontend Architecture

**Components** (`components/my-cvs/`):
- `cv-card.tsx` — Display single CV metadata (filename, size, date, actions)
- `cv-list.tsx` — Paginated CV list grid + pagination controls
- `cv-upload-dialog.tsx` — Drag-drop file input, validation, submission
- `cv-delete-dialog.tsx` — Confirmation modal before deletion
- `my-cvs-page-client.tsx` — Client wrapper (hooks + layout)

**Route**: `app/(candidate)/my-cvs/page.tsx` → `/my-cvs`

**Service Layer** (`lib/cv/cv-service.ts`):
```typescript
listMyCVs(username, page, size)       // Paginated list
uploadCV(file)                         // FormData upload
updateCV(cvId, data)                  // PATCH metadata
deleteCV(cvId)                        // DELETE
downloadCV(cv)                        // Fetch blob + browser save
```

**Custom Hook** (`hooks/useCVs.ts`):
```typescript
useCVs(page)  // Returns: { cvs, totalPages, total, loading, error, refresh }
```

**Type Definitions** (`types/cv.ts`):
- `CVMetadata` — File metadata, size, template type, dates, URL
- `CVListResponse` — Paginated list response wrapper
- `CVUploadResponse` — Upload response with file metadata
- `CVUpdateRequest` — Optional fields for PATCH requests

**Utilities** (`lib/format.ts`):
- `formatFileSize(bytes)` — Convert bytes to human-readable (B/KB/MB)

### API Client Extension

**New Method** (`lib/api-client.ts`):
```typescript
apiClient.patch<T>(path, body, options?)  // PATCH with JSON body
```

### Data Flow: CV Upload

```
User selects PDF file in upload dialog
    ↓
Validation: File type (application/pdf) + Size (≤5MB)
    ↓
cvService.uploadCV(file) creates FormData
    ↓
apiClient.upload() sends multipart/form-data
    ↓
CV Service processes & stores in MinIO
    ↓
Returns CVUploadResponse (cvId, filename, size, etc.)
    ↓
Hook state updates, toast notification
    ↓
CV list refreshes via useCVs().refresh()
```

### Data Flow: CV Download

```
User clicks download button on cv-card
    ↓
cvService.downloadCV(cv) reads CV metadata
    ↓
Creates authenticated fetch with Bearer token + X-Device-Id
    ↓
Requests GET /cv/candidate/download/{objectName}
    ↓
CV Service retrieves blob from MinIO
    ↓
Browser receives blob (application/pdf)
    ↓
Triggers file download (anchor.download = cv.filename)
    ↓
Browser saves PDF locally
```

## Architecture Decision Records (ADRs)

### ADR-001: TailwindCSS v4 CSS-First Approach
**Decision**: Use TailwindCSS v4 with CSS-first setup (no `tailwind.config.js`)
**Rationale**: Simpler configuration, better performance, easier to maintain
**Consequence**: All styling must go in `globals.css`

### ADR-002: shadcn/ui for Components
**Decision**: Use shadcn/ui as component foundation
**Rationale**: Accessibility out-of-box, highly customizable, Radix UI primitives
**Consequence**: Must use `npx shadcn add` to add new components

### ADR-003: React Server Components
**Decision**: Use Next.js 16 React Server Components by default
**Rationale**: Reduced client-side JavaScript, better performance, simpler data fetching
**Consequence**: Must use `"use client"` for interactive components

---

**Generated**: 2026-04-27
**Maintained by**: WorkfitAI Development Team
**Latest Changes**: CV Management System implementation (Phase 4)
