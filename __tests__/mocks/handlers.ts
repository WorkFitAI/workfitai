import { http, HttpResponse } from 'msw'

const API = 'http://localhost:9085'

/** Helper — build a successful login response */
export function loginSuccess(roles: string[] = ['CANDIDATE']) {
  return HttpResponse.json({
    status: 200,
    message: 'Tokens issued',
    data: {
      accessToken: 'test-access-token',
      expiryInMs: 900_000,
      username: 'testuser',
      roles,
      companyId: null,
    },
  })
}

/** Helper — build a standard ApiResponse success */
export function apiSuccess<T>(data: T, message = 'OK') {
  return HttpResponse.json({ success: true, message, data })
}

/** Helper — build a standard ApiResponse error */
export function apiError(message: string, status: number) {
  return HttpResponse.json({ success: false, message, data: null }, { status })
}

export const handlers = [
  // ── Registration ──────────────────────────────────────────────────
  http.post(`${API}/auth/register`, () =>
    apiSuccess({ userId: 'mock-uid', status: 'PENDING_VERIFICATION', message: 'OTP sent' }, 'Registration successful')
  ),

  http.post(`${API}/auth/verify-otp`, () =>
    apiSuccess({ userId: 'mock-uid', status: 'ACTIVE', message: 'Email verified' })
  ),

  http.post(`${API}/auth/resend-otp`, () =>
    apiSuccess({ message: 'OTP resent', expiresIn: 300 })
  ),

  // ── Login ─────────────────────────────────────────────────────────
  http.post(`${API}/auth/login`, () => loginSuccess(['CANDIDATE'])),

  // ── Password reset ────────────────────────────────────────────────
  http.post(`${API}/auth/forgot-password`, () =>
    apiSuccess({ message: 'Password reset OTP sent', expiresIn: 1800 })
  ),

  http.post(`${API}/auth/verify-reset-otp`, () =>
    apiSuccess({ resetToken: 'test-reset-token', expiresIn: 1800 })
  ),

  http.post(`${API}/auth/reset-password`, () =>
    HttpResponse.json({ success: true, message: 'Password reset successfully' })
  ),

  // ── Session ───────────────────────────────────────────────────────
  http.post(`${API}/auth/logout`, () =>
    HttpResponse.json({ success: true, message: 'Logout successful' })
  ),

  http.post(`${API}/auth/refresh`, () =>
    HttpResponse.json({
      status: 200,
      data: { accessToken: 'new-token', expiryInMs: 900_000, username: 'testuser', roles: ['CANDIDATE'] },
    })
  ),
]
