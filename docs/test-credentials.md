# Test Credentials

These accounts are pre-seeded for automated and manual testing. **Do not use in production.**

## Base URLs

| Service | URL |
|---------|-----|
| Frontend | `http://localhost:3000` |
| Backend API | `http://localhost:9085` |

---

## Accounts

### Admin

| Field | Value |
|-------|-------|
| Email | `admin@workfitai.com` |
| Password | `admin123` |
| Role | `ROLE_ADMIN` |
| Playwright auth file | `e2e/.auth/admin.json` |

**Capabilities**: Approve/reject HR Manager registrations, manage all users, access `/users`, full job and application management.

---

### HR Managers

| Account | Email | Password | Playwright Auth File |
|---------|-------|----------|----------------------|
| HR Manager 1 | `hrmanager1@gmail.com` | `Password@123` | `e2e/.auth/hrmanager1.json` |
| HR Manager 2 | `hrmanager2@gmail.com` | `password@123` | `e2e/.auth/hrmanager2.json` |

**Capabilities**: Create/publish/close job posts, review all company applications, update application status, assign applications to HR users, approve/reject HR registrations (`/hr-management`), add/edit/delete notes.

---

### HR Users

| Account | Email | Password | Playwright Auth File | HR Manager |
|---------|-------|----------|----------------------|------------|
| HR 1 | `hrtest1@gmail.com` | `password@123` | `e2e/.auth/hr1.json` | `hrmanager1` |
| HR 2 | `hrtest2@gmail.com` | `password@123` | `e2e/.auth/hr2.json` | `hrmanager1` |
| HR 3 | `hrtest3@gmail.com` | `password@123` | `e2e/.auth/hr3.json` | `hrmanager1` |
| HR 4 | `hrtest4@gmail.com` | `password@123` | `e2e/.auth/hr4.json` | `hrmanager2` |
| HR 5 | `hrtest5@gmail.com` | `password@123` | `e2e/.auth/hr5.json` | `hrmanager2` |
| HR 6 | `hrtest6@gmail.com` | `password@123` | `e2e/.auth/hr6.json` | `hrmanager2` |

**Capabilities**: View applications assigned to them (`/applications/my`), add/edit/delete notes on assigned applications. Cannot change application status or assign applications.

---

### Candidates

| Account | Email | Password | Playwright Auth File |
|---------|-------|----------|----------------------|
| Candidate 1 | `candidate1@gmail.com` | `password@123` | `e2e/.auth/candidate1.json` |
| Candidate 2 | `candidate2@gmail.com` | `password@123` | `e2e/.auth/candidate2.json` |
| Candidate 3 | `candidate3@gmail.com` | `password@123` | `e2e/.auth/candidate3.json` |
| Candidate 4 | `candidate4@gmail.com` | `password@123` | `e2e/.auth/candidate4.json` |
| Candidate 5 | `candidate5@gmail.com` | `password@123` | `e2e/.auth/candidate5.json` |
| Candidate 6 | `candidate6@gmail.com` | `password@123` | `e2e/.auth/candidate6.json` |
| Candidate 7 | `candidate7@gmail.com` | `password@123` | `e2e/.auth/candidate7.json` |
| Candidate 8 | `candidate8@gmail.com` | `password@123` | `e2e/.auth/candidate8.json` |
| Candidate 9 | `candidate9@gmail.com` | `password@123` | `e2e/.auth/candidate9.json` |
| Candidate 10 | `candidate10@gmail.com` | `password@123` | `e2e/.auth/candidate10.json` |

**Capabilities**: Browse published job listings, apply for jobs (CV upload + cover letter), view own applications (`/applied-jobs`), withdraw pending applications.

---

## Recommended E2E Test Flow

The E2E tests depend on each other in this order:

```
1. hrmanager1-setup      → Log in HRM1, save storageState
2. hr1-setup             → Log in HR1, save storageState
3. candidate1-setup      → Log in Candidate1, save storageState
4. admin-setup           → Log in Admin, save storageState
5. hrm-job-data-setup    → HRM1 creates + publishes test job → saves to e2e/.data/test-job.json
                           (depends on hrmanager1-setup)

6. e2e-hrm specs         → HRM1 manages jobs + applications (storageState: hrmanager1.json)
7. e2e-hr specs          → HR1 reviews assigned applications (storageState: hr1.json)
8. e2e-candidate specs   → Candidate1 applies, views, withdraws (storageState: candidate1.json)
9. e2e-admin specs       → Admin manages user approvals (storageState: admin.json)
```

---

## Role Capabilities Matrix

| Feature | ADMIN | HR_MANAGER | HR | CANDIDATE |
|---------|-------|------------|----|-----------|
| Create / publish jobs | ✓ | ✓ | — | — |
| View all company applications | ✓ | ✓ | — | — |
| View assigned applications | — | ✓ | ✓ | — |
| Update application status | ✓ | ✓ | — | — |
| Assign application to HR | ✓ | ✓ | — | — |
| Add / edit / delete notes | ✓ | ✓ | ✓ | — |
| Approve/reject HR users | ✓ | ✓ | — | — |
| Approve/reject HRM users | ✓ | — | — | — |
| Apply for jobs | — | — | — | ✓ |
| View own applications | — | — | — | ✓ |
| Withdraw application | — | — | — | ✓ |

---

## Notes for Test Agents

- **Always use the exact emails and passwords listed above** — they are seeded in the test database.
- For E2E tests requiring a published job: read `e2e/.data/test-job.json` (written by `hrm-job-data-setup`).
- Auth storage state files are in `e2e/.auth/` (gitignored — generated at test runtime).
- Company ID for HR Manager 1 is available via `authUser.companyId` after login; the company number (`companyNo`) is used in API calls.
- MSW handlers for unit/integration tests are in `__tests__/mocks/handlers.ts`.
- Fixture factories are in `__tests__/mocks/handlers.ts` and `__tests__/mocks/applications.ts`.
