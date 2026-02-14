# Codebase Summary

**Project**: WorkfitAI - Dual Portal Platform
**Framework**: Next.js 16.1.6 (App Router with React Server Components)
**Language**: TypeScript 5.x
**UI Framework**: TailwindCSS v4 (CSS-first) + shadcn/ui v3.8.4
**Last Updated**: 2026-02-14
**Version**: 0.2.0
**Status**: Base Setup Complete (Route Groups, Layout Components, Form Infrastructure)

## Project Overview

WorkfitAI is a dual-portal Next.js platform supporting both public job seekers and admin workforce management. The architecture uses Route Groups for isolated portal logic, with centralized layout components and form validation infrastructure.

**Key Features:**
- Candidate Portal: Job search and applications (public)
- Control/Admin Portal: Workforce management dashboard (protected)
- Reusable layout components for each portal
- Form infrastructure: react-hook-form + Zod validation
- 27 shadcn/ui components installed and ready
- Centralized navigation configuration

## Directory Structure

```
workfitai/
├── app/                                    # Next.js App Router
│   ├── layout.tsx                         # Root layout (Geist fonts, metadata)
│   ├── globals.css                        # TailwindCSS v4 + theme tokens
│   ├── (candidate)/                       # PUBLIC: Job portal route group
│   │   ├── layout.tsx                    # Header + footer layout
│   │   ├── page.tsx                      # Home /
│   │   └── jobs/page.tsx                 # Job listings /jobs
│   ├── (control)/                         # ADMIN: Control panel route group
│   │   ├── layout.tsx                    # Sidebar + header layout
│   │   └── dashboard/page.tsx            # Dashboard /dashboard
│   └── api/                               # API routes (placeholder)
│
├── components/
│   ├── ui/                                # shadcn/ui (27 components, auto-managed)
│   ├── layout/
│   │   ├── candidate/
│   │   │   ├── candidate-header.tsx      # Sticky header + mobile Sheet nav
│   │   │   └── candidate-footer.tsx      # Simple footer
│   │   └── control/
│   │       ├── control-sidebar.tsx       # Collapsible sidebar with nav icons
│   │       ├── control-header.tsx        # Breadcrumb + avatar
│   │       └── control-layout-wrapper.tsx# Sidebar state management
│   └── shared/                            # Cross-feature components (empty, ready)
│
├── hooks/                                 # Custom React hooks (directory ready)
├── lib/
│   ├── utils.ts                           # cn() utility for class merging
│   └── navigation.ts                      # Centralized nav config + types
├── types/
│   └── index.ts                           # Type exports (NavItem)
│
├── docs/                                  # Project documentation
│   ├── codebase-summary.md               # This file
│   ├── code-standards.md                 # Coding standards & patterns
│   ├── system-architecture.md            # Architecture & design decisions
│   ├── project-overview-pdr.md           # Project overview & PDR
│   ├── project-roadmap.md                # Development roadmap & milestones
│   └── deployment-guide.md               # Deployment instructions
│
├── public/                                # Static assets
├── components.json                        # shadcn/ui configuration (new-york)
├── package.json                           # Dependencies & scripts
├── tsconfig.json                          # TypeScript configuration
├── next.config.ts                         # Next.js configuration
├── postcss.config.js                      # PostCSS for TailwindCSS v4
├── README.md                              # Getting started guide
└── .gitignore                             # Git ignore rules
```

## Technology Stack

### Core Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| next | 16.1.6 | React framework with App Router |
| react | 19.2.3 | UI library |
| react-dom | 19.2.3 | React DOM rendering |
| typescript | ^5 | Type safety |

### Styling & UI

| Package | Version | Purpose |
|---------|---------|---------|
| tailwindcss | ^4 | Utility-first CSS framework (CSS-first) |
| @tailwindcss/postcss | ^4 | PostCSS plugin for TailwindCSS v4 |
| shadcn/ui | 3.8.4 | High-quality React components (27 installed) |
| radix-ui | ^1.4.3 | Headless UI primitives |
| lucide-react | ^0.564.0 | Icon library |
| class-variance-authority | ^0.7.1 | Type-safe component variants |
| clsx | ^2.1.1 | Conditional CSS class concatenation |
| tailwind-merge | ^3.4.0 | Merge TailwindCSS class names |
| tw-animate-css | ^1.4.0 | Animation utilities for TailwindCSS |
| next-themes | ^0.4.6 | Dark/light mode theme provider |

