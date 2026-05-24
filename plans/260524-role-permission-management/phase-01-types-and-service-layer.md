---
phase: 1
title: "Types and Service Layer"
status: completed
priority: P1
effort: "1h"
dependencies: []
---

# Phase 1: Types and Service Layer

## Overview
Define TypeScript types for Role/Permission entities and implement the service object following the existing `adminUserService` pattern in `lib/admin/admin-user-service.ts`.

## Related Code Files
- Reuse: `lib/api-client.ts` → `apiClient` for all HTTP calls
- Reuse: `types/response.ts` → `ApiResponse<T>`
- Reuse: `lib/admin/admin-user-service.ts` as structural reference
- Create: `types/role-permission.ts`
- Create: `lib/admin/role-permission-service.ts`

## Architecture

```
types/role-permission.ts
  └─ Permission, Role, CloneRoleRequest, BatchPermissionsRequest,
     BatchRolesRequest, UserRolesResponse

lib/admin/role-permission-service.ts
  └─ rolePermissionService object
       ├─ getAllPermissions()
       ├─ getPermission(name)
       ├─ getAllRoles()
       ├─ getRole(name)
       ├─ cloneRole(sourceName, body)
       ├─ addPermissionToRole(roleName, permission)
       ├─ addPermissionsBatch(roleName, permissions[])
       ├─ removePermissionFromRole(roleName, permission)
       ├─ removePermissionsBatch(roleName, permissions[])
       ├─ deleteRole(roleName)
       ├─ getUserRoles(username)
       ├─ grantRoleToUser(username, role)
       ├─ revokeRoleFromUser(username, role)
       ├─ grantRolesBatch(username, roles[])
       └─ revokeRolesBatch(username, roles[])
```

## Implementation Steps

### Step 1 — Create `types/role-permission.ts`

```typescript
// Permission entity returned by GET /auth/permissions and GET /auth/permissions/{name}
export interface Permission {
  name: string
  description: string
}

// Role entity returned by GET /auth/roles and GET /auth/roles/{name}
export interface Role {
  name: string
  description: string
  permissions: string[] // array of permission names
}

// POST /auth/roles/{roleName}/clone body
export interface CloneRoleRequest {
  name: string
  description: string
}

// POST /auth/roles/{roleName}/permissions body
export interface AddPermissionRequest {
  permission: string
}

// POST /auth/roles/{roleName}/permissions/batch body
export interface BatchPermissionsRequest {
  permissions: string[]
}

// POST /auth/users/{username}/roles/batch body
// DELETE /auth/users/{username}/roles/batch body
export interface BatchRolesRequest {
  roles: string[]
}
```

### Step 2 — Create `lib/admin/role-permission-service.ts`

Follow the exact object-export pattern from `admin-user-service.ts`. Each method calls `apiClient` with the correct HTTP verb and path matching the API spec provided.

Key points:
- `DELETE` with body (batch remove permissions/roles) → use `apiClient.delete` with body param
- Query params for single revoke: `?permission=X` and `?role=X` → append to URL string
- All return `Promise<ApiResponse<T>>` where T is `Permission[]`, `Role`, etc.

