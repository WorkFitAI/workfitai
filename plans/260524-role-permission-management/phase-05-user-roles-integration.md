---
phase: 5
title: "User Roles Integration"
status: completed
priority: P2
effort: "1h"
dependencies: [1, 2]
---

# Phase 5: User Roles Integration

## Overview
Add a "Roles" section to the existing user detail page (`components/users/user-detail.tsx`) so ADMIN (and HR_MANAGER for HR users) can view and modify which roles are assigned to a specific user. Uses `useUserRoles` from Phase 2 and `useRoles` for the full roles list (to render available role options).

## Related Code Files
- Modify: `components/users/user-detail.tsx` — add UserRolesPanel section
- Create: `components/roles/user-roles-panel.tsx`
- Reuse: `hooks/useUserRoles.ts` (Phase 2)
- Reuse: `hooks/useRoles.ts` (Phase 2, for available roles list in edit mode)
- Reuse: `components/ui/badge.tsx`, `components/ui/button.tsx`, `components/ui/checkbox.tsx`
- Pattern ref: `components/users/users-list.tsx` (badge + action pattern)

## Architecture

```
components/users/user-detail.tsx
  └─ <UserRolesPanel username={user.username} isAdmin={isAdmin} />
       ├─ useUserRoles(username)      → current roles, saveRoles
       ├─ useRoles()                  → all available roles (for picker)
       ├─ View mode: role badges + "Edit" button
       └─ Edit mode: checkbox list of all roles → "Save" / "Cancel"
```

## Implementation Steps

### Step 1 — Create `components/roles/user-roles-panel.tsx`

Inline panel (not a modal) that sits within the user detail page. Two modes: **view** and **edit**.

Props:
```typescript
interface UserRolesPanelProps {
  username: string
  isAdmin: boolean       // Admin can edit any user's roles
  isHrManager: boolean   // HR_MANAGER can only edit roles for HR users
  targetUserRole: string // The user's primary role (to enforce HR_MANAGER restriction)
}
```

**View mode** (default):
- Heading "Assigned Roles" with an Edit button (pencil icon)
- Current roles rendered as colored badges (reuse role badge color config from `components/users/user-role-badge.tsx`)
- If no roles: "No roles assigned" muted text
- Edit button visible only if `canEdit` = `isAdmin || (isHrManager && targetUserRole === 'HR')`

**Edit mode** (on Edit click):
- Loads `useRoles()` to get full roles list
- Checkbox list — each row: checkbox + role name + description
- Pre-checked = current user roles
- "Save Changes" button (disabled if no diff from original, spinner when saving)
- "Cancel" button → reverts to view mode
- Warning note for Admin: "Changes take effect on user's next login"

```tsx
"use client"
export function UserRolesPanel({
  username, isAdmin, isHrManager, targetUserRole
}: UserRolesPanelProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [localRoles, setLocalRoles] = useState<string[]>([])
  const { roles: currentRoles, loading, saving, saveRoles, refresh } = useUserRoles(username)
  const { roles: allRoles, loading: rolesLoading } = useRoles()

  // Sync localRoles when currentRoles loads or edit mode opens
  useEffect(() => {
    if (!isEditing) return
    setLocalRoles([...currentRoles])
  }, [isEditing, currentRoles])

  const canEdit = isAdmin || (isHrManager && targetUserRole === "HR")

  const handleSave = async () => {
    await saveRoles(currentRoles, localRoles)
    setIsEditing(false)
  }

  const hasDiff = JSON.stringify([...localRoles].sort()) !==
                  JSON.stringify([...currentRoles].sort())

  // ... render view/edit modes
}
```

### Step 2 — Integrate into `components/users/user-detail.tsx`

Read the current file first. Add `UserRolesPanel` as a new card/section.

Determine `isAdmin` and `isHrManager` from `useAuth()` hook (already used in the file):
```typescript
const { user: currentUser } = useAuth()
const isAdmin = currentUser?.roles?.includes("ROLE_ADMIN") ?? false
const isHrManager = currentUser?.roles?.includes("ROLE_HR_MANAGER") ?? false
```

Insert panel after existing user info section:
```tsx
<UserRolesPanel
  username={user.username}
  isAdmin={isAdmin}
  isHrManager={isHrManager}
  targetUserRole={user.userRole}
/>
```

### Step 3 — HR_MANAGER Restriction Logic

HR_MANAGER can only manage roles for users with primary role `HR`. The `canEdit` check in `UserRolesPanel` enforces this:
```typescript
const canEdit = isAdmin || (isHrManager && targetUserRole === "HR")
```

Additionally, in edit mode for HR_MANAGER, filter `allRoles` to only show roles relevant to HR staff (exclude ADMIN, CANDIDATE):
```typescript
const editableRoles = isAdmin
  ? allRoles
  : allRoles.filter(r => !["ADMIN", "CANDIDATE"].includes(r.name))
```

## Success Criteria
- [ ] `user-roles-panel.tsx` renders current user roles as badges in view mode
- [ ] Edit button only visible when `canEdit` is true
- [ ] Edit mode shows checkbox list populated from all available roles
- [ ] "Save Changes" disabled when no diff from original roles
- [ ] Saving calls `useUserRoles.saveRoles` with original + updated arrays
- [ ] HR_MANAGER cannot see Edit button for non-HR users
- [ ] HR_MANAGER edit mode excludes ADMIN and CANDIDATE roles from options
- [ ] Panel integrated into `user-detail.tsx` without breaking existing layout
- [ ] TypeScript compiles without errors

## Risk Assessment
- `user-detail.tsx` is already large (check line count before modifying — may need to extract sections into sub-components to stay under 200 lines per file rule).
- `useRoles()` in edit mode fetches ALL roles on component mount (not just when entering edit). Consider lazy-loading: only call `useRoles()` when `isEditing` is true, or use conditional mounting (`{isEditing && <RolesPicker />}`).
- Recommended: mount `<RolesPicker>` sub-component conditionally so `useRoles()` only fires when edit mode opens.

## Security Note
Frontend `canEdit` check is a UX guard only. The backend must enforce authorization on the grant/revoke role APIs. Do not rely solely on frontend checks.
