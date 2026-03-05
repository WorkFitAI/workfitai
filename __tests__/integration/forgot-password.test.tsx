/**
 * Integration tests — Forgot Password Zod schema validation
 * Tests: E4, E10-E12 from the auth test plan
 */
import { describe, it, expect } from 'vitest'
import { forgotPasswordSchema, resetPasswordSchema } from '@/lib/schemas/auth-schemas'

describe('[E] Forgot Password — form validation', () => {
  it('E4 — invalid email format → Zod rejects', () => {
    expect(forgotPasswordSchema.safeParse({ email: 'not-valid' }).success).toBe(false)
  })

  it('E4a — valid email → accepted', () => {
    expect(forgotPasswordSchema.safeParse({ email: 'user@test.com' }).success).toBe(true)
  })

  it('E10 — mismatched passwords → Zod rejects', () => {
    const r = resetPasswordSchema.safeParse({ newPassword: 'NewPass1', confirmPassword: 'OtherPass1' })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.error.issues[0].message).toMatch(/match/i)
  })

  it('E11 — password missing uppercase → rejected', () => {
    expect(resetPasswordSchema.safeParse({ newPassword: 'newpass1', confirmPassword: 'newpass1' }).success).toBe(false)
  })

  it('E11b — password missing digit → rejected', () => {
    expect(resetPasswordSchema.safeParse({ newPassword: 'NewPassword', confirmPassword: 'NewPassword' }).success).toBe(false)
  })

  it('E11c — password too short → rejected', () => {
    expect(resetPasswordSchema.safeParse({ newPassword: 'New1', confirmPassword: 'New1' }).success).toBe(false)
  })

  it('E9a — valid new password accepted', () => {
    expect(resetPasswordSchema.safeParse({ newPassword: 'NewPass1', confirmPassword: 'NewPass1' }).success).toBe(true)
  })
})
