'use client'

import React, { useRef, useEffect, useState, useCallback, forwardRef, useImperativeHandle } from 'react'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'
import Link from 'next/link'
import { Users2, BrainCircuit, Frown, Home, Sparkles } from 'lucide-react'

const DEFAULT_PARTICLE_COUNT = 12
const DEFAULT_GLOW_COLOR = '34, 197, 94'
const MOBILE_BREAKPOINT = 768

interface CategoryCard {
  id: string
  href: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  gradient: string
  bgLight: string
  count: number
  width: string
  height: string
  animationDuration?: number
  animationY?: number
  animationDelay?: number
}

const categories: CategoryCard[] = [
  { 
    id: 'school_harmony', 
    href: '/library/school-harmony', 
    title: 'Armonie la școală', 
    description: 'Conflicte, bullying, situații la școală', 
    icon: Users2, 
    gradient: 'from-blue-400 to-blue-600', 
    bgLight: 'bg-blue-100/60',
    count: 3,
    width: '100%',
    height: '280px',
    animationDuration: 2,
    animationY: 0,
    animationDelay: 0,
  },
  { 
    id: 'exams_tests', 
    href: '/library/exams-tests', 
    title: 'Examene și teste', 
    description: 'Sprijin înainte de Evaluare', 
    icon: BrainCircuit, 
    gradient: 'from-purple-400 to-purple-600', 
    bgLight: 'bg-purple-100/60',
    count: 3,
    width: '100%',
    height: '163px',
    animationDuration: 2,
    animationY: 0,
    animationDelay: 0.5,
  },
  { 
    id: 'overcoming_failure', 
    href: '/library/overcoming-failure', 
    title: 'Depășirea eșecului', 
    description: 'După note mici sau greșeli', 
    icon: Frown, 
    gradient: 'from-orange-400 to-orange-600', 
    bgLight: 'bg-orange-100/60',
    count: 3,
    width: '100%',
    height: '183px',
    animationDuration: 2,
    animationY: 0,
    animationDelay: 1,
  },
  { 
    id: 'family_reconnection', 
    href: '/library/family-reconnection', 
    title: 'Reconectare familială', 
    description: 'După certuri, pentru armonie', 
    icon: Home, 
    gradient: 'from-green-400 to-green-600', 
    bgLight: 'bg-green-100/60',
    count: 3,
    width: '100%',
    height: '300px',
    animationDuration: 2,
    animationY: 0,
    animationDelay: 1.5,
  },
  { 
    id: 'personalized', 
    href: '/library/personalized', 
    title: 'Mesaj personalizat', 
    description: 'Compune mesajul tău', 
    icon: Sparkles, 
    gradient: 'from-gray-700 to-gray-900', 
    bgLight: 'bg-gray-100/60',
    count: 0,
    width: '100%',
    height: '140px',
    animationDuration: 2,
    animationY: 0,
    animationDelay: 2,
  },
]

const createParticleElement = (x: number, y: number, color: string = DEFAULT_GLOW_COLOR): HTMLDivElement => {
  const el = document.createElement('div')
  el.className = 'particle'
  el.style.cssText = `
    position: absolute;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: rgba(${color}, 1);
    box-shadow: 0 0 6px rgba(${color}, 0.6);
    pointer-events: none;
    z-index: 100;
    left: ${x}px;
    top: ${y}px;
  `
  return el
}

interface ParticleCardProps {
  children: React.ReactNode
  className?: string
  disableAnimations?: boolean
  style?: React.CSSProperties
  particleCount?: number
  glowColor?: string
  enableTilt?: boolean
  clickEffect?: boolean
  enableMagnetism?: boolean
}

