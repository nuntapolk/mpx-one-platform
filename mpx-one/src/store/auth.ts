import { create } from 'zustand'

export interface SessionUser {
  name?: string
  email?: string
  roles: string[]
}

interface AuthState {
  ready: boolean
  authEnabled: boolean
  authenticated: boolean
  user: SessionUser | null
  setSession: (s: { authEnabled: boolean; authenticated: boolean; user: SessionUser | null }) => void
}

// Tokens are NOT stored client-side (httpOnly cookie BFF). This only mirrors session state for UI.
export const useAuthStore = create<AuthState>()((set) => ({
  ready: false,
  authEnabled: false,
  authenticated: false,
  user: null,
  setSession: (s) => set({ ...s, ready: true }),
}))
