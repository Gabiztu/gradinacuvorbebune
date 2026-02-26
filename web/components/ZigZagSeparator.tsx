'use client'

interface ZigZagSeparatorProps {
  className?: string
}

export default function ZigZagSeparator({ className = '' }: ZigZagSeparatorProps) {
  return (
    <div className={`relative w-full overflow-hidden ${className}`}>
      <svg 
        className="relative w-full h-[80px] md:h-[100px]" 
        viewBox="0 0 1440 100" 
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path 
          d="M0,50 
             C60,20 120,80 180,50 
             C240,20 300,80 360,50 
             C420,20 480,80 540,50 
             C600,20 660,80 720,50 
             C780,20 840,80 900,50 
             C960,20 1020,80 1080,50 
             C1140,20 1200,80 1260,50 
             C1320,20 1380,80 1440,50 
             L1440,100 
             L0,100 Z" 
          fill="#10B981"
        />
      </svg>
    </div>
  )
}