const ParticleCard = React.forwardRef<HTMLDivElement, ParticleCardProps>(({
  children,
  className = '',
  disableAnimations = false,
  style,
  particleCount = DEFAULT_PARTICLE_COUNT,
  glowColor = DEFAULT_GLOW_COLOR,
  enableTilt = true,
  clickEffect = true,
  enableMagnetism = false
}, ref) => {
  const cardRef = useRef<HTMLDivElement>(null)
  const particlesRef = useRef<HTMLDivElement[]>([])
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([])
  const isHoveredRef = useRef(false)
  const memoizedParticles = useRef<HTMLDivElement[]>([])
  const particlesInitialized = useRef(false)
  const magnetismAnimationRef = useRef<gsap.core.Tween | null>(null)

  useImperativeHandle(ref, () => cardRef.current as HTMLDivElement)

  const initializeParticles = useCallback(() => {
    if (particlesInitialized.current || !cardRef.current) return

    const { width, height } = cardRef.current.getBoundingClientRect()
    memoizedParticles.current = Array.from({ length: particleCount }, () =>
      createParticleElement(Math.random() * width, Math.random() * height, glowColor)
    )
    particlesInitialized.current = true
  }, [particleCount, glowColor])

  const clearAllParticles = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout)
    timeoutsRef.current = []
    magnetismAnimationRef.current?.kill()

    particlesRef.current.forEach(particle => {
      gsap.to(particle, {
        scale: 0,
        opacity: 0,
        duration: 0.3,
        ease: 'back.in(1.7)',
        onComplete: () => {
          particle.parentNode?.removeChild(particle)
        }
      })
    })
    particlesRef.current = []
  }, [])

  const animateParticles = useCallback(() => {
    if (!cardRef.current || !isHoveredRef.current) return

    if (!particlesInitialized.current) {
      initializeParticles()
    }

    memoizedParticles.current.forEach((particle, index) => {
      const timeoutId = setTimeout(() => {
        if (!isHoveredRef.current || !cardRef.current) return

        const clone = particle.cloneNode(true) as HTMLDivElement
        cardRef.current!.appendChild(clone)
        particlesRef.current.push(clone)

        gsap.fromTo(clone, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.7)' })

        gsap.to(clone, {
          x: (Math.random() - 0.5) * 100,
          y: (Math.random() - 0.5) * 100,
          rotation: Math.random() * 360,
          duration: 2 + Math.random() * 2,
          ease: 'none',
          repeat: -1,
          yoyo: true
        })

        gsap.to(clone, {
          opacity: 0.3,
          duration: 1.5,
          ease: 'power2.inOut',
          repeat: -1,
          yoyo: true
        })
      }, index * 100)

      timeoutsRef.current.push(timeoutId)
    })
  }, [initializeParticles])

  useEffect(() => {
    if (disableAnimations || !cardRef.current) return

    const element = cardRef.current

    const handleMouseEnter = () => {
      isHoveredRef.current = true
      animateParticles()

      if (enableTilt) {
        gsap.to(element, {
          rotateX: 5,
          rotateY: 5,
          duration: 0.3,
          ease: 'power2.out',
          transformPerspective: 1000
        })
      }
    }

    const handleMouseLeave = () => {
      isHoveredRef.current = false
      clearAllParticles()

      if (enableTilt) {
        gsap.to(element, {
          rotateX: 0,
          rotateY: 0,
          duration: 0.3,
          ease: 'power2.out'
        })
      }

      if (enableMagnetism) {
        gsap.to(element, {
          x: 0,
          y: 0,
          duration: 0.3,
          ease: 'power2.out'
        })
      }
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!enableTilt && !enableMagnetism) return

      const rect = element.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const centerX = rect.width / 2
      const centerY = rect.height / 2

      if (enableTilt) {
        const rotateX = ((y - centerY) / centerY) * -10
        const rotateY = ((x - centerX) / centerX) * 10

        gsap.to(element, {
          rotateX,
          rotateY,
          duration: 0.1,
          ease: 'power2.out',
          transformPerspective: 1000
        })
      }

      if (enableMagnetism) {
        const magnetX = (x - centerX) * 0.05
        const magnetY = (y - centerY) * 0.05

        magnetismAnimationRef.current = gsap.to(element, {
          x: magnetX,
          y: magnetY,
          duration: 0.3,
          ease: 'power2.out'
        })
      }
    }

    const handleClick = (e: MouseEvent) => {
      if (!clickEffect) return

      const rect = element.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      const maxDistance = Math.max(
        Math.hypot(x, y),
        Math.hypot(x - rect.width, y),
        Math.hypot(x, y - rect.height),
        Math.hypot(x - rect.width, y - rect.height)
      )

      const ripple = document.createElement('div')
      ripple.style.cssText = `
        position: absolute;
        width: ${maxDistance * 2}px;
        height: ${maxDistance * 2}px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(${glowColor}, 0.4) 0%, rgba(${glowColor}, 0.2) 30%, transparent 70%);
        left: ${x - maxDistance}px;
        top: ${y - maxDistance}px;
        pointer-events: none;
        z-index: 1000;
      `

      element.appendChild(ripple)

      gsap.fromTo(
        ripple,
        {
          scale: 0,
          opacity: 1
        },
        {
          scale: 1,
          opacity: 0,
          duration: 0.8,
          ease: 'power2.out',
          onComplete: () => ripple.remove()
        }
      )
    }

    element.addEventListener('mouseenter', handleMouseEnter)
    element.addEventListener('mouseleave', handleMouseLeave)
    element.addEventListener('mousemove', handleMouseMove)
    element.addEventListener('click', handleClick)

    return () => {
      isHoveredRef.current = false
      element.removeEventListener('mouseenter', handleMouseEnter)
      element.removeEventListener('mouseleave', handleMouseLeave)
      element.removeEventListener('mousemove', handleMouseMove)
      element.removeEventListener('click', handleClick)
      clearAllParticles()
    }
  }, [animateParticles, clearAllParticles, disableAnimations, enableTilt, enableMagnetism, clickEffect, glowColor])

  return (
    <div
      ref={cardRef}
      className={`${className} relative overflow-hidden`}
      style={{ ...style, position: 'relative', overflow: 'hidden' }}
    >
      {children}
    </div>
  )
})

