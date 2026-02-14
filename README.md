# WorkfitAI

AI-powered workforce management and job portal platform.

## Tech Stack

| Package | Version | Purpose |
|---------|---------|---------|
| Next.js | 16.1.6 | App Router, RSC, SSR |
| React | 19.2.3 | UI library |
| TypeScript | ^5 | Type safety |
| TailwindCSS | ^4 | CSS-first styling (no config file) |
| shadcn/ui | ^3.8.4 | Component library (new-york style) |
| lucide-react | ^0.564.0 | Icon library |
| react-hook-form | ^7 | Form state management |
| zod | ^4 | Schema validation |
| sonner | ^2 | Toast notifications |

## Quick Start

```bash
git clone <repo-url>
cd workfitai
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the candidate portal.
Open [http://localhost:3000/dashboard](http://localhost:3000/dashboard) for the admin dashboard.

```bash
# Production build
npm run build && npm start

# Lint
npm run lint
```

## Project Structure

```
workfitai/
├── app/
│   ├── (candidate)/        # Public job portal route group
│   │   ├── layout.tsx      # Candidate layout (header + footer)
│   │   ├── page.tsx        # Homepage /
│   │   └── jobs/page.tsx   # Job listings /jobs
│   ├── (control)/          # Admin/HR dashboard route group
│   │   ├── layout.tsx      # Control layout (sidebar + header)
│   │   └── dashboard/page.tsx  # Dashboard /dashboard
│   ├── api/                # API routes
│   ├── layout.tsx          # Root layout (fonts, metadata)
│   └── globals.css         # Theme tokens + TailwindCSS v4
├── components/
│   ├── ui/                 # shadcn/ui components (auto-managed, do not edit)
│   ├── layout/
│   │   ├── candidate/      # CandidateHeader, CandidateFooter
│   │   └── control/        # ControlSidebar, ControlHeader, ControlLayoutWrapper
│   └── shared/             # Cross-feature components
├── hooks/                  # Custom React hooks
├── lib/
│   ├── utils.ts            # cn() utility
│   └── navigation.ts       # Nav config for both portals
├── types/
│   └── index.ts            # TypeScript type definitions
└── docs/                   # Project documentation
```

## Adding shadcn/ui Components

Components are code-copied into `components/ui/` -- do not manually edit these files.

```bash
npx shadcn@latest add <component-name>

# Examples
npx shadcn@latest add dropdown-menu
npx shadcn@latest add calendar
```

## Styling

- TailwindCSS v4 uses CSS-first config -- no `tailwind.config.js`
- Theme tokens defined in `app/globals.css`
- Use semantic tokens: `bg-background`, `text-foreground`, `text-muted-foreground`, `border-border`, `bg-sidebar`, etc.
- Use `cn()` from `@/lib/utils` for all conditional class names

## Architecture Notes

- RSC by default; add `"use client"` only for interactive components
- Route groups `(candidate)` and `(control)` share the root layout but have independent nested layouts
- Navigation config centralized in `lib/navigation.ts`
- Files kept under 200 LOC

## Documentation

- [Code Standards](./docs/code-standards.md)
- [System Architecture](./docs/system-architecture.md)
- [Project Overview](./docs/project-overview-pdr.md)
- [Codebase Summary](./docs/codebase-summary.md)
- [Deployment Guide](./docs/deployment-guide.md)
- [Project Roadmap](./docs/project-roadmap.md)
