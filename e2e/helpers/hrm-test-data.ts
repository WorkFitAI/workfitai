export const HRM_KEYS = [
  'hrm1',
  'hrm2',
  'hrm3',
  'hrm4',
  'hrm5',
  'hrm6',
  'hrm7',
  'hrm8',
  'hrm9',
  'hrm10',
] as const

export type HrmKey = (typeof HRM_KEYS)[number]

export interface TestJobEntry {
  jobId: string
  jobTitle: string
  hrmKey: HrmKey
  createdBy?: string
  fixtureIndex?: number | null
  createdAt: string
}

export interface TestJobsDocument {
  source?: string
  jobs: TestJobEntry[]
}

export interface ApplicationDefinition {
  candidateNum: number
  jobRef: { hrmKey: HrmKey; index: number }
  cvFile?: string
  coverLetter: string
}

export interface PlannedApplication {
  candidateNum: number
  job: TestJobEntry
  cvFile?: string
  coverLetter: string
}

export function isHrmKey(value: string): value is HrmKey {
  return (HRM_KEYS as readonly string[]).includes(value)
}

export function hrmKeyFromUsername(username: string): HrmKey | null {
  const match = /^hrmanager(10|[1-9])$/i.exec(username.trim())
  if (!match) return null

  const hrmKey = `hrm${match[1]}`
  return isHrmKey(hrmKey) ? hrmKey : null
}

export function readHrmCredentials(
  hrmKey: HrmKey,
  env: NodeJS.ProcessEnv = process.env,
): { email: string; password: string } | null {
  const managerNumber = hrmKey.slice(3)
  const email = env[`TEST_HRMANAGER${managerNumber}_EMAIL`]
  const password = env[`TEST_HRMANAGER${managerNumber}_PASSWORD`]
  return email && password ? { email, password } : null
}

export function validateTestJobsDocument(document: TestJobsDocument): void {
  if (!Array.isArray(document.jobs) || !document.jobs.length) {
    throw new Error('test-jobs.json does not contain any jobs')
  }

  const jobIds = new Set<string>()
  const representedManagers = new Set<HrmKey>()
  for (const job of document.jobs) {
    if (!job.jobId || !job.jobTitle || !isHrmKey(job.hrmKey)) {
      throw new Error('test-jobs.json contains an invalid job record')
    }
    if (jobIds.has(job.jobId)) {
      throw new Error(`test-jobs.json contains duplicate jobId ${job.jobId}`)
    }
    jobIds.add(job.jobId)
    representedManagers.add(job.hrmKey)

    if (document.source === 'job_db_public_jobs.csv') {
      const creatorHrmKey = job.createdBy ? hrmKeyFromUsername(job.createdBy) : null
      if (creatorHrmKey !== job.hrmKey) {
        throw new Error(`Job ${job.jobId} has mismatched createdBy and hrmKey`)
      }
    }
  }

  if (document.source === 'job_db_public_jobs.csv') {
    const missingManagers = HRM_KEYS.filter((hrmKey) => !representedManagers.has(hrmKey))
    if (missingManagers.length) {
      throw new Error(`CSV job snapshot is missing managers: ${missingManagers.join(', ')}`)
    }
  }
}

export function buildApplicationPlan(
  jobs: TestJobEntry[],
  definitions: ApplicationDefinition[],
): PlannedApplication[] {
  const candidateNumbers = [...new Set(definitions.map((definition) => definition.candidateNum))].sort(
    (left, right) => left - right,
  )
  const definitionByRef = new Map(
    definitions.map((definition) => [
      `${definition.candidateNum}:${definition.jobRef.hrmKey}:${definition.jobRef.index}`,
      definition,
    ]),
  )

  return jobs.flatMap((job) =>
    candidateNumbers.map((candidateNum) => {
      const definition =
        job.fixtureIndex == null
          ? undefined
          : definitionByRef.get(`${candidateNum}:${job.hrmKey}:${job.fixtureIndex}`)

      return {
        candidateNum,
        job,
        cvFile: definition?.cvFile,
        coverLetter:
          definition?.coverLetter ??
          `I am interested in the ${job.jobTitle} opportunity and would welcome the chance to contribute my skills and experience to the team.`,
      }
    }),
  )
}
