'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

interface ScrollShrinkWrapperProps {
  children: React.ReactNode
}

export default function ScrollShrinkWrapper({ children }: ScrollShrinkWrapperProps) {
  const sectionRef = useRef<HTMLElement>(null)
  
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["end 100%", "end 50%"]
  })
  
  const widthRaw = useTransform(scrollYProgress, [0, 1], [100, 84])
  const radiusRaw = useTransform(scrollYProgress, [0, 1], [0, 48])

  return (
    <section ref={sectionRef} className="relative z-20 w-full bg-emerald-700">
      
      {/* Animated Background Layer (z-0) */}
      <motion.div 
        className="absolute  top-0 bottom-0 left-0 right-0 mx-auto bg-[#FAFAF9] z-0"
        style={{ 
          width: useTransform(widthRaw, (w: number) => `${w}%`),
          borderBottomLeftRadius: useTransform(radiusRaw, (r: number) => `${r}px`),
          borderBottomRightRadius: useTransform(radiusRaw, (r: number) => `${r}px`)
        }}
      />
      
      {/* Content Layer (z-10) - CRITICAL: Must be relative and z-10 */}
      <div className="relative  z-10 w-full">
        {children}
      </div>
      
    </section>
  );
}