```typescript
import { apiClient } from "@/lib/api-client"
import type { ApiResponse } from "@/types/response"
import type {
  Permission, Role, CloneRoleRequest,
  AddPermissionRequest, BatchPermissionsRequest, BatchRolesRequest
} from "@/types/role-permission"

export const rolePermissionService = {
  // ── Permissions ────────────────────────────────────────────────────────────
  async getAllPermissions(): Promise<ApiResponse<Permission[]>> {
    return apiClient.get<ApiResponse<Permission[]>>("/auth/permissions")
  },
  async getPermission(name: string): Promise<ApiResponse<Permission>> {
    return apiClient.get<ApiResponse<Permission>>(`/auth/permissions/${name}`)
  },

  // ── Roles ──────────────────────────────────────────────────────────────────
  async getAllRoles(): Promise<ApiResponse<Role[]>> {
    return apiClient.get<ApiResponse<Role[]>>("/auth/roles")
  },
  async getRole(name: string): Promise<ApiResponse<Role>> {
    return apiClient.get<ApiResponse<Role>>(`/auth/roles/${name}`)
  },
  async cloneRole(sourceName: string, body: CloneRoleRequest): Promise<ApiResponse<Role>> {
    return apiClient.post<ApiResponse<Role>>(`/auth/roles/${sourceName}/clone`, body)
  },
  async deleteRole(roleName: string): Promise<ApiResponse<unknown>> {
    return apiClient.delete<ApiResponse<unknown>>(`/auth/roles/${roleName}`)
  },

  // ── Role permissions ───────────────────────────────────────────────────────
  async addPermissionToRole(roleName: string, body: AddPermissionRequest): Promise<ApiResponse<Role>> {
    return apiClient.post<ApiResponse<Role>>(`/auth/roles/${roleName}/permissions`, body)
  },
  async addPermissionsBatch(roleName: string, body: BatchPermissionsRequest): Promise<ApiResponse<Role>> {
    return apiClient.post<ApiResponse<Role>>(`/auth/roles/${roleName}/permissions/batch`, body)
  },
  async removePermissionFromRole(roleName: string, permission: string): Promise<ApiResponse<Role>> {
    return apiClient.delete<ApiResponse<Role>>(`/auth/roles/${roleName}/permissions?permission=${encodeURIComponent(permission)}`)
  },
  async removePermissionsBatch(roleName: string, body: BatchPermissionsRequest): Promise<ApiResponse<Role>> {
    return apiClient.delete<ApiResponse<Role>>(`/auth/roles/${roleName}/permissions/batch`, body)
  },

  // ── User roles ─────────────────────────────────────────────────────────────
  async getUserRoles(username: string): Promise<ApiResponse<string[]>> {
    return apiClient.get<ApiResponse<string[]>>(`/auth/users/${username}/roles`)
  },
  async grantRoleToUser(username: string, role: string): Promise<ApiResponse<unknown>> {
    return apiClient.post<ApiResponse<unknown>>(`/auth/users/${username}/roles?role=${encodeURIComponent(role)}`)
  },
  async revokeRoleFromUser(username: string, role: string): Promise<ApiResponse<unknown>> {
    return apiClient.delete<ApiResponse<unknown>>(`/auth/users/${username}/roles?role=${encodeURIComponent(role)}`)
  },
  async grantRolesBatch(username: string, body: BatchRolesRequest): Promise<ApiResponse<unknown>> {
    return apiClient.post<ApiResponse<unknown>>(`/auth/users/${username}/roles/batch`, body)
  },
  async revokeRolesBatch(username: string, body: BatchRolesRequest): Promise<ApiResponse<unknown>> {
    return apiClient.delete<ApiResponse<unknown>>(`/auth/users/${username}/roles/batch`, body)
  },
}
```

> **Note on `apiClient.delete` with body**: Check `lib/api-client.ts` — if the `delete` method does not accept a body param, add an overload or use `apiClient.post` equivalent with method override, OR extend the apiClient to support body in DELETE. Inspect the existing implementation first.

## Success Criteria
- [ ] `types/role-permission.ts` exports all required interfaces (Permission, Role, CloneRoleRequest, AddPermissionRequest, BatchPermissionsRequest, BatchRolesRequest)
- [ ] `lib/admin/role-permission-service.ts` exports `rolePermissionService` with all 15 methods
- [ ] TypeScript compiles without errors (`tsc --noEmit`)
- [ ] All service methods match the exact API spec paths and HTTP verbs

## Risk Assessment
- `apiClient.delete` may not support a request body (needed for batch remove). Verify `lib/api-client.ts` before implementing. If body not supported, add a second argument to the delete method.
