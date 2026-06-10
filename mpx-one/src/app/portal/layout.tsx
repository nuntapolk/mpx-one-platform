export const metadata = { title: 'PDPA Portal' }

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full" style={{ background: 'linear-gradient(135deg,#f0fdf4 0%,#eff6ff 100%)' }}>
      {children}
    </div>
  )
}
