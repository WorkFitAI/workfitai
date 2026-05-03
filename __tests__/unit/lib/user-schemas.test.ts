import { describe, it, expect } from "vitest"
import {
  profileSchema,
  changePasswordSchema,
  disableTwoFactorSchema,
  deactivateSchema,
  deleteAccountSchema,
} from "@/lib/schemas/user-schemas"

describe("User Schemas", () => {
  describe("profileSchema", () => {
    describe("fullName validation", () => {
      it("should accept valid fullName", () => {
        const result = profileSchema.safeParse({ fullName: "John Doe" })
        expect(result.success).toBe(true)
      })

      it("should reject empty fullName", () => {
        const result = profileSchema.safeParse({ fullName: "" })
        expect(result.success).toBe(false)
        expect(result.error?.issues[0].message).toContain(
          "Full name is required"
        )
      })

      it("should accept max 100 characters", () => {
        const longName = "A".repeat(100)
        const result = profileSchema.safeParse({ fullName: longName })
        expect(result.success).toBe(true)
      })

      it("should reject > 100 characters", () => {
        const longName = "A".repeat(101)
        const result = profileSchema.safeParse({ fullName: longName })
        expect(result.success).toBe(false)
      })
    })

    describe("phoneNumber validation", () => {
      it("should accept valid phone with +", () => {
        const result = profileSchema.safeParse({
          fullName: "John Doe",
          phoneNumber: "+84912345678",
        })
        expect(result.success).toBe(true)
      })

      it("should accept phone without +", () => {
        const result = profileSchema.safeParse({
          fullName: "John Doe",
          phoneNumber: "0912345678",
        })
        expect(result.success).toBe(true)
      })

      it("should accept empty phoneNumber", () => {
        const result = profileSchema.safeParse({
          fullName: "John Doe",
          phoneNumber: "",
        })
        expect(result.success).toBe(true)
      })

      it("should accept null phoneNumber via undefined", () => {
        const result = profileSchema.safeParse({
          fullName: "John Doe",
          // phoneNumber omitted, allowing undefined/null
        })
        expect(result.success).toBe(true)
      })

      it("should reject invalid phone format", () => {
        const result = profileSchema.safeParse({
          fullName: "John Doe",
          phoneNumber: "abc",
        })
        expect(result.success).toBe(false)
        expect(result.error?.issues[0].message).toContain("Invalid phone")
      })
    })

    describe("URL fields validation", () => {
      const baseData = { fullName: "John Doe" }

      it("should accept valid portfolio link", () => {
        const result = profileSchema.safeParse({
          ...baseData,
          portfolioLink: "https://example.com",
        })
        expect(result.success).toBe(true)
      })

      it("should accept valid LinkedIn URL", () => {
        const result = profileSchema.safeParse({
          ...baseData,
          linkedinUrl: "https://linkedin.com/in/johndoe",
        })
        expect(result.success).toBe(true)
      })

      it("should accept valid GitHub URL", () => {
        const result = profileSchema.safeParse({
          ...baseData,
          githubUrl: "https://github.com/johndoe",
        })
        expect(result.success).toBe(true)
      })

      it("should accept empty portfolioLink", () => {
        const result = profileSchema.safeParse({
          ...baseData,
          portfolioLink: "",
        })
        expect(result.success).toBe(true)
      })

      it("should reject invalid URL for portfolioLink", () => {
        const result = profileSchema.safeParse({
          ...baseData,
          portfolioLink: "not-a-url",
        })
        expect(result.success).toBe(false)
        expect(result.error?.issues[0].message).toContain("valid URL")
      })

      it("should reject invalid URL for linkedinUrl", () => {
        const result = profileSchema.safeParse({
          ...baseData,
          linkedinUrl: "invalid",
        })
        expect(result.success).toBe(false)
      })
    })

    describe("totalExperience validation", () => {
      const baseData = { fullName: "John Doe" }

      it("should accept 0 experience", () => {
        const result = profileSchema.safeParse({
          ...baseData,
          totalExperience: 0,
        })
        expect(result.success).toBe(true)
      })

      it("should accept 5 years experience", () => {
        const result = profileSchema.safeParse({
          ...baseData,
          totalExperience: 5,
        })
        expect(result.success).toBe(true)
      })

      it("should accept max 50 years", () => {
        const result = profileSchema.safeParse({
          ...baseData,
          totalExperience: 50,
        })
        expect(result.success).toBe(true)
      })

      it("should accept undefined", () => {
        const result = profileSchema.safeParse(baseData)
        expect(result.success).toBe(true)
      })

      it("should reject negative experience", () => {
        const result = profileSchema.safeParse({
          ...baseData,
          totalExperience: -1,
        })
        expect(result.success).toBe(false)
      })

      it("should reject > 50 years", () => {
        const result = profileSchema.safeParse({
          ...baseData,
          totalExperience: 51,
        })
        expect(result.success).toBe(false)
      })
    })

    describe("text fields validation", () => {
      const baseData = { fullName: "John Doe" }

      it("should accept address", () => {
        const result = profileSchema.safeParse({
          ...baseData,
          address: "123 Main St, City",
        })
        expect(result.success).toBe(true)
      })

      it("should accept careerObjective", () => {
        const result = profileSchema.safeParse({
          ...baseData,
          careerObjective: "Seeking senior developer role",
        })
        expect(result.success).toBe(true)
      })

      it("should accept summary up to 2000 chars", () => {
        const summary = "A".repeat(2000)
        const result = profileSchema.safeParse({
          ...baseData,
          summary,
        })
        expect(result.success).toBe(true)
      })

      it("should reject summary > 2000 chars", () => {
        const summary = "A".repeat(2001)
        const result = profileSchema.safeParse({
          ...baseData,
          summary,
        })
        expect(result.success).toBe(false)
      })
    })
  })

  describe("changePasswordSchema", () => {
    describe("valid password changes", () => {
      it("should accept valid password change", () => {
        const result = changePasswordSchema.safeParse({
          currentPassword: "oldpass123",
          newPassword: "newpass1234",
          confirmPassword: "newpass1234",
        })
        expect(result.success).toBe(true)
      })
    })

    describe("currentPassword validation", () => {
      const baseData = {
        newPassword: "newpass1234",
        confirmPassword: "newpass1234",
      }

      it("should reject empty currentPassword", () => {
        const result = changePasswordSchema.safeParse({
          ...baseData,
          currentPassword: "",
        })
        expect(result.success).toBe(false)
        expect(result.error?.issues[0].message).toContain("Required")
      })
    })

    describe("newPassword validation", () => {
      const baseData = {
        currentPassword: "oldpass",
        confirmPassword: "x",
      }

      it("should reject newPassword < 8 chars", () => {
        const result = changePasswordSchema.safeParse({
          ...baseData,
          newPassword: "short",
          confirmPassword: "short",
        })
        expect(result.success).toBe(false)
        expect(result.error?.issues[0].message).toContain("Min 8 characters")
      })

      it("should accept newPassword = 8 chars", () => {
        const result = changePasswordSchema.safeParse({
          ...baseData,
          newPassword: "12345678",
          confirmPassword: "12345678",
        })
        expect(result.success).toBe(true)
      })
    })

    describe("password confirmation", () => {
      it("should reject mismatched confirmPassword", () => {
        const result = changePasswordSchema.safeParse({
          currentPassword: "oldpass",
          newPassword: "newpass1234",
          confirmPassword: "different1234",
        })
        expect(result.success).toBe(false)
        expect(result.error?.issues[0].message).toContain("don't match")
      })

      it("should accept matching confirmPassword", () => {
        const result = changePasswordSchema.safeParse({
          currentPassword: "oldpass",
          newPassword: "newpass1234",
          confirmPassword: "newpass1234",
        })
        expect(result.success).toBe(true)
      })
    })
  })

  describe("disableTwoFactorSchema", () => {
    it("should accept valid disable 2FA request", () => {
      const result = disableTwoFactorSchema.safeParse({
        password: "mypassword",
        code: "123456",
      })
      expect(result.success).toBe(true)
    })

    it("should reject empty password", () => {
      const result = disableTwoFactorSchema.safeParse({
        password: "",
        code: "123456",
      })
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toContain("Required")
    })

    it("should reject code < 6 digits", () => {
      const result = disableTwoFactorSchema.safeParse({
        password: "pass",
        code: "12345",
      })
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toContain("6 digits")
    })

    it("should reject code > 6 digits", () => {
      const result = disableTwoFactorSchema.safeParse({
        password: "pass",
        code: "1234567",
      })
      expect(result.success).toBe(false)
    })

    it("should accept exactly 6 digit code", () => {
      const result = disableTwoFactorSchema.safeParse({
        password: "pass",
        code: "123456",
      })
      expect(result.success).toBe(true)
    })
  })

  describe("deactivateSchema", () => {
    it("should accept deactivation with password only", () => {
      const result = deactivateSchema.safeParse({
        password: "mypassword",
      })
      expect(result.success).toBe(true)
    })

    it("should accept deactivation with password and reason", () => {
      const result = deactivateSchema.safeParse({
        password: "mypassword",
        reason: "Taking a break from the platform",
      })
      expect(result.success).toBe(true)
    })

    it("should accept empty reason", () => {
      const result = deactivateSchema.safeParse({
        password: "mypassword",
        reason: "",
      })
      expect(result.success).toBe(true)
    })

    it("should reject empty password", () => {
      const result = deactivateSchema.safeParse({
        password: "",
        reason: "Some reason",
      })
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toContain("Password is required")
    })
  })

  describe("deleteAccountSchema", () => {
    it("should accept valid account deletion request", () => {
      const result = deleteAccountSchema.safeParse({
        password: "mypassword",
        confirmText: "DELETE",
      })
      expect(result.success).toBe(true)
    })

    it("should accept with reason", () => {
      const result = deleteAccountSchema.safeParse({
        password: "mypassword",
        reason: "Not using anymore",
        confirmText: "DELETE",
      })
      expect(result.success).toBe(true)
    })

    it("should reject empty password", () => {
      const result = deleteAccountSchema.safeParse({
        password: "",
        confirmText: "DELETE",
      })
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toContain("Password is required")
    })

    it("should reject missing confirmText", () => {
      const result = deleteAccountSchema.safeParse({
        password: "pass",
        confirmText: "",
      })
      expect(result.success).toBe(false)
        expect(result.error?.issues[0].message).toContain("This field is required")
    })

    it("should reject incorrect confirmText", () => {
      const result = deleteAccountSchema.safeParse({
        password: "pass",
        confirmText: "delete", // lowercase
      })
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toContain('Type "DELETE"')
    })

    it("should accept only exact DELETE text", () => {
      const result = deleteAccountSchema.safeParse({
        password: "pass",
        confirmText: "DELETE",
      })
      expect(result.success).toBe(true)
    })
  })
})
