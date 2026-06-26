import MenuBar from '@/components/layout/MenuBar'
import StatusBar from '@/components/layout/StatusBar'
import PageTitle from '@/components/layout/PageTitle'

export default function ShellLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: 'linear-gradient(135deg, #e8edf5 0%, #f0f4fa 40%, #eef1f7 100%)' }}>
      {/* Decorative blobs for depth */}
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
        <div style={{
          position: 'absolute', top: '-10%', left: '20%',
          width: 520, height: 520, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(2,195,154,0.08) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }} />
        <div style={{
          position: 'absolute', bottom: '5%', right: '10%',
          width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(55,138,221,0.07) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }} />
        <div style={{
          position: 'absolute', top: '40%', left: '5%',
          width: 300, height: 300, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(127,119,221,0.06) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }} />
      </div>

      <MenuBar />
      <main className="flex-1 overflow-y-auto p-5 relative">
        <PageTitle />
        {children}
      </main>
      <StatusBar />
    </div>
  )
}
