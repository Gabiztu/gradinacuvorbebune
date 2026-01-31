'use client'

import { cn } from '@/lib/utils'

interface IconProps {
  icon: string
  width?: string | number
  height?: string | number
  className?: string
}

export function Icon({ icon, width = 20, height, className }: IconProps) {
  return (
    <iconify-icon
      icon={icon}
      width={width}
      height={height || width}
      class={className}
    />
  )
}
