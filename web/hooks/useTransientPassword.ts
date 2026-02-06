'use client'
import { useState, useRef, useEffect, useCallback } from 'react'

export function useTransientPassword(uniqueId: string) {
  const realPasswordRef = useRef('')
  const prevLengthRef = useRef(0)
  const [displayValue, setDisplayValue] = useState('')
  const [isHolding, setIsHolding] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    realPasswordRef.current = ''
    prevLengthRef.current = 0
    setDisplayValue('')
    setIsHolding(false)
    if (timerRef.current) clearTimeout(timerRef.current)
  }, [uniqueId])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    const inputLength = inputValue.length

    if (inputLength === prevLengthRef.current) return
    prevLengthRef.current = inputLength

    if (timerRef.current) clearTimeout(timerRef.current)

    if (inputLength > realPasswordRef.current.length) {
      const addedChars = inputValue.slice(realPasswordRef.current.length)
      realPasswordRef.current += addedChars
      setDisplayValue('•'.repeat(realPasswordRef.current.length - 1) + addedChars)
      timerRef.current = setTimeout(() => {
        setDisplayValue('•'.repeat(realPasswordRef.current.length))
      }, 1000)
    } else {
      realPasswordRef.current = realPasswordRef.current.slice(0, inputLength)
      setDisplayValue('•'.repeat(inputLength))
    }
  }, [])

  return {
    value: isHolding ? realPasswordRef.current : displayValue,
    onChange: handleChange,
    getValue: () => realPasswordRef.current,
    showPassword: () => { setIsHolding(true); setDisplayValue(realPasswordRef.current); },
    hidePassword: () => { setIsHolding(false); setDisplayValue('•'.repeat(realPasswordRef.current.length)); },
    isHolding
  }
}
