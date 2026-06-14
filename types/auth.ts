// API request types
export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  role: "CANDIDATE" | "HR" | "HR_MANAGER" | "EMPLOYER";
  fullName: string;
  phoneNumber: string;
  hrProfile?: {
    department: string;
    hrManagerEmail?: string; // required for HR role, omitted for HR_MANAGER
    address: string;
  };
  company?: {
    name: string;
    logoUrl?: string;
    websiteUrl?: string;
    description?: string;
    address: string;
    size?: string;
    companyNo?: string; // company registration / tax number
  };
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  resetToken: string;
  newPassword: string;
  confirmPassword: string;
}

// API response types
export interface LoginResponse {
  status: number;
  message: string;
  data: {
    accessToken: string;
    expiryInMs: number;
    username: string;
    roles: string[];
    companyId?: string | null;
  };
  timestamp?: string;
  source?: string;
  tokenType?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}

export interface VerifyResetOtpResponse {
  resetToken: string;
  expiresIn: number;
}

export interface UserInfo {
  username: string;
  email: string;
  roles: string[];
}

// Client-side session types
export type UserRole =
  | "ROLE_CANDIDATE"
  | "ROLE_HR"
  | "ROLE_HR_MANAGER"
  | "ROLE_ADMIN";

export interface UserSession {
  username: string;
  email?: string;
  fullName?: string;
  companyId?: string | null; // populated for HR / HR_MANAGER roles
  roles: UserRole[];
  expiresAt: number; // unix ms
}

export interface AuthState {
  user: UserSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface OAuthAuthorizeResponse {
  status: number;
  message: string;
  data: {
    authorizationUrl: string;
    state: string;
    provider: string;
    expiresIn: number;
  };
}