### Forms & Validation

| Package | Version | Purpose |
|---------|---------|---------|
| react-hook-form | ^7.71.1 | Performant form state management |
| @hookform/resolvers | ^5.2.2 | Zod integration for RHF |
| zod | ^4.3.6 | TypeScript-first schema validation |
| cmdk | ^1.1.1 | Command menu component |

### Notifications

| Package | Version | Purpose |
|---------|---------|---------|
| sonner | ^2.0.7 | Toast notifications |

### Development

| Package | Version | Purpose |
|---------|---------|---------|
| eslint | ^9 | Code linting |
| eslint-config-next | 16.1.6 | Next.js ESLint configuration |
| @types/node | ^20 | Node.js type definitions |
| @types/react | ^19 | React type definitions |
| @types/react-dom | ^19 | React DOM type definitions |

## Key Files

### Routing & Layout

**app/layout.tsx** - Root layout
- Geist fonts (GeistSans, GeistMono)
- Global metadata: title "WorkfitAI"
- Providers wrapper for theme management

**app/(candidate)/layout.tsx** - Candidate portal layout
- CandidateHeader: sticky navigation + mobile Sheet
- CandidateFooter: footer section
- Applies to all routes under `/(candidate)/*`

**app/(control)/layout.tsx** - Admin portal layout
- ControlSidebar: collapsible left navigation
- ControlHeader: breadcrumb + user avatar
- ControlLayoutWrapper: manages sidebar state
- Applies to all routes under `/(control)/*`

**app/globals.css** - Global styles
- TailwindCSS v4 CSS-first setup
- Design tokens (colors, radius, fonts)
- Light/dark mode CSS variables (oklch color system)
- Sidebar-specific tokens (`bg-sidebar`, `text-sidebar-foreground`)

### Components

**lib/navigation.ts** - Centralized nav config
```typescript
interface NavItem {
  title: string
  href: string
  icon?: LucideIcon
  description?: string
}

candidateNavItems: [{ title: "Home", href: "/" }, { title: "Jobs", href: "/jobs" }]
controlNavItems: [Dashboard, Candidates, Job Posts, Settings]
```

**lib/utils.ts** - Class merging utility
```typescript
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```
Combines clsx (conditional) + tailwind-merge (conflict resolution).

**types/index.ts** - Type exports
Re-exports NavItem from lib/navigation for use across components.

### Configuration Files

**components.json** - shadcn/ui config
```json
{
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "css": "app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "iconLibrary": "lucide",
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui"
  }
}
```

**tsconfig.json** - Path aliases
```json
"@/*": "./*"
```
Enables `@/` imports from project root.

## TailwindCSS v4 Architecture

### CSS-First Approach
TailwindCSS v4 uses a pure CSS-first setup:
- **No `tailwind.config.js`** - Configuration via CSS only
- **Configuration in `globals.css`** - All theme and custom tokens defined in CSS
- **`@theme inline {}` block** - Maps CSS variables to TailwindCSS tokens

### Design Token System
The complete token system is defined in `app/globals.css`:

**Color Tokens** (Light Mode - `:root`):
- `--background: oklch(1 0 0)` - White
- `--foreground: oklch(0.145 0 0)` - Dark text
- `--primary: oklch(0.205 0 0)` - Primary action color
- `--secondary: oklch(0.97 0 0)` - Secondary color
- `--muted: oklch(0.97 0 0)` - Muted backgrounds
- `--accent: oklch(0.97 0 0)` - Accent color
- `--destructive: oklch(0.577 0.245 27.325)` - Destructive/error color
- Chart tokens: `--chart-1` through `--chart-5`

**Dark Mode** (`.dark` class):
- Inverted oklch values for proper contrast
- Semi-transparent borders: `oklch(1 0 0 / 10%)`
- Enhanced color saturation for dark backgrounds

