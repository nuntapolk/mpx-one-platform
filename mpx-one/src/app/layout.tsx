import type { Metadata } from 'next'
import './globals.css'
import SWRProvider from '@/components/SWRProvider'

export const metadata: Metadata = {
  title: 'MPX-ONE Governance',
  description: 'Enterprise Governance Platform',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body>
        <SWRProvider>{children}</SWRProvider>
      </body>
    </html>
  )
}
