'use client'

import { Toaster as Sonner } from 'sonner'

export function Toaster() {
  return (
    <Sonner
      theme="light"
      className="toaster"
      toastOptions={{
        classNames: {
          toast: 'bg-white text-gray-900 shadow-lg rounded-xl',
          success: 'bg-green-50 text-green-900 border border-green-200',
          error: 'bg-red-50 text-red-900 border border-red-200',
          warning: 'bg-yellow-50 text-yellow-900 border border-yellow-200',
          info: 'bg-blue-50 text-blue-900 border border-blue-200',
        },
      }}
    />
  )
}
