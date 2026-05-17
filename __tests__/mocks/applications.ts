/**
 * HRM/HR application fixture factories for unit and integration tests.
 * Import from here for HRM-specific test data.
 */
import type { ApplicationDetail, StatusHistoryItem } from '@/types/application'

// Re-export from handlers for convenience
export { mockHRUser, mockApplicationNote, mockCompanyApplication } from './handlers'

export function mockApplicationDetailWithNotes(overrides: Partial<ApplicationDetail> = {}): ApplicationDetail {
  return {
    id: 'app-001',
    username: 'candidate1',
    email: 'candidate1@gmail.com',
    jobId: 'job-001',
    status: 'APPLIED',
    createdAt: '2026-01-15T08:00:00Z',
    updatedAt: '2026-01-15T08:00:00Z',
    cvFileName: 'resume.pdf',
    cvContentType: 'application/pdf',
    cvFileSize: 102400,
    companyId: 'company-001',
    jobSnapshot: {
      postId: 'job-001',
      title: 'Frontend Engineer',
      shortDescription: 'Build great UIs',
      description: 'We are looking for a skilled frontend engineer.',
      employmentType: 'FULL_TIME',
      experienceLevel: 'Mid',
      educationLevel: 'Bachelor',
      requiredExperience: '2 years',
      salaryMin: 2000,
      salaryMax: 4000,
      currency: 'USD',
      location: 'Ho Chi Minh City',
      quantity: 2,
      totalApplications: 5,
      createdDate: '2026-01-01T00:00:00Z',
      lastModifiedDate: '2026-01-10T00:00:00Z',
      expiresAt: '2026-06-01T00:00:00Z',
      status: 'OPEN',
      skillNames: ['React', 'TypeScript'],
      bannerUrl: null,
      createdBy: 'hrmanager1@gmail.com',
      companyNo: 'C001',
      companyName: 'Acme Corp',
      companyDescription: 'A great company.',
      companyAddress: '123 Main St',
      companyWebsiteUrl: null,
      companyLogoUrl: null,
      companySize: 50,
      snapshotAt: '2026-01-15T08:00:00Z',
    },
    statusHistory: [
      {
        previousStatus: null,
        newStatus: 'APPLIED',
        changedBy: 'system',
        changedAt: '2026-01-15T08:00:00Z',
      },
    ],
    ...overrides,
  }
}

export function mockStatusHistorySequence(): StatusHistoryItem[] {
  return [
    { previousStatus: null, newStatus: 'APPLIED', changedBy: 'system', changedAt: '2026-01-15T08:00:00Z' },
    { previousStatus: 'APPLIED', newStatus: 'REVIEWING', changedBy: 'hrtest1', changedAt: '2026-01-16T09:00:00Z' },
  ]
}
