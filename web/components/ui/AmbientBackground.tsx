'use client'

export function AmbientBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      <div className="ambient-orb ambient-orb-orange w-2/3 h-2/3 top-[-10%] left-[-10%]" />
      <div className="ambient-orb ambient-orb-green w-2/3 h-2/3 bottom-[-10%] right-[-10%]" style={{ animationDelay: '2s' }} />
      <div className="ambient-orb ambient-orb-rose w-1/3 h-1/3 top-[20%] right-[20%]" style={{ animationDelay: '4s' }} />
    </div>
  )
}
