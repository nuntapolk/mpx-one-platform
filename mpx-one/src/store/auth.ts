import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthUser, Organization } from '@/types'

interface AuthState {
  token: string | null
  user: AuthUser | null
  org: Organization | null
  setAuth: (token: string, user: AuthUser) => void
  setOrg: (org: Organization) => void
  logout: () => void
  isAuthenticated: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user:  null,
      org:   null,

      setAuth: (token, user) => set({ token, user }),
      setOrg:  (org) => set({ org }),
      logout:  () => set({ token: null, user: null, org: null }),
      isAuthenticated: () => !!get().token,
    }),
    {
      name: 'mpx-auth',
      partialize: (state) => ({ token: state.token, user: state.user, org: state.org }),
    },
  ),
)
