import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { UserSession } from '@/types/auth'

interface AuthState {
  user: UserSession | null
  isAuthenticated: boolean
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
}

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /** Called after a successful login or session restore */
    setCredentials(state, action: PayloadAction<UserSession>) {
      state.user = action.payload
      state.isAuthenticated = true
    },
    /** Called on logout or session expiry */
    clearCredentials(state) {
      state.user = null
      state.isAuthenticated = false
    },
  },
})

export const { setCredentials, clearCredentials } = authSlice.actions
export default authSlice.reducer
