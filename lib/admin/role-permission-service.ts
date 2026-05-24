import { apiClient } from "@/lib/api-client"
import type { ApiResponse } from "@/types/response"
import type {
  Permission,
  Role,
  CloneRoleRequest,
  AddPermissionRequest,
  BatchPermissionsRequest,
  BatchRolesRequest,
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

  async cloneRole(
    sourceName: string,
    body: CloneRoleRequest,
  ): Promise<ApiResponse<Role>> {
    return apiClient.post<ApiResponse<Role>>(
      `/auth/roles/${sourceName}/clone`,
      body,
    )
  },

  async deleteRole(roleName: string): Promise<ApiResponse<unknown>> {
    return apiClient.delete<ApiResponse<unknown>>(`/auth/roles/${roleName}`)
  },

  // ── Role permissions ───────────────────────────────────────────────────────

  async addPermissionToRole(
    roleName: string,
    body: AddPermissionRequest,
  ): Promise<ApiResponse<Role>> {
    return apiClient.post<ApiResponse<Role>>(
      `/auth/roles/${roleName}/permissions`,
      body,
    )
  },

  async addPermissionsBatch(
    roleName: string,
    body: BatchPermissionsRequest,
  ): Promise<ApiResponse<Role>> {
    return apiClient.post<ApiResponse<Role>>(
      `/auth/roles/${roleName}/permissions/batch`,
      body,
    )
  },

  async removePermissionFromRole(
    roleName: string,
    permission: string,
  ): Promise<ApiResponse<Role>> {
    return apiClient.delete<ApiResponse<Role>>(
      `/auth/roles/${roleName}/permissions?permission=${encodeURIComponent(permission)}`,
    )
  },

  async removePermissionsBatch(
    roleName: string,
    body: BatchPermissionsRequest,
  ): Promise<ApiResponse<Role>> {
    return apiClient.delete<ApiResponse<Role>>(
      `/auth/roles/${roleName}/permissions/batch`,
      body,
    )
  },

  // ── User roles ─────────────────────────────────────────────────────────────

  async getUserRoles(username: string): Promise<ApiResponse<string[]>> {
    return apiClient.get<ApiResponse<string[]>>(
      `/auth/users/${username}/roles`,
    )
  },

  async grantRoleToUser(
    username: string,
    role: string,
  ): Promise<ApiResponse<unknown>> {
    return apiClient.post<ApiResponse<unknown>>(
      `/auth/users/${username}/roles?role=${encodeURIComponent(role)}`,
    )
  },

  async revokeRoleFromUser(
    username: string,
    role: string,
  ): Promise<ApiResponse<unknown>> {
    return apiClient.delete<ApiResponse<unknown>>(
      `/auth/users/${username}/roles?role=${encodeURIComponent(role)}`,
    )
  },

  async grantRolesBatch(
    username: string,
    body: BatchRolesRequest,
  ): Promise<ApiResponse<unknown>> {
    return apiClient.post<ApiResponse<unknown>>(
      `/auth/users/${username}/roles/batch`,
      body,
    )
  },

  async revokeRolesBatch(
    username: string,
    body: BatchRolesRequest,
  ): Promise<ApiResponse<unknown>> {
    return apiClient.delete<ApiResponse<unknown>>(
      `/auth/users/${username}/roles/batch`,
      body,
    )
  },
}
