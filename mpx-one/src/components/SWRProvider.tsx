'use client'
import { SWRConfig } from 'swr'

// Global SWR config — always fetch fresh from server, never serve stale cache
const noStoreFetcher = (url: string) =>
  fetch(url, { cache: 'no-store', headers: { 'Cache-Control': 'no-cache' } }).then(r => r.json())

export default function SWRProvider({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        fetcher: noStoreFetcher,
        revalidateOnFocus: true,
        revalidateOnReconnect: true,
        revalidateIfStale: true,
        dedupingInterval: 0,      // no dedupe window — every call hits server
        provider: () => new Map(), // fresh cache map per session, no persistence
      }}
    >
      {children}
    </SWRConfig>
  )
}
