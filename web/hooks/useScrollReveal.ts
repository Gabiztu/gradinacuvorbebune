'use client'

import { useEffect, useRef, useCallback, useState } from 'react'

interface UseScrollRevealOptions {
  forceVisibleCount?: number
  forceVisibleDuration?: number
  rootMargin?: string
  threshold?: number
  staggerDelay?: number
}

let observerRef: IntersectionObserver | null = null

export function useScrollReveal(
  scrollRef: React.RefObject<HTMLDivElement | null>,
  itemCount: number,
  isActive: boolean,
  options: UseScrollRevealOptions = {}
) {
  const {
    forceVisibleCount = 6,
    forceVisibleDuration = 500,
    rootMargin = '100px',
    threshold = 0.1,
    staggerDelay = 0.03
  } = options

  const [visibleIndices, setVisibleIndices] = useState<Set<number>>(new Set())
  const [isReady, setIsReady] = useState(false)
  const [isForcePhase, setIsForcePhase] = useState(false)
  const itemRefs = useRef<Map<number, HTMLDivElement>>(new Map())

  useEffect(() => {
    if (!isActive) {
      setVisibleIndices(new Set())
      setIsReady(false)
      setIsForcePhase(false)
      return
    }

    setIsForcePhase(true)
    setIsReady(false)

    const initialVisible = new Set<number>()
    for (let i = 0; i < Math.min(forceVisibleCount, itemCount); i++) {
      initialVisible.add(i)
    }
    setVisibleIndices(initialVisible)

    const readyTimer = setTimeout(() => {
      setIsReady(true)
      setIsForcePhase(false)
    }, forceVisibleDuration)

    return () => {
      clearTimeout(readyTimer)
    }
  }, [isActive, itemCount, forceVisibleCount, forceVisibleDuration])

  useEffect(() => {
    const container = scrollRef.current
    if (!container || !isActive) return

    const observer = new IntersectionObserver(
      (entries) => {
        setVisibleIndices(prev => {
          const next = new Set(prev)
          let changed = false

          entries.forEach(entry => {
            const idx = parseInt(entry.target.getAttribute('data-idx') || '-1')
            if (idx === -1) return

            if (entry.isIntersecting && !next.has(idx)) {
              next.add(idx)
              changed = true
            } else if (!entry.isIntersecting && next.has(idx)) {
              next.delete(idx)
              changed = true
            }
          })

          return changed ? next : prev
        })
      },
      { root: container, rootMargin, threshold }
    )

    observerRef = observer

    itemRefs.current.forEach(el => {
      observer.observe(el)
    })

    return () => {
      observer.disconnect()
      observerRef = null
    }
  }, [scrollRef, isActive, rootMargin, threshold])

  const registerItem = useCallback((index: number, element: HTMLDivElement | null) => {
    if (element) {
      element.setAttribute('data-idx', String(index))
      itemRefs.current.set(index, element)

      if (observerRef) {
        observerRef.observe(element)
      }
    } else {
      const existing = itemRefs.current.get(index)
      if (existing) {
        observerRef?.unobserve(existing)
        itemRefs.current.delete(index)
      }
    }
  }, [])

  const getAnimateState = useCallback((index: number): 'visible' | 'hidden' => {
    // During force phase, check if item has registered (even if not in state yet)
    if (isForcePhase && index < forceVisibleCount) {
      return itemRefs.current.has(index) ? 'visible' : 'hidden'
    }
    // After force phase: show if item was in initial set OR has registered
    return (isReady && (visibleIndices.has(index) || itemRefs.current.has(index)))
      ? 'visible'
      : 'hidden'
  }, [isForcePhase, forceVisibleCount, isReady, visibleIndices])

  const getDelay = useCallback((index: number): number => {
    if (isForcePhase && index < forceVisibleCount) {
      return index * staggerDelay
    }
    return 0
  }, [isForcePhase, forceVisibleCount, staggerDelay])

  return { registerItem, getAnimateState, getDelay }
}
