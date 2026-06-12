import type { Metadata } from 'next'
import { Space_Grotesk } from 'next/font/google'
import './globals.css'
import SWRProvider from '@/components/SWRProvider'
import AuthProvider from '@/components/AuthProvider'

// Modern geometric font for the brand wordmark
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], weight: ['500', '700'], variable: '--font-brand' })

export const metadata: Metadata = {
  title: 'MPX-ONE Governance',
  description: 'Enterprise Governance Platform',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={spaceGrotesk.variable}>
      <body>
        <AuthProvider><SWRProvider>{children}</SWRProvider></AuthProvider>
      </body>
    </html>
  )
}
