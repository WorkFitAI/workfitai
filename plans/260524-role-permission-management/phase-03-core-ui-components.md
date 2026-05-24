---
phase: 3
title: "Core UI Components"
status: completed
priority: P1
effort: "3h"
dependencies: [1, 2]
---

# Phase 3: Core UI Components

## Overview
Build all UI components for the roles-permissions management page. Follow existing component patterns: custom modals with `fixed inset-0 z-50` overlay (see `components/hrm/assign-hr-modal.tsx`), shadcn `Dialog` for forms (see `components/account-settings/profile-edit-modal.tsx`), and table patterns from `components/users/users-list.tsx`.

## Related Code Files
- Pattern refs: `components/hrm/assign-hr-modal.tsx`, `components/users/users-list.tsx`
- Reuse: `components/ui/dialog.tsx`, `components/ui/table.tsx`, `components/ui/badge.tsx`
- Reuse: `components/ui/button.tsx`, `components/ui/input.tsx`, `components/ui/checkbox.tsx`
- Reuse: `components/users/user-role-badge.tsx` color config for role badges
- Create directory: `components/roles/`

## Components to Create

```
components/roles/
├── roles-permissions-client.tsx   # Main page client component (tabs)
├── roles-table.tsx                # Roles list table
├── permissions-table.tsx          # Permissions list table (read-only)
├── role-detail-modal.tsx          # View/edit role permissions
├── clone-role-modal.tsx           # Clone role form modal (Admin only)
└── delete-role-confirm.tsx        # Confirm delete dialog (Admin only)
```

## Architecture & Data Flow

```
roles-permissions-client.tsx
  ├─ Tabs: "Roles" | "Permissions"
  ├─ "Roles" tab → roles-table.tsx
  │     ├─ useRoles() for list + delete
  │     ├─ opens role-detail-modal.tsx (on row click or View btn)
  │     ├─ opens clone-role-modal.tsx (Clone btn, Admin only)
  │     └─ opens delete-role-confirm.tsx (Delete btn, Admin only)
  └─ "Permissions" tab → permissions-table.tsx
        └─ usePermissions() for list (read-only)

role-detail-modal.tsx
  └─ useRole(name) for current perms + savePermissions
       ├─ Admin: checkbox list of all permissions → batch save on "Save Changes"
       └─ HR_MANAGER: read-only list of permissions

clone-role-modal.tsx
  └─ useCloneRole(onSuccess) → form with name + description
```

## Implementation Steps

### Step 1 — `components/roles/roles-permissions-client.tsx`

Main client component, receives `isAdmin: boolean` prop from page server component.

```tsx
"use client"
export function RolesPermissionsClient({ isAdmin }: { isAdmin: boolean }) {
  const [activeTab, setActiveTab] = useState<"roles" | "permissions">("roles")
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Roles & Permissions</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage system roles and their associated permissions
          </p>
        </div>
      </div>
      {/* Tabs — reuse Tabs/TabsList/TabsTrigger from components/ui/tabs.tsx */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "roles" | "permissions")}>
        <TabsList>
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
        </TabsList>
        <TabsContent value="roles">
          <RolesTable isAdmin={isAdmin} />
        </TabsContent>
        <TabsContent value="permissions">
          <PermissionsTable />
        </TabsContent>
      </Tabs>
    </div>
  )
}
```

### Step 2 — `components/roles/roles-table.tsx`

Table of all roles. Columns: Role Name, Description, Permission Count, Actions.

Key behaviours:
- **Row**: shows role name as a bold label + description in muted text
- **Permission Count**: badge showing `role.permissions.length` perms
- **Actions column**:
  - "View" button (all users) → opens `RoleDetailModal`
  - "Clone" button (Admin only) → opens `CloneRoleModal`
  - "Delete" button (Admin only, hidden for built-in roles: CANDIDATE, HR, HR_MANAGER, ADMIN) → opens `DeleteRoleConfirm`
- **Built-in roles protection**: `BUILT_IN_ROLES = ["CANDIDATE", "HR", "HR_MANAGER", "ADMIN"]` — Delete button disabled/hidden for these

```tsx
// Loading state: skeleton rows (3 rows × 4 cols)
// Empty state: "No roles found" centered message
// Error state: error banner with retry button
```

State:
```typescript
const [selectedRole, setSelectedRole] = useState<Role | null>(null)
const [cloneSource, setCloneSource] = useState<Role | null>(null)
const [deleteTarget, setDeleteTarget] = useState<Role | null>(null)
const { roles, loading, error, deletingName, deleteRole, refresh } = useRoles()
```

