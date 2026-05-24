---
title: "Role & Permission Management for Admin and HR Manager"
description: "Implement role/permission management pages and modals accessible to ADMIN and HR_MANAGER roles, covering full CRUD for roles, permission assignment, and user role management"
status: completed
priority: P1
branch: "feature/application"
tags: ["admin", "rbac", "roles", "permissions"]
blockedBy: []
blocks: []
created: "2026-05-24T13:31:09.345Z"
createdBy: "ck:plan"
source: skill
---

# Role & Permission Management for Admin and HR Manager

## Context

The platform needs a dedicated UI for managing RBAC (roles and permissions) accessible to ADMIN and HR_MANAGER roles. Currently, there is no UI to view, create, clone, or edit roles/permissions, nor to manage which roles are assigned to individual users. The auth service already exposes the necessary APIs — this plan implements the frontend layer.

## Overview

Build a `/roles-permissions` control panel page (HRM+Admin access) with:
- **Roles tab**: table of all roles with view detail, clone (Admin), delete (Admin)
- **Permissions tab**: read-only list of all available permissions
- **Role Detail Modal**: view permissions of a role; Admin can add/remove permissions in batch
- **Clone Role Modal**: Admin creates new role from an existing one
- **User Roles Management**: integrated panel in existing `/users/[userId]` user detail page

## Access Control
| Feature | ADMIN | HR_MANAGER |
|---------|-------|------------|
| View roles & permissions | ✅ | ✅ |
| Clone role | ✅ | ❌ |
| Edit role permissions | ✅ | ❌ |
| Delete role (non-built-in) | ✅ | ❌ |
| Grant/revoke user roles | ✅ | ✅ (HR users only) |

## Phases

| Phase | Name | Status | Effort |
|-------|------|--------|--------|
| 1 | [Types and Service Layer](./phase-01-types-and-service-layer.md) | Pending | 1h |
| 2 | [React Hooks](./phase-02-react-hooks.md) | Pending | 1.5h |
| 3 | [Core UI Components](./phase-03-core-ui-components.md) | Pending | 3h |
| 4 | [Page Routing and Navigation](./phase-04-page-routing-and-navigation.md) | Pending | 1h |
| 5 | [User Roles Integration](./phase-05-user-roles-integration.md) | Pending | 1h |

## Key Files

### Create
- `types/role-permission.ts`
- `lib/admin/role-permission-service.ts`
- `hooks/useRoles.ts`
- `hooks/usePermissions.ts`
- `hooks/useUserRoles.ts`
- `components/roles/roles-permissions-client.tsx`
- `components/roles/roles-table.tsx`
- `components/roles/role-detail-modal.tsx`
- `components/roles/clone-role-modal.tsx`
- `components/roles/delete-role-confirm.tsx`
- `components/roles/permissions-table.tsx`
- `components/roles/user-roles-panel.tsx`
- `app/(control)/roles-permissions/page.tsx`

### Modify
- `middleware.ts` — add `/roles-permissions` to HRM_ROUTES
- `lib/navigation.ts` — add "Roles & Permissions" nav item
- `components/users/user-detail.tsx` — add user roles section (calls useUserRoles)

## Dependencies
- All phases sequential; Phase 3 depends on Phase 1+2; Phase 5 depends on Phase 1+2
