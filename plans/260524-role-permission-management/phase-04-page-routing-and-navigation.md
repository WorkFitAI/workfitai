---
phase: 4
title: "Page Routing and Navigation"
status: completed
priority: P1
effort: "1h"
dependencies: [3]
---

# Phase 4: Page Routing and Navigation

## Overview
Wire up the new `/roles-permissions` route: create the Next.js page (server component with role guard), update middleware route protection, and add the nav item to the control sidebar.

## Related Code Files
- Modify: `middleware.ts` — add `/roles-permissions` to `HRM_ROUTES`
- Modify: `lib/navigation.ts` — add nav item with `ShieldCheck` icon
- Modify: `middleware.ts` matcher config — add `/roles-permissions/:path*`
- Create: `app/(control)/roles-permissions/page.tsx`
- Pattern ref: `app/(control)/hr-management/page.tsx` (same access level: HRM + Admin)

## Implementation Steps

### Step 1 — Create `app/(control)/roles-permissions/page.tsx`

Server component. Reads session cookie to determine `isAdmin`, passes to client component.

```typescript
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { RolesPermissionsClient } from "@/components/roles/roles-permissions-client"

export const metadata = { title: "Roles & Permissions — WorkfitAI" }

export default async function RolesPermissionsPage() {
  const cookieStore = await cookies()
  const cookieValue = cookieStore.get("auth_session")?.value
  if (!cookieValue) redirect("/login")

  const session = JSON.parse(decodeURIComponent(cookieValue))
  const roles: string[] = session.roles ?? []

  // Double-check: middleware already blocks non-HRM/Admin, but explicit guard here
  if (!roles.includes("ROLE_HR_MANAGER") && !roles.includes("ROLE_ADMIN")) {
    redirect("/dashboard")
  }

  const isAdmin = roles.includes("ROLE_ADMIN")

  return <RolesPermissionsClient isAdmin={isAdmin} />
}
```

> Match exact pattern from `app/(control)/hr-management/page.tsx` — same cookie parsing approach.

### Step 2 — Update `middleware.ts`

Two changes:

**A. Add to `HRM_ROUTES` array** (line 8):
```typescript
// Before
const HRM_ROUTES = ['/hr-management']
// After
const HRM_ROUTES = ['/hr-management', '/roles-permissions']
```

**B. Add to matcher config** (in `export const config`):
```typescript
// Add after '/hr-management/:path*'
'/roles-permissions',
'/roles-permissions/:path*',
```

### Step 3 — Update `lib/navigation.ts`

Add `ShieldCheck` to lucide-react import and add nav item after "HR Management":

```typescript
// Add ShieldCheck to import
import { ..., ShieldCheck } from "lucide-react"

// Add to controlNavItems after HR Management entry
{
  title: "Roles & Permissions",
  href: "/roles-permissions",
  icon: ShieldCheck,
  roles: ["ROLE_ADMIN", "ROLE_HR_MANAGER"],
},
```

The sidebar (`components/layout/control/control-sidebar.tsx`) already filters nav items by role — no changes needed there.

## Success Criteria
- [ ] `GET /roles-permissions` returns 200 for ADMIN and HR_MANAGER sessions
- [ ] `GET /roles-permissions` redirects to `/dashboard` for ROLE_HR sessions (middleware + page guard)
- [ ] `GET /roles-permissions` redirects to `/login` for unauthenticated requests
- [ ] "Roles & Permissions" nav item appears in sidebar for ADMIN and HR_MANAGER
- [ ] "Roles & Permissions" nav item is hidden for ROLE_HR users
- [ ] Middleware matcher includes the new route
- [ ] TypeScript compiles without errors

## Risk Assessment
- Cookie parsing in page matches exact pattern in `hr-management/page.tsx`. If that pattern changes, this page must be updated too. Low risk — pattern is stable.
- `ShieldCheck` is available in `lucide-react` (project uses lucide-react for all icons). Verify import doesn't introduce a bundle size concern — negligible, lucide uses tree-shaking.
