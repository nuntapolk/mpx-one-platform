import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MPX-ONE Governance',
  description: 'Enterprise Governance Platform',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  )
}
