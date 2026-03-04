import { describe, it, expect } from 'vitest'
import { configureStore } from '@reduxjs/toolkit'
import authReducer, { setCredentials, clearCredentials } from '@/store/auth-slice'
import type { UserSession } from '@/types/auth'

function makeStore() {
  return configureStore({ reducer: { auth: authReducer } })
}

const mockSession: UserSession = {
  username: 'admin',
  roles: ['ROLE_ADMIN'] as UserSession['roles'],
  expiresAt: Date.now() + 3_600_000,
}

describe('auth-slice', () => {
  it('initial state is unauthenticated', () => {
    const store = makeStore()
    const state = store.getState().auth
    expect(state.user).toBeNull()
    expect(state.isAuthenticated).toBe(false)
  })

  it('setCredentials populates user and sets isAuthenticated true', () => {
    const store = makeStore()
    store.dispatch(setCredentials(mockSession))
    const state = store.getState().auth
    expect(state.user).toEqual(mockSession)
    expect(state.isAuthenticated).toBe(true)
  })

  it('setCredentials stores username correctly', () => {
    const store = makeStore()
    store.dispatch(setCredentials(mockSession))
    expect(store.getState().auth.user?.username).toBe('admin')
  })

  it('setCredentials stores roles correctly', () => {
    const store = makeStore()
    store.dispatch(setCredentials(mockSession))
    expect(store.getState().auth.user?.roles).toContain('ROLE_ADMIN')
  })

  it('clearCredentials resets state to unauthenticated', () => {
    const store = makeStore()
    store.dispatch(setCredentials(mockSession))
    store.dispatch(clearCredentials())
    const state = store.getState().auth
    expect(state.user).toBeNull()
    expect(state.isAuthenticated).toBe(false)
  })

  it('state is stable across multiple setCredentials calls', () => {
    const store = makeStore()
    store.dispatch(setCredentials(mockSession))
    const updated: UserSession = { ...mockSession, username: 'newuser' }
    store.dispatch(setCredentials(updated))
    expect(store.getState().auth.user?.username).toBe('newuser')
  })
})
