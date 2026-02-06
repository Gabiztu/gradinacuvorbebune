import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('ro-RO', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function formatRelativeDate(date: string | Date): string {
  const now = new Date()
  const d = new Date(date)
  const diffMs = now.getTime() - d.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Astăzi'
  if (diffDays === 1) return 'Ieri'
  if (diffDays < 7) return `Acum ${diffDays} zile`
  
  return formatDate(date)
}

export function getPlantStage(streak: number): 'seed' | 'sprout' | 'leafy' | 'tall' | 'bloom' {
  if (streak === 0) return 'seed'
  if (streak <= 2) return 'sprout'
  if (streak <= 5) return 'leafy'
  if (streak <= 9) return 'tall'
  return 'bloom'
}

export function getNextStreakMilestone(streak: number): number {
  if (streak === 0) return 1
  if (streak <= 2) return 3
  if (streak <= 5) return 6
  if (streak <= 9) return 10
  return streak + 10
}

export function getXPMilestone(xp: number): number {
  if (xp < 50) return 50
  if (xp < 100) return 100
  if (xp < 500) return 500
  if (xp < 1000) return 1000
  return Math.floor((xp + 500) / 500) * 500
}

export const KEYWORDS = [
  'mândru/mândră',
  'încredere',
  'alături de tine',
  'potențial',
  'curaj',
  'ascult',
  'îmbrățișare',
]
