'use client'

interface IOSNotificationProps {
  appName?: string
  time?: string
  senderName?: string
  message?: string
}

export default function IOSNotification({
  appName = 'MESAJE',
  time = 'acum',
  senderName = 'Mama',
  message = 'Hai să vorbim deschis. Îmi pasă de tine și vreau să te ascult.'
}: IOSNotificationProps) {
  return (
    <div 
      className="max-w-sm mx-auto rounded-[24px] border border-white/50 shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:shadow-[0_8px_40px_rgba(0,0,0,0.25)] transition-all duration-300 hover:scale-[1.02] cursor-pointer"
      style={{
        background: 'rgba(250, 250, 250, 0.85)',
        backdropFilter: 'blur(25px) saturate(150%)',
        WebkitBackdropFilter: 'blur(25px) saturate(150%)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-black/[0.05]">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-[#34C759] rounded-lg flex items-center justify-center">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" fill="white"/>
            </svg>
          </div>
          <span className="text-[11px] text-black/50 font-semibold tracking-wider">
            {appName}
          </span>
        </div>
        <span className="text-[11px] text-black/40 font-normal">
          {time}
        </span>
      </div>

      {/* Content */}
      <div className="px-4 pt-2 pb-4">
        <p className="text-[15px] text-black font-semibold leading-tight tracking-tight">
          {senderName}
        </p>
        <p className="text-[15px] text-black/70 font-normal leading-snug line-clamp-2">
          {message}
        </p>
      </div>
    </div>
  )
}
