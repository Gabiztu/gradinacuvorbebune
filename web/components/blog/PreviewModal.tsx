'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'
import { BlogPostPreview } from './BlogPostPreview'
import { calculateReadingTime } from '@/lib/utils/slugify'
import { generateHTML } from '@tiptap/html'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { common, createLowlight } from 'lowlight'

const lowlight = createLowlight(common)

const extensions = [
  StarterKit,
  Link.configure({ openOnClick: false }),
  Image,
  CodeBlockLowlight.configure({ lowlight }),
]

interface PreviewModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  coverImage: string | null
  contentJson: Record<string, unknown> | null
}

export function PreviewModal({ isOpen, onClose, title, coverImage, contentJson }: PreviewModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  let contentHtml = ''
  if (contentJson) {
    contentHtml = generateHTML(contentJson as Record<string, unknown>, extensions)
  }
  
  const readingTime = calculateReadingTime(contentHtml)

  return (
    <div className="fixed inset-0 z-[100] bg-stone-900/90 backdrop-blur-sm">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="fixed top-4 right-4 z-50 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Preview Content */}
      <div className="h-full overflow-auto">
        <div className="max-w-5xl mx-auto py-8 px-6">
          <div className="bg-[#FAFAF9] rounded-2xl overflow-hidden min-h-[calc(100vh-4rem)]">
            <BlogPostPreview
              title={title}
              coverImage={coverImage}
              content={contentJson}
              readingTime={readingTime}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