**Radius Tokens**:
- `--radius: 0.625rem` - Base radius
- `--radius-sm: calc(var(--radius) - 4px)`
- `--radius-md: calc(var(--radius) - 2px)`
- `--radius-lg: var(--radius)`
- `--radius-xl` through `--radius-4xl` - Larger variants

**Font Tokens**:
- `--font-sans: var(--font-geist-sans)` - Display font
- `--font-mono: var(--font-geist-mono)` - Monospace font

### Theme Mapping
The `@theme inline {}` block in `globals.css` maps all CSS variables to TailwindCSS tokens:
```css
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  /* ... other tokens */
}
```

## Component Architecture

### Route Groups & Portals

**Candidate Portal** `(candidate)/`
- Public-facing job search interface
- Header + Footer layout
- Pages: Home, Jobs listing
- Navigation: Centralized in `lib/navigation.ts` → `candidateNavItems`

**Control Portal** `(control)/`
- Protected admin/HR dashboard
- Sidebar + Header layout with collapsible sidebar
- Pages: Dashboard (with expandable sub-routes for Candidates, Posts, Settings)
- Navigation: `lib/navigation.ts` → `controlNavItems`
- State: ControlLayoutWrapper manages sidebar open/closed state

### Layout Components (Do Not Edit)

**Candidate Layout:**
- `CandidateHeader` - Sticky header with mobile Sheet nav
- `CandidateFooter` - Footer section

**Control Layout:**
- `ControlSidebar` - Collapsible sidebar + nav icons
- `ControlHeader` - Breadcrumb + user avatar
- `ControlLayoutWrapper` - Sidebar state management (useState)

### shadcn/ui Components (27 Installed)

Located in `components/ui/` (auto-managed by shadcn CLI).

**Installation** (do not manually edit files in components/ui/):
```bash
npx shadcn@latest add <component-name>
```

**Usage Example:**
```typescript
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function MyCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Title</CardTitle>
      </CardHeader>
      <CardContent>
        <Button>Click me</Button>
      </CardContent>
    </Card>
  )
}
```

All components support:
- React Server Components (RSC) by default
- Dark mode via CSS variables
- TailwindCSS responsive design
- Radix UI accessibility primitives

### Custom Components

**Location**: `components/` (NOT `components/ui/`, which is auto-managed)

**Subdirectories:**
- `layout/` - Portal-specific layout components
- `shared/` - Cross-feature reusable components

**Pattern** (`components/my-feature.tsx`):
```typescript
"use client" // Add if interactive (useState, onClick, etc)

import { cn } from "@/lib/utils"

interface MyComponentProps {
  className?: string
  variant?: "default" | "primary"
}

export function MyComponent({ className, variant }: MyComponentProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-md px-3 py-2",
        variant === "primary" && "bg-primary text-primary-foreground",
        variant === "default" && "bg-secondary text-secondary-foreground",
        className
      )}
    >
      {/* Content */}
    </div>
  )
}
```

**File Size Rule**: Keep components under 200 LOC. Split larger components into smaller focused pieces.

### Forms with react-hook-form + Zod

**Validation Schema** (`lib/schemas/login.ts`):
```typescript
import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "At least 8 characters"),
})

export type LoginForm = z.infer<typeof loginSchema>
```

**Form Component** (`components/login-form.tsx`):
```typescript
"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { loginSchema, type LoginForm } from "@/lib/schemas/login"
import { Button } from "@/components/ui/button"

export function LoginForm() {
  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  function onSubmit(data: LoginForm) {
    // Handle submission
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <input {...form.register("email")} />
      {form.formState.errors.email && <p>{form.formState.errors.email.message}</p>}
      <Button type="submit">Submit</Button>
    </form>
  )
}
```

### Using cn() Utility

```typescript
import { cn } from "@/lib/utils"

// Good - conditional classes
<button className={cn(
  "px-4 py-2 rounded-md",
  isActive && "bg-primary text-primary-foreground",
  isDisabled && "opacity-50 cursor-not-allowed"
)}>
  Click me
</button>
```

## Styling Standards

### TailwindCSS v4 CSS-First Approach

**No config file** - All configuration via `app/globals.css` using `@theme` block.

