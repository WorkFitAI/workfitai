// ─── Profile ───────────────────────────────────────────────────────────────

export interface CandidateProfile {
  userId: string;
  username: string;
  fullName: string;
  email: string;
  phoneNumber?: string | null;
  userRole: "CANDIDATE" | "HR" | "HR_MANAGER" | "ADMIN";
  userStatus: "ACTIVE" | "INACTIVE" | "BLOCKED" | "DEACTIVATED";
  companyId?: string | null;
  companyName?: string | null;
  companyNo?: string | null;
  department?: string | null;
  address?: string | null;
  createdBy?: string | null;
  createdDate?: string | null;
  lastModifiedBy?: string | null;
  lastModifiedDate?: string | null;
  // Candidate-specific career fields
  careerObjective?: string | null;
  summary?: string | null;
  totalExperience?: number;
  education?: string | null;
  certifications?: string | null;
  portfolioLink?: string | null;
  linkedinUrl?: string | null;
  githubUrl?: string | null;
  expectedPosition?: string | null;
  cvIds?: string[];
  skills?: string[];
  deleted?: boolean;
  // Avatar (fetched separately)
  avatarUrl?: string | null;
}

export interface UpdateCandidateProfileRequest {
  fullName?: string;
  phoneNumber?: string;
  address?: string;
  careerObjective?: string;
  summary?: string;
  totalExperience?: number;
  education?: string;
  certifications?: string;
  portfolioLink?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  expectedPosition?: string;
  skills?: string[];
}

// ─── Notification & Privacy settings ──────────────────────────────────────

export interface NotificationSettings {
  emailNotifications: boolean;
  applicationUpdates: boolean;
  jobRecommendations: boolean;
  marketingEmails: boolean;
  weeklyDigest: boolean;
  updatedAt?: string;
}

export interface PrivacySettings {
  profileVisibility: "PUBLIC" | "PRIVATE" | "FRIENDS_ONLY";
  showEmail: boolean;
  showPhoneNumber: boolean;
  searchEngineIndexed: boolean;
  allowMessages: boolean;
  updatedAt?: string;
}

// ─── Avatar ────────────────────────────────────────────────────────────────

export interface AvatarData {
  avatarUrl: string;
  publicId: string;
  uploadedAt: string;
  message?: string | null;
}

/** @deprecated Use AvatarData */
export interface AvatarUploadResponse extends AvatarData {}

// ─── Sessions ─────────────────────────────────────────────────────────────

export interface SessionLocation {
  country?: string;
  city?: string;
  region?: string;
}

export interface UserSessionInfo {
  sessionId: string;
  deviceId: string;
  deviceName: string;
  ipAddress: string;
  location?: SessionLocation;
  createdAt: string;
  lastActivityAt: string;
  expiresAt: string;
  current: boolean;
}

// ─── Security / Auth ──────────────────────────────────────────────────────

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface EnableTwoFactorRequest {
  method: "EMAIL";
}

export interface DisableTwoFactorRequest {
  password: string;
  code: string;
}

// ─── Unified Profile Settings (GET /user/profile/settings) ─────────────────

export interface UserEmailNotifications {
  jobAlerts: boolean;
  applicationUpdates: boolean;
  messages: boolean;
  newsletter: boolean;
  marketingEmails: boolean;
  securityAlerts: boolean;
}

export interface UserPushNotifications {
  jobAlerts: boolean;
  applicationUpdates: boolean;
  messages: boolean;
  reminders: boolean;
}

export interface UserNotifications {
  email: UserEmailNotifications;
  push: UserPushNotifications;
}

export interface UserPrivacySettings {
  profileVisibility: "PUBLIC" | "PRIVATE" | "RECRUITERS_ONLY";
  showEmail: boolean;
  showPhone: boolean;
  showLocation: boolean;
  allowMessaging: boolean;
  showActivityStatus: boolean;
  showOnlineStatus: boolean;
  searchIndexing: boolean;
  aiJobRecommendationEnabled: boolean;
}

export interface HrNotificationSettings {
  notifyOnNewApplication: boolean;
  notifyOnJobExpiry: boolean;
}

export interface FeatureSetting {
  featureKey: string;
  enabled: boolean;
  updatedAt: string;
  updatedBy: string;
}

export interface UserProfileSettings {
  role: "CANDIDATE" | "HR_MANAGER" | "ADMIN";
  notifications: UserNotifications;
  privacy: UserPrivacySettings;
  hrNotifications: HrNotificationSettings | null;
  features: FeatureSetting[] | null;
}

export interface UpdateProfileSettingsRequest {
  notifications?: {
    email?: Partial<UserEmailNotifications>;
    push?: Partial<UserPushNotifications>;
  };
  privacy?: UserPrivacySettings;
  hrNotifications?: HrNotificationSettings;
  features?: { featureKey: string; enabled: boolean }[];
}

// ─── Account danger-zone ──────────────────────────────────────────────────

export interface DeactivateRequest {
  password: string;
  reason?: string;
}

export interface DeleteAccountRequest {
  password: string;
  reason?: string;
}