const useMobileDetection = () => {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return isMobile
}

interface MagicBentoProps {
  enableStars?: boolean
  enableSpotlight?: boolean
  enableTilt?: boolean
  disableAnimations?: boolean
  glowColor?: string
  clickEffect?: boolean
  onCategoryClick?: (categoryId: string) => void
  categoryCounts?: Record<string, number>
}

const MagicBento: React.FC<MagicBentoProps> = ({
  enableStars = true,
  enableSpotlight = true,
  enableTilt = true,
  disableAnimations = false,
  glowColor = DEFAULT_GLOW_COLOR,
  clickEffect = true,
  onCategoryClick,
  categoryCounts = {}
}) => {
  const isMobile = useMobileDetection()
  const shouldDisableAnimations = disableAnimations || isMobile

  const entranceDelays = [0.3, 0.9, 0.9, 0.7, 1.2]
  const entranceDurations = [0.6, 1.0, 1.0, 0.6, 0.6]

  const cinematicVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.95, 
      filter: 'blur(8px)',
      backdropFilter: 'blur(0px)',
      willChange: 'transform, opacity',
    },
    visible: (index: number) => ({
      opacity: 1, 
      scale: 1, 
      filter: 'blur(0px)',
      transition: {
        delay: entranceDelays[index] || 0,
        duration: entranceDurations[index] || 0.6,
        ease: [0.34, 1.56, 0.64, 1] as const,
        backdropFilter: { delay: entranceDelays[index] + 0.3, duration: 0.4 }
      }
    }),
    hover: { 
      scale: 1.02,
      filter: 'brightness(1.03)',
      transition: { type: 'spring' as const, stiffness: 400, damping: 30 }
    },
    tap: { scale: 0.98 }
  }

  const renderCard = (card: CategoryCard, index: number) => {
    const Icon = card.icon
    const isPersonalized = card.id === 'personalized'
    const accentColor = card.gradient.match(/from-(\w+)-/)?.[1] || 'gray'
    
    const cardContent = (
      <div className="h-full flex flex-col justify-between relative z-10">
        <div className="bento-card-header">
          <div className={`bento-card-icon ${card.bgLight} relative`}>
            {/* Radial glow behind icon */}
            <div className={`absolute inset-0 rounded-2xl bg-${accentColor}-200/30 blur-xl`} />
            <div className="relative z-10">
              <Icon className={`w-6 h-6 ${card.gradient.replace('from-', 'text-').replace(' to-', '-').replace('-600', '-500')}`} />
            </div>
          </div>
          {(categoryCounts[card.id] || 0) > 0 && (
            <span className="bento-card-badge">{categoryCounts[card.id] || 0}</span>
          )}
        </div>
        <div className="bento-card-content">
          <h3 className="text-balance">{card.title}</h3>
          <p>{card.description}</p>
        </div>
      </div>
    )

    const handleCardClick = () => {
      if (onCategoryClick) {
        onCategoryClick(card.id)
      } else if (!isPersonalized) {
        window.location.href = card.href
      }
    }

    return (
      <motion.div
        key={card.id}
        custom={index}
        variants={cinematicVariants}
        initial="hidden"
        animate={shouldDisableAnimations ? "visible" : "visible"}
        whileHover="hover"
        whileTap="tap"
        onClick={handleCardClick}
        className={isPersonalized ? "w-full" : ""}
        layout
      >
        <div 
          className={`bento-card glass-card`}
          style={{ 
            height: card.height,
            background: 'rgba(255, 255, 255, 0.75)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            border: '1px solid rgba(0, 0, 0, 0.06)',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.03), 0 2px 4px -1px rgba(0, 0, 0, 0.02), inset 0 1px 0 rgba(255, 255, 255, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)',
            transform: 'translateZ(0)',
            backfaceVisibility: 'hidden',
            willChange: 'transform, opacity',
          }}
        >
          {/* Radial glow behind icon */}
          <div className={`absolute inset-0 rounded-[20px] bg-${accentColor}-400/10 blur-[25px]`} />
          
          {/* Vertical accent line */}
          <div className={`absolute left-0 top-4 bottom-4 w-[3px] bg-gradient-to-b from-${accentColor}-400/80 to-${accentColor}-400/40 rounded-r-full`} />
          
          {/* Inner shadow at top */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-white/60 via-white/20 to-transparent" />
          
          {/* Subtle pattern overlay */}
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none overflow-hidden">
            <svg width="100%" height="100%" className="absolute inset-0">
              <pattern id={`pattern-${card.id}`} x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="10" cy="10" r="1" fill="currentColor" className="text-gray-900" />
              </pattern>
              <rect width="100%" height="100%" fill={`url(#pattern-${card.id})`} />
            </svg>
          </div>

          {enableStars ? (
            <ParticleCard
              className="bg-transparent shadow-none border-none"
              style={{ background: 'transparent' }}
              disableAnimations={false}
              particleCount={DEFAULT_PARTICLE_COUNT}
              glowColor={glowColor}
              enableTilt={enableTilt}
              clickEffect={clickEffect}
              enableMagnetism={false}
            >
              {cardContent}
            </ParticleCard>
          ) : (
            cardContent
          )}
        </div>
      </motion.div>
    )
  }

  const leftColumn = [categories[0], categories[2]]
  const rightColumn = [categories[1], categories[3]]
  const lastCard = categories[4]

  return (
    <>
      <style>{`
        .bento-grid-section {
          --glow-x: 50%;
          --glow-y: 50%;
          --glow-intensity: 0;
          --glow-radius: 200px;
          --glow-color: ${glowColor};
          --white: hsl(0, 0%, 100%);
          --purple-glow: rgba(34, 197, 94, 0.2);
          --green-border: rgba(34, 197, 94, 0.8);
        }
        
        .glass-card {
          position: relative;
          overflow: hidden;
          border-radius: 20px;
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          min-width: 0;
        }
        
        .glass-card::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 20px;
          padding: 1px;
          background: linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 100%);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
        }
        
        .glass-card::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: rgba(255, 255, 255, 0.4);
          pointer-events: none;
        }
        
        .glass-card:hover {
          box-shadow: 
            0 10px 25px -5px rgba(0, 0, 0, 0.08),
            0 8px 10px -6px rgba(0, 0, 0, 0.03),
            inset 0 1px 0 rgba(255, 255, 255, 0.5);
        }
        
        .bento-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 3.2rem;
        }
        
        .bento-card-icon {
          width: 48px;
          height: 48px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .bento-card-badge {
          padding: 0.25rem 0.75rem;
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.4);
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 600;
          color: #4b5563;
        }
        
        .bento-card-content {
          margin-top: 0.5rem;
        }
        
        .bento-card-content h3 {
          font-weight: 700;
          font-size: 0.875rem;
          line-height: 1.3;
          margin-bottom: 0.25rem;
          color: #111827;
        }
        
        .bento-card-content p {
          font-size: 0.75rem;
          color: #6b7280;
          line-height: 1.75;
        }
        
        .particle::before {
          content: '';
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          background: rgba(${glowColor}, 0.2);
          border-radius: 50%;
          z-index: -1;
        }
        
        .text-balance {
          text-wrap: balance;
        }
      `}</style>

      <div className="bento-grid-section flex flex-col gap-3 p-4 w-full">
        <div className="grid grid-cols-2 gap-3 items-start">
          <div className="flex flex-col gap-3">
            {leftColumn.map((card, i) => renderCard(card, i === 0 ? 0 : 2))}
          </div>
          <div className="flex flex-col gap-3">
            {rightColumn.map((card, i) => renderCard(card, i === 0 ? 1 : 3))}
          </div>
        </div>
        {lastCard && renderCard(lastCard, 4)}
      </div>
    </>
  )
}

export default MagicBento
