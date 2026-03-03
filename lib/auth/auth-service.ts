// Auth API service — all authentication-related API calls
import { apiClient } from '@/lib/api-client'
import { setAccessToken, clearAccessToken } from '@/lib/auth/token-store'
import { setSessionCookie, clearSessionCookie } from '@/lib/auth/session-cookie'
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  ApiResponse,
  VerifyOtpRequest,
  ForgotPasswordRequest,
  VerifyResetOtpResponse,
  ResetPasswordRequest,
  UserInfo,
  UserSession,
} from '@/types/auth'

const BROADCAST_CHANNEL = 'wfa-auth-channel'

/** Broadcasts a logout event to all tabs */
function broadcastLogout(): void {
  if (typeof window === 'undefined') return
  try {
    const channel = new BroadcastChannel(BROADCAST_CHANNEL)
    channel.postMessage({ type: 'logout' })
    channel.close()
  } catch {
    // BroadcastChannel not supported in some environments
  }
}

/** Normalize backend roles to ROLE_<NAME> format expected by middleware */
function normalizeRoles(roles: string[]): UserSession['roles'] {
  return roles.map((r) =>
    r.startsWith('ROLE_') ? r : (`ROLE_${r}` as UserSession['roles'][number])
  ) as UserSession['roles']
}

export const authService = {
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/login', data)
    if (response.data?.accessToken) {
      console.log('Login success')
      const { accessToken, expiryInMs, username, roles } = response.data
      setAccessToken(accessToken, expiryInMs)
      const session: UserSession = {
        username,
        roles: normalizeRoles(roles),
        expiresAt: Date.now() + expiryInMs,
      }
      setSessionCookie(session)
    }
    return response
  },

  async register(data: RegisterRequest): Promise<ApiResponse> {
    return apiClient.post<ApiResponse>('/auth/register', data)
  },

  async verifyOtp(data: VerifyOtpRequest): Promise<ApiResponse> {
    return apiClient.post<ApiResponse>('/auth/verify-otp', data)
  },

  async resendOtp(email: string): Promise<ApiResponse> {
    return apiClient.post<ApiResponse>('/auth/resend-otp', { email })
  },

  async refresh(): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/refresh')
    if (response.data?.accessToken) {
      const { accessToken, expiryInMs, username, roles } = response.data
      setAccessToken(accessToken, expiryInMs)
      const session: UserSession = {
        username,
        roles: normalizeRoles(roles),
        expiresAt: Date.now() + expiryInMs,
      }
      setSessionCookie(session)
    }
    return response
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post<ApiResponse>('/auth/logout')
    } finally {
      clearAccessToken()
      clearSessionCookie()
      broadcastLogout()
    }
  },

  async forgotPassword(data: ForgotPasswordRequest): Promise<ApiResponse> {
    return apiClient.post<ApiResponse>('/auth/forgot-password', data)
  },

  async verifyResetOtp(data: VerifyOtpRequest): Promise<ApiResponse<VerifyResetOtpResponse>> {
    return apiClient.post<ApiResponse<VerifyResetOtpResponse>>('/auth/verify-reset-otp', data)
  },

  async resetPassword(data: ResetPasswordRequest): Promise<ApiResponse> {
    return apiClient.post<ApiResponse>('/auth/reset-password', data)
  },

  async getCurrentUser(): Promise<ApiResponse<UserInfo>> {
    return apiClient.get<ApiResponse<UserInfo>>('/auth/me')
  },
}
