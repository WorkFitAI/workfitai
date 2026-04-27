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

// ─── Account danger-zone ──────────────────────────────────────────────────

export interface DeactivateRequest {
  password: string;
  reason?: string;
}

export interface DeleteAccountRequest {
  password: string;
  reason?: string;
}
