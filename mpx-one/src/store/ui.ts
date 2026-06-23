import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UiState {
  sidebarHidden: boolean
  toggleSidebar: () => void
  setSidebar: (v: boolean) => void
}

// Persisted so the sidebar hide/show state survives navigation & reloads (EA Studio behaviour).
export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      sidebarHidden: false,
      toggleSidebar: () => set((s) => ({ sidebarHidden: !s.sidebarHidden })),
      setSidebar: (v) => set({ sidebarHidden: v }),
    }),
    { name: 'mpx-ui' },
  ),
)