**Use semantic tokens:**
```typescript
// Good
<div className="flex items-center gap-4 bg-background p-4 rounded-lg border border-border">
  <h1 className="text-2xl font-bold text-foreground">Title</h1>
  <p className="text-sm text-muted-foreground">Description</p>
</div>

// Avoid arbitrary values
<div className="bg-[#f5f5f5] p-[17px]">Not semantic</div>
```

### Design Tokens (from app/globals.css)

**Colors** (oklch system, light/dark modes):
- `bg-background` / `text-foreground` - Main content
- `bg-card` / `text-card-foreground` - Card surfaces
- `bg-primary` / `text-primary-foreground` - Actions
- `bg-secondary` / `text-secondary-foreground` - Secondary actions
- `text-muted-foreground` - Disabled/secondary text
- `text-destructive` - Errors/warnings
- `border-border` - Borders
- `bg-sidebar` / `text-sidebar-foreground` - Sidebar (Control portal)
- `chart-1` through `chart-5` - Data visualization

**Radius** (configurable in CSS):
- `rounded-sm`, `rounded-md`, `rounded-lg`, `rounded-xl` - Standard sizes

**Spacing** - Use TailwindCSS scale:
- `gap-2`, `gap-4`, `p-4`, `m-2` - Semantic spacing

### Dark Mode

Automatic via CSS variable overrides in `.dark` class. No explicit dark: prefixes needed for semantic tokens:

```typescript
<div className="bg-background text-foreground">
  {/* Automatically inverts in dark mode */}
</div>
```

### Typography

Geist fonts (GeistSans, GeistMono) imported in root layout:

```typescript
<h1 className="text-4xl font-bold">Heading</h1>
<p className="text-base">Body text</p>
<small className="text-sm text-muted-foreground">Caption</small>
```

## Development Workflow

```bash
# Setup
npm install
npm run dev
# Visit http://localhost:3000 (candidate)
# Visit http://localhost:3000/dashboard (admin)

# Add shadcn/ui component
npx shadcn@latest add button

# Build & production
npm run build
npm start

# Lint
npm run lint
```

## Project Phases

### Phase 0: ✅ Base Setup Complete
- ✅ Dual route groups: (candidate) and (control)
- ✅ Layout components with sidebar + header (control)
- ✅ Header + footer (candidate)
- ✅ Form infrastructure: react-hook-form + Zod
- ✅ 27 shadcn/ui components installed
- ✅ Centralized navigation config
- ✅ TailwindCSS v4 CSS-first theming

### Phase 1: Core Features (Next)
- Candidate portal: Job search, filtering, application forms
- Admin portal: Job posting, candidate management
- Authentication & authorization
- API endpoints for job/candidate data

### Phase 2: Advanced
- Search optimization
- Notifications & messaging
- Email integration
- Analytics dashboard

## Common Tasks

**Add Form Validation**:
1. Create schema in `lib/schemas/feature.ts` with Zod
2. Import in component with `zodResolver`
3. Use `useForm` hook with schema
4. Render inputs + error messages

**Create Layout Component**:
1. Add to `components/layout/{portal}/`
2. Accept `children: React.ReactNode`
3. Keep under 200 LOC
4. Export from parent layout.tsx

**Add Navigation Item**:
1. Update `lib/navigation.ts` (candidateNavItems or controlNavItems)
2. Import in respective layout component
3. Uses centralized NavItem interface

**Add shadcn/ui Component**:
```bash
npx shadcn@latest add [name]
cd components/ui/[name].tsx  # Do not edit
```

## Resources

- [Next.js 16 Docs](https://nextjs.org/docs)
- [React 19 Docs](https://react.dev)
- [TailwindCSS v4 Docs](https://tailwindcss.com/docs)
- [shadcn/ui Docs](https://ui.shadcn.com)
- [react-hook-form Docs](https://react-hook-form.com)
- [Zod Docs](https://zod.dev)
- [Radix UI Primitives](https://www.radix-ui.com)
- [Lucide Icons](https://lucide.dev)

---

**Last Updated**: 2026-02-14
**Status**: Base Setup Complete (v0.2.0)
**LOC**: 380
