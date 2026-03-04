import { describe, it, expect } from 'vitest'
import {
  loginSchema,
  candidateRegisterSchema,
  resetPasswordSchema,
  forgotPasswordSchema,
} from '@/lib/schemas/auth-schemas'

describe('loginSchema', () => {
  it('accepts valid credentials', () => {
    expect(loginSchema.safeParse({ usernameOrEmail: 'user@example.com', password: 'Password1' }).success).toBe(true)
  })

  it('rejects missing usernameOrEmail', () => {
    expect(loginSchema.safeParse({ usernameOrEmail: '', password: 'Password1' }).success).toBe(false)
  })

  it('rejects password shorter than 8 chars', () => {
    expect(loginSchema.safeParse({ usernameOrEmail: 'user', password: 'abc' }).success).toBe(false)
  })
})

describe('candidateRegisterSchema', () => {
  const valid = {
    email: 'john@example.com',
    password: 'Password1',
    confirmPassword: 'Password1',
    fullName: 'John Doe',
    phoneNumber: '+84901234567',
  }

  it('accepts valid registration data', () => {
    expect(candidateRegisterSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects mismatched passwords', () => {
    expect(candidateRegisterSchema.safeParse({ ...valid, confirmPassword: 'Different1' }).success).toBe(false)
  })

  it('rejects password without uppercase', () => {
    expect(candidateRegisterSchema.safeParse({ ...valid, password: 'password1', confirmPassword: 'password1' }).success).toBe(false)
  })

  it('rejects password without digit', () => {
    expect(candidateRegisterSchema.safeParse({ ...valid, password: 'Password!', confirmPassword: 'Password!' }).success).toBe(false)
  })

  it('rejects fullName shorter than 3 chars', () => {
    expect(candidateRegisterSchema.safeParse({ ...valid, fullName: 'Jo' }).success).toBe(false)
  })

  it('rejects invalid email', () => {
    expect(candidateRegisterSchema.safeParse({ ...valid, email: 'not-an-email' }).success).toBe(false)
  })
})

describe('resetPasswordSchema', () => {
  it('accepts matching passwords', () => {
    expect(resetPasswordSchema.safeParse({ newPassword: 'NewPass1', confirmPassword: 'NewPass1' }).success).toBe(true)
  })

  it('rejects mismatched passwords', () => {
    expect(resetPasswordSchema.safeParse({ newPassword: 'NewPass1', confirmPassword: 'Other1' }).success).toBe(false)
  })

  it('rejects password without uppercase', () => {
    expect(resetPasswordSchema.safeParse({ newPassword: 'newpass1', confirmPassword: 'newpass1' }).success).toBe(false)
  })
})

describe('forgotPasswordSchema', () => {
  it('accepts valid email', () => {
    expect(forgotPasswordSchema.safeParse({ email: 'user@example.com' }).success).toBe(true)
  })

  it('rejects invalid email', () => {
    expect(forgotPasswordSchema.safeParse({ email: 'not-valid' }).success).toBe(false)
  })
})
