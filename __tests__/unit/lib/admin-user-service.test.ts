import { describe, it, expect, beforeEach, vi } from "vitest"
import { adminUserService } from "@/lib/admin/admin-user-service"

const mockPost = vi.hoisted(() => vi.fn())
const mockGet = vi.hoisted(() => vi.fn())
const mockPut = vi.hoisted(() => vi.fn())
const mockDelete = vi.hoisted(() => vi.fn())

vi.mock("@/lib/api-client", () => ({
  apiClient: {
    post: mockPost,
    get: mockGet,
    put: mockPut,
    delete: mockDelete,
  },
}))

describe("adminUserService", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("searchUsers", () => {
    it("should post to /user/admins/users/search with empty body", async () => {
      const mockResponse = {
        status: 200,
        data: {
          hits: [],
          totalHits: 0,
          from: 0,
          size: 10,
          roleAggregations: {},
          statusAggregations: {},
        },
      }
      mockPost.mockResolvedValue(mockResponse)

      const result = await adminUserService.searchUsers()

      expect(mockPost).toHaveBeenCalledWith("/user/admins/users/search", {})
      expect(result).toEqual(mockResponse)
    })

    it("should post with search body", async () => {
      const mockResponse = {
        status: 200,
        data: {
          hits: [],
          totalHits: 0,
          from: 0,
          size: 10,
          roleAggregations: {},
          statusAggregations: {},
        },
      }
      mockPost.mockResolvedValue(mockResponse)

      const body = { query: "john", from: 0, size: 20 }
      await adminUserService.searchUsers(body)

      expect(mockPost).toHaveBeenCalledWith("/user/admins/users/search", body)
    })

    it("should handle ES search with role filter", async () => {
      const mockResponse = {
        status: 200,
        data: {
          hits: [],
          totalHits: 0,
          from: 0,
          size: 10,
          roleAggregations: {},
          statusAggregations: {},
        },
      }
      mockPost.mockResolvedValue(mockResponse)

      const body = { query: "", role: "HR", blocked: "false" }
      await adminUserService.searchUsers(body)

      expect(mockPost).toHaveBeenCalledWith("/user/admins/users/search", body)
    })
  })

  describe("listUsers", () => {
    it("should fetch users with default params", async () => {
      const mockResponse = {
        status: 200,
        data: {
          content: [],
          totalElements: 0,
          totalPages: 0,
          number: 0,
          size: 10,
          first: true,
          last: true,
          numberOfElements: 0,
          empty: true,
        },
      }
      mockGet.mockResolvedValue(mockResponse)

      await adminUserService.listUsers()

      expect(mockGet).toHaveBeenCalledWith("/user/admins/all-users?keyword=&page=0&size=10")
    })

    it("should fetch users with keyword", async () => {
      const mockResponse = { status: 200, data: { content: [] } }
      mockGet.mockResolvedValue(mockResponse)

      await adminUserService.listUsers({ keyword: "john" })

      expect(mockGet).toHaveBeenCalledWith(
        expect.stringContaining("keyword=john")
      )
    })

    it("should fetch users with pagination", async () => {
      const mockResponse = { status: 200, data: { content: [] } }
      mockGet.mockResolvedValue(mockResponse)

      await adminUserService.listUsers({ keyword: "john", page: 2, size: 5 })

      expect(mockGet).toHaveBeenCalledWith(
        expect.stringContaining("page=2")
      )
      expect(mockGet).toHaveBeenCalledWith(
        expect.stringContaining("size=5")
      )
    })

    it("should fetch users with role filter", async () => {
      const mockResponse = { status: 200, data: { content: [] } }
      mockGet.mockResolvedValue(mockResponse)

      await adminUserService.listUsers({ role: "CANDIDATE" })

      expect(mockGet).toHaveBeenCalledWith(
        expect.stringContaining("role=CANDIDATE")
      )
    })

    it("should not include role param when empty", async () => {
      const mockResponse = { status: 200, data: { content: [] } }
      mockGet.mockResolvedValue(mockResponse)

      await adminUserService.listUsers({ role: "" })

      const call = mockGet.mock.calls[0][0]
      expect(call).not.toContain("role=")
    })
  })

  describe("getUser", () => {
    it("should fetch user by userId", async () => {
      const mockResponse = {
        status: 200,
        data: {
          userId: "user-1",
          username: "testuser",
          fullName: "Test User",
          email: "test@example.com",
        },
      }
      mockGet.mockResolvedValue(mockResponse)

      const result = await adminUserService.getUser("user-1")

      expect(mockGet).toHaveBeenCalledWith("/user/admins/users/user-1")
      expect(result).toEqual(mockResponse)
    })

    it("should handle different user IDs", async () => {
      const mockResponse = { status: 200, data: {} }
      mockGet.mockResolvedValue(mockResponse)

      await adminUserService.getUser("user-abc-123")

      expect(mockGet).toHaveBeenCalledWith("/user/admins/users/user-abc-123")
    })
  })

  describe("getUserFullProfile", () => {
    it("should fetch full profile by userId", async () => {
      const mockResponse = {
        status: 200,
        data: {
          userId: "user-1",
          username: "testuser",
          fullName: "Test User",
          email: "test@example.com",
          skills: ["JavaScript", "React"],
          totalExperience: 5,
        },
      }
      mockGet.mockResolvedValue(mockResponse)

      const result = await adminUserService.getUserFullProfile("user-1")

      expect(mockGet).toHaveBeenCalledWith(
        "/user/admins/users/user-1/full-profile"
      )
      expect(result).toEqual(mockResponse)
    })
  })

  describe("setUserBlocked", () => {
    it("should block user", async () => {
      const mockResponse = { status: 200, data: {} }
      mockPut.mockResolvedValue(mockResponse)

      const result = await adminUserService.setUserBlocked("user-1", true)

      expect(mockPut).toHaveBeenCalledWith(
        "/user/admins/users/user-1/block?blocked=true"
      )
      expect(result).toEqual(mockResponse)
    })

    it("should unblock user", async () => {
      const mockResponse = { status: 200, data: {} }
      mockPut.mockResolvedValue(mockResponse)

      const result = await adminUserService.setUserBlocked("user-1", false)

      expect(mockPut).toHaveBeenCalledWith(
        "/user/admins/users/user-1/block?blocked=false"
      )
      expect(result).toEqual(mockResponse)
    })

    it("should handle block action with different user IDs", async () => {
      const mockResponse = { status: 200, data: {} }
      mockPut.mockResolvedValue(mockResponse)

      await adminUserService.setUserBlocked("user-xyz", true)

      expect(mockPut).toHaveBeenCalledWith(
        "/user/admins/users/user-xyz/block?blocked=true"
      )
    })
  })

  describe("deleteUser", () => {
    it("should delete user by userId", async () => {
      const mockResponse = { status: 200, data: {} }
      mockDelete.mockResolvedValue(mockResponse)

      const result = await adminUserService.deleteUser("user-1")

      expect(mockDelete).toHaveBeenCalledWith("/user/admins/users/user-1")
      expect(result).toEqual(mockResponse)
    })

    it("should handle deletion of different user IDs", async () => {
      const mockResponse = { status: 200, data: {} }
      mockDelete.mockResolvedValue(mockResponse)

      await adminUserService.deleteUser("user-to-delete")

      expect(mockDelete).toHaveBeenCalledWith("/user/admins/users/user-to-delete")
    })
  })

  describe("approveManager", () => {
    it("should approve manager by username", async () => {
      const mockResponse = { status: 200, data: {} }
      mockPost.mockResolvedValue(mockResponse)

      const result = await adminUserService.approveManager("hruser")

      expect(mockPost).toHaveBeenCalledWith(
        "/user/hr/username/hruser/approve-manager"
      )
      expect(result).toEqual(mockResponse)
    })

    it("should handle approval of different usernames", async () => {
      const mockResponse = { status: 200, data: {} }
      mockPost.mockResolvedValue(mockResponse)

      await adminUserService.approveManager("manager123")

      expect(mockPost).toHaveBeenCalledWith(
        "/user/hr/username/manager123/approve-manager"
      )
    })
  })
})
