'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import type { Beneficiary } from '@/types'

interface BeneficiaryContextType {
  beneficiaries: Beneficiary[]
  selectedBeneficiary: Beneficiary | null
  setSelectedBeneficiary: (beneficiary: Beneficiary | null) => void
  loading: boolean
  addBeneficiary: (beneficiary: Omit<Beneficiary, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<Beneficiary>
  updateBeneficiary: (id: string, data: Partial<Beneficiary>) => Promise<void>
  deleteBeneficiary: (id: string) => Promise<void>
  refreshBeneficiaries: () => Promise<void>
}

const BeneficiaryContext = createContext<BeneficiaryContextType | undefined>(undefined)

export function BeneficiaryProvider({ children }: { children: React.ReactNode }) {
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([])
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<Beneficiary | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const { user, loading: authLoading } = useAuth()

  const fetchBeneficiaries = useCallback(async () => {
    if (!user) {
      if (!authLoading) {
        setBeneficiaries([])
      }
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('beneficiaries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('[BeneficiaryContext] Beneficiaries fetch error:', error.message, error.code)
      } else if (data) {
        setBeneficiaries(data as Beneficiary[])
      } else {
        setBeneficiaries([])
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return
      console.error('[BeneficiaryContext] Beneficiaries fetch exception:', err)
    } finally {
      setLoading(false)
    }
  }, [user, supabase])

  useEffect(() => {
    fetchBeneficiaries()
  }, [fetchBeneficiaries])

  const addBeneficiary = useCallback(async (beneficiary: Omit<Beneficiary, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('beneficiaries')
      .insert({
        ...beneficiary,
        user_id: user.id,
      })
      .select()
      .single()

    if (error) {
      console.error('[BeneficiaryContext] addBeneficiary error:', error.message, error.code)
      throw error
    }

    const newBeneficiary = data as Beneficiary
    setBeneficiaries(prev => [newBeneficiary, ...prev])
    
    if (!selectedBeneficiary) {
      setSelectedBeneficiary(newBeneficiary)
    }

    return newBeneficiary
  }, [selectedBeneficiary, supabase, user])

  const updateBeneficiary = useCallback(async (id: string, data: Partial<Beneficiary>) => {
    const { error } = await supabase
      .from('beneficiaries')
      .update(data)
      .eq('id', id)

    if (error) {
      console.error('[BeneficiaryContext] updateBeneficiary error:', error.message, error.code)
      throw error
    }

    setBeneficiaries(prev => prev.map(b => b.id === id ? { ...b, ...data } : b))
    
    if (selectedBeneficiary?.id === id) {
      setSelectedBeneficiary(prev => prev ? { ...prev, ...data } : null)
    }
  }, [selectedBeneficiary, supabase])

  const deleteBeneficiary = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('beneficiaries')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('[BeneficiaryContext] deleteBeneficiary error:', error.message, error.code)
      throw error
    }

    setBeneficiaries(prev => prev.filter(b => b.id !== id))
    
    if (selectedBeneficiary?.id === id) {
      setSelectedBeneficiary(beneficiaries.find(b => b.id !== id) || null)
    }
  }, [beneficiaries, selectedBeneficiary, supabase])

  const refreshBeneficiaries = useCallback(async () => {
    await fetchBeneficiaries()
  }, [fetchBeneficiaries])

  return (
    <BeneficiaryContext.Provider
      value={{
        beneficiaries,
        selectedBeneficiary,
        setSelectedBeneficiary,
        loading,
        addBeneficiary,
        updateBeneficiary,
        deleteBeneficiary,
        refreshBeneficiaries,
      }}
    >
      {children}
    </BeneficiaryContext.Provider>
  )
}

export function useBeneficiary() {
  const context = useContext(BeneficiaryContext)
  if (context === undefined) {
    throw new Error('useBeneficiary must be used within a BeneficiaryProvider')
  }
  return context
}
