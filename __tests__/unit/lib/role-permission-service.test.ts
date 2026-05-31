import { describe, it, expect, beforeEach, vi } from "vitest"
import { rolePermissionService } from "@/lib/admin/role-permission-service"

const mockPost = vi.hoisted(() => vi.fn())
const mockGet = vi.hoisted(() => vi.fn())
const mockDelete = vi.hoisted(() => vi.fn())

vi.mock("@/lib/api-client", () => ({
  apiClient: {
    post: mockPost,
    get: mockGet,
    delete: mockDelete,
  },
}))

describe("rolePermissionService", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ── Permissions ─────────────────────────────────────────────────────────────

  describe("getAllPermissions", () => {
    it("calls GET /auth/permissions", async () => {
      const res = { success: true, data: [] }
      mockGet.mockResolvedValue(res)

      const result = await rolePermissionService.getAllPermissions()

      expect(mockGet).toHaveBeenCalledWith("/auth/permissions")
      expect(result).toEqual(res)
    })

    it("propagates rejection", async () => {
      mockGet.mockRejectedValue(new Error("Network error"))
      await expect(rolePermissionService.getAllPermissions()).rejects.toThrow("Network error")
    })
  })

  describe("getPermission", () => {
    it("calls GET /auth/permissions/:name", async () => {
      const res = { success: true, data: { name: "application:read", description: "Read" } }
      mockGet.mockResolvedValue(res)

      const result = await rolePermissionService.getPermission("application:read")

      expect(mockGet).toHaveBeenCalledWith("/auth/permissions/application:read")
      expect(result).toEqual(res)
    })

    it("propagates rejection", async () => {
      mockGet.mockRejectedValue(new Error("Not found"))
      await expect(rolePermissionService.getPermission("bad:perm")).rejects.toThrow("Not found")
    })
  })

  // ── Roles ────────────────────────────────────────────────────────────────────

  describe("getAllRoles", () => {
    it("calls GET /auth/roles", async () => {
      const res = { success: true, data: [] }
      mockGet.mockResolvedValue(res)

      const result = await rolePermissionService.getAllRoles()

      expect(mockGet).toHaveBeenCalledWith("/auth/roles")
      expect(result).toEqual(res)
    })

    it("propagates rejection", async () => {
      mockGet.mockRejectedValue(new Error("Server error"))
      await expect(rolePermissionService.getAllRoles()).rejects.toThrow("Server error")
    })
  })

  describe("getRole", () => {
    it("calls GET /auth/roles/:name", async () => {
      const res = { success: true, data: { name: "HR", description: "HR role", permissions: [] } }
      mockGet.mockResolvedValue(res)

      const result = await rolePermissionService.getRole("HR")

      expect(mockGet).toHaveBeenCalledWith("/auth/roles/HR")
      expect(result).toEqual(res)
    })

    it("propagates rejection", async () => {
      mockGet.mockRejectedValue(new Error("Not found"))
      await expect(rolePermissionService.getRole("UNKNOWN")).rejects.toThrow("Not found")
    })
  })

  describe("cloneRole", () => {
    it("calls POST /auth/roles/:sourceName/clone with body", async () => {
      const res = { success: true, data: { name: "HR_CUSTOM", description: "Custom HR" } }
      mockPost.mockResolvedValue(res)

      const body = { name: "HR_CUSTOM", description: "Custom HR" }
      const result = await rolePermissionService.cloneRole("HR", body)

      expect(mockPost).toHaveBeenCalledWith("/auth/roles/HR/clone", body)
      expect(result).toEqual(res)
    })

    it("propagates rejection", async () => {
      mockPost.mockRejectedValue(new Error("Name taken"))
      await expect(
        rolePermissionService.cloneRole("HR", { name: "HR_CUSTOM", description: "" }),
      ).rejects.toThrow("Name taken")
    })
  })

  describe("deleteRole", () => {
    it("calls DELETE /auth/roles/:roleName", async () => {
      const res = { success: true, data: null }
      mockDelete.mockResolvedValue(res)

      const result = await rolePermissionService.deleteRole("HR_CUSTOM")

      expect(mockDelete).toHaveBeenCalledWith("/auth/roles/HR_CUSTOM")
      expect(result).toEqual(res)
    })

    it("propagates rejection", async () => {
      mockDelete.mockRejectedValue(new Error("Cannot delete built-in role"))
      await expect(rolePermissionService.deleteRole("ADMIN")).rejects.toThrow(
        "Cannot delete built-in role",
      )
    })
  })

  // ── Role permissions ─────────────────────────────────────────────────────────

  describe("addPermissionToRole", () => {
    it("calls POST /auth/roles/:roleName/permissions with body", async () => {
      const res = { success: true, data: { name: "HR_CUSTOM", permissions: ["application:read"] } }
      mockPost.mockResolvedValue(res)

      const body = { permission: "application:read" }
      const result = await rolePermissionService.addPermissionToRole("HR_CUSTOM", body)

      expect(mockPost).toHaveBeenCalledWith("/auth/roles/HR_CUSTOM/permissions", body)
      expect(result).toEqual(res)
    })

    it("propagates rejection", async () => {
      mockPost.mockRejectedValue(new Error("Permission not found"))
      await expect(
        rolePermissionService.addPermissionToRole("HR_CUSTOM", { permission: "bad:perm" }),
      ).rejects.toThrow("Permission not found")
    })
  })

  describe("addPermissionsBatch", () => {
    it("calls POST /auth/roles/:roleName/permissions/batch with body", async () => {
      const res = { success: true, data: { name: "HR_CUSTOM", permissions: ["a", "b"] } }
      mockPost.mockResolvedValue(res)

      const body = { permissions: ["application:read", "job:read"] }
      const result = await rolePermissionService.addPermissionsBatch("HR_CUSTOM", body)

      expect(mockPost).toHaveBeenCalledWith("/auth/roles/HR_CUSTOM/permissions/batch", body)
      expect(result).toEqual(res)
    })

    it("propagates rejection", async () => {
      mockPost.mockRejectedValue(new Error("Server error"))
      await expect(
        rolePermissionService.addPermissionsBatch("HR_CUSTOM", { permissions: [] }),
      ).rejects.toThrow("Server error")
    })
  })

  describe("removePermissionFromRole", () => {
    it("calls DELETE with URL-encoded permission query param", async () => {
      const res = { success: true, data: { name: "HR_CUSTOM", permissions: [] } }
      mockDelete.mockResolvedValue(res)

      const result = await rolePermissionService.removePermissionFromRole(
        "HR_CUSTOM",
        "application:read",
      )

      expect(mockDelete).toHaveBeenCalledWith(
        "/auth/roles/HR_CUSTOM/permissions?permission=application%3Aread",
      )
      expect(result).toEqual(res)
    })

    it("URL-encodes special characters in permission name", async () => {
      mockDelete.mockResolvedValue({ success: true, data: {} })

      await rolePermissionService.removePermissionFromRole("HR_CUSTOM", "job:read+write")

      expect(mockDelete).toHaveBeenCalledWith(
        `/auth/roles/HR_CUSTOM/permissions?permission=${encodeURIComponent("job:read+write")}`,
      )
    })

    it("propagates rejection", async () => {
      mockDelete.mockRejectedValue(new Error("Not found"))
      await expect(
        rolePermissionService.removePermissionFromRole("HR_CUSTOM", "bad:perm"),
      ).rejects.toThrow("Not found")
    })
  })

  describe("removePermissionsBatch", () => {
    it("calls DELETE /auth/roles/:roleName/permissions/batch with body", async () => {
      const res = { success: true, data: { name: "HR_CUSTOM", permissions: [] } }
      mockDelete.mockResolvedValue(res)

      const body = { permissions: ["application:read", "job:read"] }
      const result = await rolePermissionService.removePermissionsBatch("HR_CUSTOM", body)

      expect(mockDelete).toHaveBeenCalledWith(
        "/auth/roles/HR_CUSTOM/permissions/batch",
        body,
      )
      expect(result).toEqual(res)
    })

    it("propagates rejection", async () => {
      mockDelete.mockRejectedValue(new Error("Server error"))
      await expect(
        rolePermissionService.removePermissionsBatch("HR_CUSTOM", { permissions: [] }),
      ).rejects.toThrow("Server error")
    })
  })

  // ── User roles ───────────────────────────────────────────────────────────────

  describe("getUserRoles", () => {
    it("calls GET /auth/users/:username/roles", async () => {
      const res = { success: true, data: ["HR", "HR_CUSTOM"] }
      mockGet.mockResolvedValue(res)

      const result = await rolePermissionService.getUserRoles("johndoe")

      expect(mockGet).toHaveBeenCalledWith("/auth/users/johndoe/roles")
      expect(result).toEqual(res)
    })

    it("propagates rejection", async () => {
      mockGet.mockRejectedValue(new Error("User not found"))
      await expect(rolePermissionService.getUserRoles("nobody")).rejects.toThrow("User not found")
    })
  })

  describe("grantRoleToUser", () => {
    it("calls POST with URL-encoded role query param", async () => {
      const res = { success: true, data: null }
      mockPost.mockResolvedValue(res)

      const result = await rolePermissionService.grantRoleToUser("johndoe", "HR_CUSTOM")

      expect(mockPost).toHaveBeenCalledWith(
        "/auth/users/johndoe/roles?role=HR_CUSTOM",
      )
      expect(result).toEqual(res)
    })

    it("URL-encodes role names with special characters", async () => {
      mockPost.mockResolvedValue({ success: true, data: null })

      await rolePermissionService.grantRoleToUser("johndoe", "HR CUSTOM")

      expect(mockPost).toHaveBeenCalledWith(
        `/auth/users/johndoe/roles?role=${encodeURIComponent("HR CUSTOM")}`,
      )
    })

    it("propagates rejection", async () => {
      mockPost.mockRejectedValue(new Error("Role not found"))
      await expect(
        rolePermissionService.grantRoleToUser("johndoe", "NONEXISTENT"),
      ).rejects.toThrow("Role not found")
    })
  })

  describe("revokeRoleFromUser", () => {
    it("calls DELETE with URL-encoded role query param", async () => {
      const res = { success: true, data: null }
      mockDelete.mockResolvedValue(res)

      const result = await rolePermissionService.revokeRoleFromUser("johndoe", "HR_CUSTOM")

      expect(mockDelete).toHaveBeenCalledWith(
        "/auth/users/johndoe/roles?role=HR_CUSTOM",
      )
      expect(result).toEqual(res)
    })

    it("propagates rejection", async () => {
      mockDelete.mockRejectedValue(new Error("Cannot revoke primary role"))
      await expect(
        rolePermissionService.revokeRoleFromUser("johndoe", "HR"),
      ).rejects.toThrow("Cannot revoke primary role")
    })
  })

  describe("grantRolesBatch", () => {
    it("calls POST /auth/users/:username/roles/batch with body", async () => {
      const res = { success: true, data: null }
      mockPost.mockResolvedValue(res)

      const body = { roles: ["HR_CUSTOM", "HR_SENIOR"] }
      const result = await rolePermissionService.grantRolesBatch("johndoe", body)

      expect(mockPost).toHaveBeenCalledWith("/auth/users/johndoe/roles/batch", body)
      expect(result).toEqual(res)
    })

    it("propagates rejection", async () => {
      mockPost.mockRejectedValue(new Error("Server error"))
      await expect(
        rolePermissionService.grantRolesBatch("johndoe", { roles: [] }),
      ).rejects.toThrow("Server error")
    })
  })

  describe("revokeRolesBatch", () => {
    it("calls DELETE /auth/users/:username/roles/batch with body", async () => {
      const res = { success: true, data: null }
      mockDelete.mockResolvedValue(res)

      const body = { roles: ["HR_CUSTOM"] }
      const result = await rolePermissionService.revokeRolesBatch("johndoe", body)

      expect(mockDelete).toHaveBeenCalledWith("/auth/users/johndoe/roles/batch", body)
      expect(result).toEqual(res)
    })

    it("propagates rejection", async () => {
      mockDelete.mockRejectedValue(new Error("Server error"))
      await expect(
        rolePermissionService.revokeRolesBatch("johndoe", { roles: [] }),
      ).rejects.toThrow("Server error")
    })
  })
})
