'use client'

import { useState, useEffect } from 'react'
import { cn, getPlantStage } from '@/lib/utils'
import { Sprout, Flower, TreeDeciduous, Leaf, Sparkles } from 'lucide-react'

interface PlantProps {
  streak: number
  totalXP?: number
  className?: string
}

export function Plant({ streak, totalXP = 0, className }: PlantProps) {
  const stage = getPlantStage(streak)
  const [isAnimating, setIsAnimating] = useState(false)
  const [prevStage, setPrevStage] = useState(stage)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (prevStage !== stage && streak > 0) {
      setIsAnimating(true)
      setTimeout(() => setIsAnimating(false), 800)
    }
    setPrevStage(stage)
  }, [stage, streak, prevStage])

  const getNextMilestone = () => {
    if (streak === 0) return 1
    if (streak <= 2) return 3
    if (streak <= 5) return 6
    if (streak <= 9) return 10
    return streak + 5
  }

  const progress = () => {
    if (streak === 0) return 0
    if (streak <= 2) return (streak / 3) * 100
    if (streak <= 5) return ((streak - 3) / 3) * 100 + 33
    if (streak <= 9) return ((streak - 6) / 4) * 100 + 66
    return Math.min(100, 90 + (streak - 10) * 2)
  }

  const stageLabels: Record<string, string> = {
    seed: 'Sămânță',
    sprout: 'Răsad',
    leafy: 'Plantă',
    tall: 'Plantă înaltă',
    bloom: 'Floare',
  }

  return (
    <div className={cn('flex flex-col items-center', className)}>
      <div
        className={cn(
          'relative p-10 bg-gradient-to-b from-green-100/80 to-white/80 backdrop-blur-xl rounded-full shadow-xl',
          'transform transition-all duration-500',
          (isAnimating || (mounted && stage !== 'seed')) && 'animate-bounce-gentle',
          isAnimating && 'scale-110'
        )}
      >
        {stage === 'seed' && (
          <div className="flex flex-col items-center animate-fade-in">
            <div className="w-20 h-5 bg-amber-700 rounded-full shadow-lg" />
            <div className="w-4 h-4 bg-amber-600 rounded-full mt-1 shadow-md" />
            <div className="flex items-center gap-2 mt-3 text-amber-600 text-sm font-medium">
              <span>{stageLabels.seed}</span>
            </div>
          </div>
        )}

        {stage === 'sprout' && (
          <div className="flex flex-col items-center animate-scale-in">
            <div className="relative">
              <Sprout className="w-20 h-20 text-green-500 animate-pulse-soft" />
              <div className="absolute -top-1 -right-2 w-3 h-3 bg-green-400 rounded-full animate-ping" />
            </div>
            <div className="flex items-center gap-2 mt-3 text-green-600 text-sm font-medium">
              <span>{stageLabels.sprout}</span>
            </div>
          </div>
        )}

        {stage === 'leafy' && (
          <div className="flex flex-col items-center animate-scale-in">
            <div className="relative">
              <Leaf className="w-24 h-24 text-green-600 drop-shadow-lg" />
              <Leaf className="w-12 h-12 text-green-500 absolute -top-3 -right-5 transform rotate-12 drop-shadow-md" />
              <Leaf className="w-8 h-8 text-green-400 absolute bottom-0 -left-3 transform -rotate-6" />
            </div>
            <div className="flex items-center gap-2 mt-3 text-green-700 text-sm font-medium">
              <span>{stageLabels.leafy}</span>
            </div>
          </div>
        )}

        {stage === 'tall' && (
          <div className="flex flex-col items-center animate-scale-in">
            <div className="relative">
              <TreeDeciduous className="w-28 h-28 text-emerald-700 drop-shadow-lg" />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
            </div>
            <div className="flex items-center gap-2 mt-3 text-emerald-800 text-sm font-medium">
              <span>{stageLabels.tall}</span>
            </div>
          </div>
        )}

        {stage === 'bloom' && (
          <div className="flex flex-col items-center animate-scale-in">
            <div className="relative">
              <Flower className="w-32 h-32 text-pink-500 drop-shadow-xl" />
              <Sparkles className="absolute -top-2 -right-4 w-6 h-6 text-amber-400 animate-pulse" />
              <Sparkles className="absolute top-4 -left-4 w-4 h-4 text-yellow-400 animate-pulse" style={{ animationDelay: '0.5s' }} />
              <div className="absolute inset-0 bg-pink-400/20 rounded-full blur-2xl animate-pulse" />
            </div>
            <div className="flex items-center gap-2 mt-3 text-pink-600 text-sm font-medium">
              <span>{stageLabels.bloom}</span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 w-full max-w-xs">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
            {streak} zile
          </span>
          <span className="text-gray-500">{getNextMilestone()} zile</span>
        </div>
        <div className="h-3 bg-gray-200/60 backdrop-blur-sm rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-400 via-primary-500 to-accent-500 rounded-full transition-all duration-700 relative"
            style={{ width: `${progress()}%` }}
          >
            <div className="absolute inset-0 bg-white/30 animate-shimmer" />
          </div>
        </div>
      </div>
    </div>
  )
}
