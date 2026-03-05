/**
 * Integration tests — Candidate Registration Flow
 * Tests: A1-A10 from the auth test plan
 * Uses MSW to mock POST /auth/register and POST /auth/verify-otp
 */
import { describe, it, expect, beforeAll, afterEach, afterAll, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { server } from '../mocks/server'
import { apiError, apiSuccess } from '../mocks/handlers'
import { RegisterFormCandidate } from '@/components/auth/register-form-candidate'

// MSW lifecycle
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

// Mock toast, router already mocked in setup.ts
const mockToastSuccess = vi.fn()
const mockToastError = vi.fn()
vi.mock('sonner', () => ({ toast: { success: mockToastSuccess, error: mockToastError } }))

const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: vi.fn() }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

/** Fill and submit the register form with valid data */
async function fillAndSubmit(overrides: Record<string, string> = {}) {
  const user = userEvent.setup()
  const data = {
    fullName: 'John Doe',
    email: 'john@example.com',
    phoneNumber: '0901234567',
    password: 'Password1',
    confirmPassword: 'Password1',
    ...overrides,
  }
  await user.type(screen.getByPlaceholderText('Full name'), data.fullName)
  await user.type(screen.getByPlaceholderText('Email address'), data.email)
  await user.type(screen.getByPlaceholderText('Phone number'), data.phoneNumber)
  await user.type(screen.getByPlaceholderText('Password'), data.password)
  await user.type(screen.getByPlaceholderText('Password confirmation'), data.confirmPassword)
  // Agree to terms
  await user.click(screen.getByRole('checkbox'))
  await user.click(screen.getByRole('button', { name: /register/i }))
}

describe('[A] Candidate Registration', () => {
  it('A1 — valid form → API called → redirect to verify-otp', async () => {
    render(<RegisterFormCandidate />)
    await fillAndSubmit()
    await waitFor(() => {
      expect(mockToastSuccess).toHaveBeenCalledWith(expect.stringMatching(/created|OTP/i))
      expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('/register/verify-otp?email='))
    })
  })

  it('A2 — duplicate email (409) → error toast', async () => {
    server.use(
      http.post('http://localhost:9085/auth/register', () =>
        HttpResponse.json({ success: false, message: 'Email already registered' }, { status: 409 })
      )
    )
    render(<RegisterFormCandidate />)
    await fillAndSubmit()
    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith(expect.stringMatching(/already registered|failed/i))
    })
  })

  it('A3 — password < 8 chars → inline Zod error, no API call', async () => {
    const registerSpy = vi.fn()
    server.use(http.post('http://localhost:9085/auth/register', () => { registerSpy(); return HttpResponse.json({}) }))
    render(<RegisterFormCandidate />)
    await fillAndSubmit({ password: 'Abc1', confirmPassword: 'Abc1' })
    await waitFor(() => {
      expect(screen.getByText(/at least 8/i)).toBeInTheDocument()
      expect(registerSpy).not.toHaveBeenCalled()
    })
  })

  it('A4 — password missing uppercase → inline error', async () => {
    render(<RegisterFormCandidate />)
    await fillAndSubmit({ password: 'password1', confirmPassword: 'password1' })
    await waitFor(() => expect(screen.getByText(/uppercase/i)).toBeInTheDocument())
  })

  it('A5 — password missing digit → inline error', async () => {
    render(<RegisterFormCandidate />)
    await fillAndSubmit({ password: 'Password!', confirmPassword: 'Password!' })
    await waitFor(() => expect(screen.getByText(/digit/i)).toBeInTheDocument())
  })

  it('A6 — mismatched confirmPassword → inline error', async () => {
    render(<RegisterFormCandidate />)
    await fillAndSubmit({ confirmPassword: 'Different1' })
    await waitFor(() => expect(screen.getByText(/match/i)).toBeInTheDocument())
  })

  it('A7 — empty name field → inline error', async () => {
    render(<RegisterFormCandidate />)
    await fillAndSubmit({ fullName: '' })
    await waitFor(() => expect(screen.getByText(/3/)).toBeInTheDocument()) // "At least 3 characters"
  })

  it('A8 — submit without terms → toast error, no API call', async () => {
    const spy = vi.fn()
    server.use(http.post('http://localhost:9085/auth/register', () => { spy(); return HttpResponse.json({}) }))
    const user = userEvent.setup()
    render(<RegisterFormCandidate />)
    // Fill form but do NOT check terms
    await user.type(screen.getByPlaceholderText('Full name'), 'John Doe')
    await user.type(screen.getByPlaceholderText('Email address'), 'john@example.com')
    await user.type(screen.getByPlaceholderText('Password'), 'Password1')
    await user.type(screen.getByPlaceholderText('Password confirmation'), 'Password1')
    await user.click(screen.getByRole('button', { name: /register/i }))
    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith(expect.stringMatching(/terms/i))
      expect(spy).not.toHaveBeenCalled()
    })
  })

  it('A9 — network error → error toast', async () => {
    server.use(
      http.post('http://localhost:9085/auth/register', () => HttpResponse.error())
    )
    render(<RegisterFormCandidate />)
    await fillAndSubmit()
    await waitFor(() => expect(mockToastError).toHaveBeenCalled())
  })
})
