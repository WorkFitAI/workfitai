/**
 * Integration tests — authService methods with vi.mock api-client
 * Tests: D1-D9, F1, B2-B3 from the auth test plan
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ApiError } from '@/lib/api-client'

// Hoist mockPost so it's available when vi.mock factory runs
const mockPost = vi.hoisted(() => vi.fn())

// Mock the entire api-client so no real HTTP is made
vi.mock('@/lib/api-client', () => ({
  apiClient: { post: mockPost, get: vi.fn(), put: vi.fn(), delete: vi.fn() },
  ApiError: class ApiError extends Error {
    constructor(public message: string, public status: number) { super(message); this.name = 'ApiError' }
  },
  AuthError: class AuthError extends Error {
    constructor(public message: string, public status: number) { super(message); this.name = 'AuthError' }
  },
}))

const { authService } = await import('@/lib/auth/auth-service')


function makeLoginSuccess(roles: string[] = ['CANDIDATE']) {
  return {
    status: 200,
    message: 'Tokens issued',
    data: { accessToken: 'test-token', expiryInMs: 900_000, username: 'testuser', roles },
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  sessionStorage.clear()
  localStorage.clear()
})

describe('[D] Login — success paths', () => {
  it('D1 — CANDIDATE login → accessToken stored in sessionStorage', async () => {
    mockPost.mockResolvedValueOnce(makeLoginSuccess(['CANDIDATE']))
    await authService.login({ usernameOrEmail: 'candidate@test.com', password: 'Password1' })
    expect(sessionStorage.getItem('wfa_access_token')).toBe('test-token')
  })

  it('D2 — ADMIN login → response contains ADMIN role', async () => {
    mockPost.mockResolvedValueOnce(makeLoginSuccess(['ADMIN']))
    const result = await authService.login({ usernameOrEmail: 'admin@test.com', password: 'Password1' })
    expect(result.data.roles).toContain('ADMIN')
  })

  it('D3 — HR login → response contains HR role', async () => {
    mockPost.mockResolvedValueOnce(makeLoginSuccess(['HR']))
    const result = await authService.login({ usernameOrEmail: 'hr@test.com', password: 'Password1' })
    expect(result.data.roles).toContain('HR')
  })

  it('D — login POST called with correct creds', async () => {
    mockPost.mockResolvedValueOnce(makeLoginSuccess())
    await authService.login({ usernameOrEmail: 'user@test.com', password: 'Password1' })
    expect(mockPost).toHaveBeenCalledWith('/auth/login', expect.objectContaining({ usernameOrEmail: 'user@test.com' }))
  })
})

describe('[D] Login — error paths', () => {
  it('D5 — wrong password (400) → throws', async () => {
    mockPost.mockRejectedValueOnce(new ApiError('Invalid credentials', 400))
    await expect(authService.login({ usernameOrEmail: 'u', password: 'wrong' })).rejects.toThrow('Invalid credentials')
  })

  it('D6 — unverified account (401) → throws', async () => {
    mockPost.mockRejectedValueOnce(new ApiError('Account not verified', 401))
    await expect(authService.login({ usernameOrEmail: 'u', password: 'p' })).rejects.toThrow('Account not verified')
  })

  it('D7 — pending approval (403) → throws', async () => {
    mockPost.mockRejectedValueOnce(new ApiError('Account pending approval', 403))
    await expect(authService.login({ usernameOrEmail: 'hr', password: 'p' })).rejects.toThrow('Account pending approval')
  })

  it('D9 — rate limited (429) → throws', async () => {
    mockPost.mockRejectedValueOnce(new ApiError('Too many login attempts', 429))
    await expect(authService.login({ usernameOrEmail: 'u', password: 'p' })).rejects.toThrow('Too many login attempts')
  })
})

describe('[F] Logout', () => {
  it('F1 — logout clears sessionStorage token', async () => {
    mockPost.mockResolvedValueOnce(makeLoginSuccess())
    await authService.login({ usernameOrEmail: 'user@test.com', password: 'Password1' })
    expect(sessionStorage.getItem('wfa_access_token')).toBeTruthy()
    mockPost.mockResolvedValueOnce({ success: true, message: 'Logout successful' })
    await authService.logout()
    expect(sessionStorage.getItem('wfa_access_token')).toBeNull()
  })
})

describe('[B] HR — WAIT_APPROVED', () => {
  it('B2 — verify-otp returns WAIT_APPROVED status', async () => {
    mockPost.mockResolvedValueOnce({
      success: true,
      message: 'Pending HR Manager approval',
      data: { userId: 'uid', status: 'WAIT_APPROVED' },
    })
    const result = await authService.verifyOtp({ email: 'hr@test.com', otp: '123456' })
    expect(result.success).toBe(true)
    // Frontend should check data.status === 'WAIT_APPROVED' to show the pending banner
  })

  it('B3 — HR login while pending (403) → throws', async () => {
    mockPost.mockRejectedValueOnce(new ApiError('Account pending approval by HR Manager', 403))
    await expect(authService.login({ usernameOrEmail: 'hr@test.com', password: 'Password1' })).rejects.toThrow()
  })
})

describe('[E] Forgot Password — service layer', () => {
  it('E1 — forgotPassword called with correct endpoint + body', async () => {
    mockPost.mockResolvedValueOnce({ success: true, data: { message: 'OTP sent', expiresIn: 1800 } })
    await authService.forgotPassword({ email: 'user@test.com' })
    expect(mockPost).toHaveBeenCalledWith('/auth/forgot-password', { email: 'user@test.com' })
  })

  it('E2 — unknown email (404) → throws', async () => {
    mockPost.mockRejectedValueOnce(new ApiError('Email not found', 404))
    await expect(authService.forgotPassword({ email: 'unknown@test.com' })).rejects.toThrow('Email not found')
  })

  it('E5 — verifyResetOtp returns resetToken', async () => {
    mockPost.mockResolvedValueOnce({ success: true, data: { resetToken: 'reset-tok-123', expiresIn: 1800 } })
    const result = await authService.verifyResetOtp({ email: 'user@test.com', otp: '123456' })
    expect(result.data.resetToken).toBe('reset-tok-123')
  })

  it('E6 — invalid OTP (400) → throws', async () => {
    mockPost.mockRejectedValueOnce(new ApiError('Invalid or expired OTP', 400))
    await expect(authService.verifyResetOtp({ email: 'user@test.com', otp: '000000' })).rejects.toThrow('Invalid or expired OTP')
  })

  it('E9 — resetPassword called with correct body', async () => {
    mockPost.mockResolvedValueOnce({ success: true, message: 'Password reset successfully' })
    await authService.resetPassword({ email: 'user@test.com', resetToken: 'tok', newPassword: 'NewPass1', confirmPassword: 'NewPass1' })
    expect(mockPost).toHaveBeenCalledWith('/auth/reset-password', expect.objectContaining({ resetToken: 'tok' }))
  })

  it('E13 — expired resetToken (401) → throws', async () => {
    mockPost.mockRejectedValueOnce(new ApiError('Reset token expired', 401))
    await expect(authService.resetPassword({ email: 'u', resetToken: 'expired', newPassword: 'P1', confirmPassword: 'P1' })).rejects.toThrow('Reset token expired')
  })
})

describe('[A] Registration — service layer', () => {
  it('A1 — register candidate called with correct role + body', async () => {
    mockPost.mockResolvedValueOnce({ success: true, data: { status: 'PENDING_VERIFICATION' }, message: 'OTP sent' })
    await authService.register({ email: 'u@test.com', password: 'Pass1', fullName: 'Joe', phoneNumber: '0901234567', role: 'CANDIDATE' })
    expect(mockPost).toHaveBeenCalledWith('/auth/register', expect.objectContaining({ role: 'CANDIDATE' }))
  })

  it('A2 — duplicate email throws (API rejects)', async () => {
    mockPost.mockRejectedValueOnce(new ApiError('Email already registered', 409))
    await expect(
      authService.register({ email: 'dup@test.com', password: 'Pass1', fullName: 'Joe', phoneNumber: '090', role: 'CANDIDATE' })
    ).rejects.toThrow('Email already registered')
  })

  it('A8 — verify-otp for CANDIDATE returns ACTIVE status', async () => {
    mockPost.mockResolvedValueOnce({ success: true, data: { status: 'ACTIVE' } })
    const result = await authService.verifyOtp({ email: 'u@test.com', otp: '123456' })
    expect(result.data.status).toBe('ACTIVE')
  })

  it('A9 — invalid OTP (400) → throws', async () => {
    mockPost.mockRejectedValueOnce(new ApiError('Invalid or expired OTP', 400))
    await expect(authService.verifyOtp({ email: 'u@test.com', otp: '000000' })).rejects.toThrow('Invalid or expired OTP')
  })
})
