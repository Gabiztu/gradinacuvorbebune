'use client'
import { useState, useRef, useEffect, useCallback } from 'react'

export function useTransientPassword(uniqueId: string) {
  const realPasswordRef = useRef('')
  const [displayValue, setDisplayValue] = useState('')
  const [isHolding, setIsHolding] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    realPasswordRef.current = ''; setDisplayValue(''); setIsHolding(false);
    if (timerRef.current) clearTimeout(timerRef.current)
  }, [uniqueId])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    const inputLength = inputValue.length
    const realLength = realPasswordRef.current.length

    if (timerRef.current) clearTimeout(timerRef.current)

    if (inputLength > realLength) {
      const addedChars = inputValue.slice(realLength)
      realPasswordRef.current += addedChars
      setDisplayValue('•'.repeat(realLength) + addedChars)
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
