import { describe, it, expect, beforeEach, vi } from "vitest"
import { userService } from "@/lib/user/user-service"

const mockPost = vi.hoisted(() => vi.fn())
const mockGet = vi.hoisted(() => vi.fn())
const mockPut = vi.hoisted(() => vi.fn())
const mockDelete = vi.hoisted(() => vi.fn())
const mockUpload = vi.hoisted(() => vi.fn())

vi.mock("@/lib/api-client", () => ({
  apiClient: {
    post: mockPost,
    get: mockGet,
    put: mockPut,
    delete: mockDelete,
    upload: mockUpload,
  },
}))

describe("userService", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("Profile", () => {
    describe("getMyProfile", () => {
      it("should fetch user profile", async () => {
        const mockResponse = {
          status: 200,
          data: {
            userId: "u1",
            username: "testuser",
            fullName: "Test User",
            email: "test@example.com",
          },
        }
        mockGet.mockResolvedValue(mockResponse)

        const result = await userService.getMyProfile()

        expect(mockGet).toHaveBeenCalledWith("/user/profile/me")
        expect(result).toEqual(mockResponse)
      })
    })

    describe("updateCandidateProfile", () => {
      it("should update profile with fullName", async () => {
        const mockResponse = {
          status: 200,
          data: { userId: "u1", fullName: "Updated Name" },
        }
        mockPut.mockResolvedValue(mockResponse)

        const data = { fullName: "Updated Name" }
        const result = await userService.updateCandidateProfile(data)

        expect(mockPut).toHaveBeenCalledWith("/user/profile/candidate", data)
        expect(result).toEqual(mockResponse)
      })

      it("should update multiple profile fields", async () => {
        const mockResponse = { status: 200, data: {} }
        mockPut.mockResolvedValue(mockResponse)

        const data = {
          fullName: "John Doe",
          phoneNumber: "+84912345678",
          totalExperience: 5,
        }
        await userService.updateCandidateProfile(data)

        expect(mockPut).toHaveBeenCalledWith("/user/profile/candidate", data)
      })
    })
  })

  describe("Avatar", () => {
    describe("getAvatar", () => {
      it("should fetch avatar data", async () => {
        const mockResponse = {
          status: 200,
          data: {
            avatarUrl: "https://cdn.example.com/avatar.jpg",
            publicId: "public-id-123",
            uploadedAt: "2026-01-01T00:00:00Z",
          },
        }
        mockGet.mockResolvedValue(mockResponse)

        const result = await userService.getAvatar()

        expect(mockGet).toHaveBeenCalledWith("/user/profile/avatar")
        expect(result).toEqual(mockResponse)
      })
    })

    describe("uploadAvatar", () => {
      it("should upload avatar file", async () => {
        const mockFile = new File(["test"], "avatar.jpg", {
          type: "image/jpeg",
        })
        const mockResponse = {
          status: 200,
          data: {
            avatarUrl: "https://cdn.example.com/avatar.jpg",
            publicId: "public-id-123",
            uploadedAt: "2026-01-01T00:00:00Z",
          },
        }
        mockUpload.mockResolvedValue(mockResponse)

        const result = await userService.uploadAvatar(mockFile)

        expect(mockUpload).toHaveBeenCalledWith(
          "/user/profile/avatar",
          expect.any(FormData)
        )
        expect(result).toEqual(mockResponse)
      })

      it("should add file to FormData with correct field name", async () => {
        const mockFile = new File(["test"], "avatar.png", {
          type: "image/png",
        })
        const mockResponse = { status: 200, data: {} }
        mockUpload.mockResolvedValue(mockResponse)

        await userService.uploadAvatar(mockFile)

        const formDataArg = mockUpload.mock.calls[0][1]
        expect(formDataArg).toBeInstanceOf(FormData)
      })
    })

    describe("deleteAvatar", () => {
      it("should delete avatar", async () => {
        mockDelete.mockResolvedValue({})

        await userService.deleteAvatar()

        expect(mockDelete).toHaveBeenCalledWith("/user/profile/avatar")
      })
    })
  })

  describe("Sessions", () => {
    describe("getActiveSessions", () => {
      it("should fetch active sessions", async () => {
        const mockResponse = {
          status: 200,
          data: [
            {
              sessionId: "session-1",
              deviceId: "device-1",
              deviceName: "Chrome on MacOS",
              ipAddress: "192.168.1.1",
              createdAt: "2026-01-01T00:00:00Z",
              lastActivityAt: "2026-01-01T12:00:00Z",
              expiresAt: "2026-01-08T00:00:00Z",
              current: true,
            },
          ],
        }
        mockGet.mockResolvedValue(mockResponse)

        const result = await userService.getActiveSessions()

        expect(mockGet).toHaveBeenCalledWith("/auth/sessions")
        expect(result).toEqual(mockResponse)
      })
    })

    describe("revokeSession", () => {
      it("should revoke specific session", async () => {
        const mockResponse = { status: 200, data: {} }
        mockDelete.mockResolvedValue(mockResponse)

        const result = await userService.revokeSession("session-1")

        expect(mockDelete).toHaveBeenCalledWith("/auth/sessions/session-1")
        expect(result).toEqual(mockResponse)
      })
    })

    describe("revokeAllOtherSessions", () => {
      it("should revoke all other sessions", async () => {
        const mockResponse = { status: 200, data: {} }
        mockDelete.mockResolvedValue(mockResponse)

        const result = await userService.revokeAllOtherSessions()

        expect(mockDelete).toHaveBeenCalledWith("/auth/sessions/others")
        expect(result).toEqual(mockResponse)
      })
    })
  })

  describe("Notification Settings", () => {
    describe("getNotificationSettings", () => {
      it("should fetch notification settings", async () => {
        const mockResponse = {
          status: 200,
          data: {
            emailNotifications: true,
            applicationUpdates: true,
            jobRecommendations: false,
            marketingEmails: false,
            weeklyDigest: true,
          },
        }
        mockGet.mockResolvedValue(mockResponse)

        const result = await userService.getNotificationSettings()

        expect(mockGet).toHaveBeenCalledWith(
          "/user/profile/notification-settings"
        )
        expect(result).toEqual(mockResponse)
      })
    })

    describe("updateNotificationSettings", () => {
      it("should update notification settings", async () => {
        const mockResponse = { status: 200, data: {} }
        mockPut.mockResolvedValue(mockResponse)

        const data = {
          emailNotifications: false,
          applicationUpdates: true,
          jobRecommendations: true,
          marketingEmails: false,
          weeklyDigest: true,
        }
        const result = await userService.updateNotificationSettings(data)

        expect(mockPut).toHaveBeenCalledWith(
          "/user/profile/notification-settings",
          data
        )
        expect(result).toEqual(mockResponse)
      })
    })
  })

  describe("Privacy Settings", () => {
    describe("getPrivacySettings", () => {
      it("should fetch privacy settings", async () => {
        const mockResponse = {
          status: 200,
          data: {
            profileVisibility: "PUBLIC",
            showEmail: true,
            showPhoneNumber: false,
            searchEngineIndexed: true,
            allowMessages: true,
          },
        }
        mockGet.mockResolvedValue(mockResponse)

        const result = await userService.getPrivacySettings()

        expect(mockGet).toHaveBeenCalledWith(
          "/user/profile/privacy-settings"
        )
        expect(result).toEqual(mockResponse)
      })
    })

    describe("updatePrivacySettings", () => {
      it("should update privacy settings", async () => {
        const mockResponse = { status: 200, data: {} }
        mockPut.mockResolvedValue(mockResponse)

        const data = {
          profileVisibility: "PRIVATE" as const,
          showEmail: false,
          showPhoneNumber: false,
          searchEngineIndexed: false,
          allowMessages: false,
        }
        const result = await userService.updatePrivacySettings(data)

        expect(mockPut).toHaveBeenCalledWith(
          "/user/profile/privacy-settings",
          data
        )
        expect(result).toEqual(mockResponse)
      })
    })
  })

  describe("Security", () => {
    describe("changePassword", () => {
      it("should change password with matching confirmPassword", async () => {
        const mockResponse = { status: 200, data: {} }
        mockPost.mockResolvedValue(mockResponse)

        const data = {
          currentPassword: "oldpass",
          newPassword: "newpass1234",
          confirmPassword: "newpass1234",
        }
        const result = await userService.changePassword(data)

        expect(mockPost).toHaveBeenCalledWith("/auth/change-password", data)
        expect(result).toEqual(mockResponse)
      })
    })

    describe("enableTwoFactor", () => {
      it("should enable 2FA with EMAIL method", async () => {
        const mockResponse = { status: 200, data: {} }
        mockPost.mockResolvedValue(mockResponse)

        const data = { method: "EMAIL" as const }
        const result = await userService.enableTwoFactor(data)

        expect(mockPost).toHaveBeenCalledWith("/auth/enable-2fa", data)
        expect(result).toEqual(mockResponse)
      })
    })

    describe("disableTwoFactor", () => {
      it("should disable 2FA with password and code", async () => {
        const mockResponse = { status: 200, data: {} }
        mockPost.mockResolvedValue(mockResponse)

        const data = { password: "pass", code: "123456" }
        const result = await userService.disableTwoFactor(data)

        expect(mockPost).toHaveBeenCalledWith("/auth/disable-2fa", data)
        expect(result).toEqual(mockResponse)
      })
    })
  })

  describe("Danger Zone", () => {
    describe("deactivateAccount", () => {
      it("should deactivate account with password", async () => {
        const mockResponse = { status: 200, data: {} }
        mockPost.mockResolvedValue(mockResponse)

        const data = { password: "pass", reason: "Taking a break" }
        const result = await userService.deactivateAccount(data)

        expect(mockPost).toHaveBeenCalledWith("/user/profile/deactivate", data)
        expect(result).toEqual(mockResponse)
      })

      it("should deactivate without reason", async () => {
        const mockResponse = { status: 200, data: {} }
        mockPost.mockResolvedValue(mockResponse)

        const data = { password: "pass" }
        await userService.deactivateAccount(data)

        expect(mockPost).toHaveBeenCalledWith("/user/profile/deactivate", data)
      })
    })

    describe("requestAccountDeletion", () => {
      it("should request account deletion with password", async () => {
        const mockResponse = { status: 200, data: {} }
        mockPost.mockResolvedValue(mockResponse)

        const data = { password: "pass", reason: "Don't need it anymore" }
        const result = await userService.requestAccountDeletion(data)

        expect(mockPost).toHaveBeenCalledWith("/user/profile/delete-request", data)
        expect(result).toEqual(mockResponse)
      })

      it("should request deletion without reason", async () => {
        const mockResponse = { status: 200, data: {} }
        mockPost.mockResolvedValue(mockResponse)

        const data = { password: "pass" }
        await userService.requestAccountDeletion(data)

        expect(mockPost).toHaveBeenCalledWith("/user/profile/delete-request", data)
      })
    })

    describe("cancelAccountDeletion", () => {
      it("should cancel account deletion request", async () => {
        const mockResponse = { status: 200, data: {} }
        mockPost.mockResolvedValue(mockResponse)

        const result = await userService.cancelAccountDeletion()

        expect(mockPost).toHaveBeenCalledWith("/user/profile/cancel-deletion")
        expect(result).toEqual(mockResponse)
      })
    })
  })
})