### Step 3 — `components/roles/permissions-table.tsx`

Simple read-only table. Columns: Permission Name, Description.

- Search input at top (client-side filter — no API call, permissions list is small)
- Group by prefix: `auth:*`, `job:*`, `application:*`, `company:*`, etc. (split on `:`)
- No pagination needed (permissions list is finite and small)

```tsx
// Client-side filter: permissions.filter(p => p.name.includes(search) || p.description.includes(search))
// Group headers: bold label for each namespace prefix
```

### Step 4 — `components/roles/role-detail-modal.tsx`

Uses shadcn `Dialog` (controlled). Props: `role: Role`, `isAdmin: boolean`, `onClose: () => void`.

Structure:
```
DialogContent (max-w-2xl)
  DialogHeader
    DialogTitle: "Role: {role.name}"
    description badge: role.description
  ─────────────────────────────────────
  Body (scrollable, max-h-[60vh] overflow-y-auto)
    [Admin view]
      - "All Permissions" section: checkbox list
        - Each row: Checkbox + permission name + description (from allPermissions)
        - Checked = currently in role.permissions
        - Tracks localPerms state (copy of role.permissions)
        - Search/filter input at top of list
      - Shows count: "X / Y permissions selected"
    [HR_MANAGER view]
      - Read-only list of permission badges
      - Grouped by namespace prefix
  ─────────────────────────────────────
  DialogFooter
    [Admin]: "Cancel" button + "Save Changes" button (disabled if no diff, shows saving spinner)
    [HRM]: "Close" button only
```

Internal state:
```typescript
const { role: freshRole, loading, saving, savePermissions } = useRole(role.name)
const { permissions: allPermissions } = usePermissions()  // for checkbox list
const [localPerms, setLocalPerms] = useState<string[]>([])
const [search, setSearch] = useState("")

// On freshRole load: setLocalPerms(freshRole.permissions)
// On save: savePermissions(freshRole.permissions, localPerms) → onClose on success
```

Permission toggle: `setLocalPerms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])`

### Step 5 — `components/roles/clone-role-modal.tsx`

Uses shadcn `Dialog`. Props: `sourceRole: Role`, `onClose: () => void`, `onSuccess: () => void`.

Form fields (react-hook-form + Zod):
- `name`: required, min 2 chars, uppercase + underscore pattern `[A-Z_]+`
- `description`: required, min 5 chars

```typescript
const cloneRoleSchema = z.object({
  name: z.string().min(2).regex(/^[A-Z_]+$/, "Uppercase letters and underscores only"),
  description: z.string().min(5, "Description must be at least 5 characters"),
})
```

On submit: `cloneRole(sourceRole.name, data.name, data.description)` → closes modal on success.

Shows source role info: "Cloning from: **{sourceRole.name}**" + permission count note.

### Step 6 — `components/roles/delete-role-confirm.tsx`

Uses shadcn `AlertDialog`. Props: `role: Role`, `isDeleting: boolean`, `onConfirm: () => void`, `onCancel: () => void`.

Warning message: "This will permanently delete the role **{role.name}** and remove it from all assigned users. This action cannot be undone."

Destructive `AlertDialogAction` button labeled "Delete Role" + spinner when `isDeleting`.

## Success Criteria
- [ ] `roles-permissions-client.tsx` renders tabs switching between Roles and Permissions views
- [ ] `roles-table.tsx`: shows all roles, loading/empty/error states, Clone+Delete buttons hidden for non-Admin
- [ ] `roles-table.tsx`: Delete hidden for built-in roles (CANDIDATE, HR, HR_MANAGER, ADMIN)
- [ ] `permissions-table.tsx`: client-side search filters permissions list, grouped by namespace
- [ ] `role-detail-modal.tsx`: Admin sees editable checkbox list; HR_MANAGER sees read-only badges
- [ ] `role-detail-modal.tsx`: Save Changes calls `savePermissions` with diff, disabled when no changes
- [ ] `clone-role-modal.tsx`: form validates name pattern, submits clone action
- [ ] `delete-role-confirm.tsx`: renders warning + destructive confirm button with loading state
- [ ] All components <200 lines (split further if needed)
- [ ] TypeScript compiles without errors

## Risk Assessment
- `role-detail-modal.tsx` loads both `useRole(name)` AND `usePermissions()` — two concurrent fetches on open. Both are fast (small lists); no UX concern.
- Permission list could grow large. Client-side search in `role-detail-modal` is sufficient for now (YAGNI).
- File size: `roles-table.tsx` may approach 200 lines with all states. Extract skeleton/empty components inline if needed.
