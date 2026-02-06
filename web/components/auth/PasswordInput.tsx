'use client'
import { Lock } from 'lucide-react'

export function PasswordInput({
  field,
  label = 'Parolă',
  placeholder = '••••••••',
  error,
  touched,
  onBlur
}: {
  field: {
    value: string
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    showPassword: () => void
    hidePassword: () => void
    getValue: () => string
    isHolding: boolean
  }
  label?: string
  placeholder?: string
  error?: string | null
  touched?: boolean
  onBlur?: () => void
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-stone-700 ml-1">{label}</label>
      <div className="relative group">
        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400 group-focus-within:text-stone-600 transition-colors" />
        <input
          type="text"
          inputMode="text"
          autoComplete="off"
          value={field.value}
          onChange={field.onChange}
          onBlur={onBlur}
          className={`w-full pl-12 pr-12 py-3.5 bg-white/60 backdrop-blur-lg border rounded-xl focus:outline-none transition-all ${
            error ? 'border-red-300 focus:border-red-500' : 'border-white/40 focus:border-stone-400/50'
          }`}
          placeholder={placeholder}
        />
        <button
          type="button"
          onPointerDown={field.showPassword}
          onPointerUp={field.hidePassword}
          onPointerLeave={field.hidePassword}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 active:scale-90 transition-all select-none"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
        </button>
      </div>
      {error && touched && <p className="ml-1 text-sm text-red-500">{error}</p>}
    </div>
  )
}
