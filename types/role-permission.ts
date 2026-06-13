// Role and Permission entity types for RBAC management

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
// DELETE /auth/roles/{roleName}/permissions/batch body
export interface BatchPermissionsRequest {
  permissions: string[]
}

// POST /auth/users/{username}/roles/batch body
// DELETE /auth/users/{username}/roles/batch body
export interface BatchRolesRequest {
  roles: string[]
}
