'use client'

import { generateHTML } from '@tiptap/html'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { common, createLowlight } from 'lowlight'
import { BookHeart, ArrowRight } from 'lucide-react'

const lowlight = createLowlight(common)

const extensions = [
  StarterKit,
  Link.configure({ openOnClick: false }),
  Image,
  CodeBlockLowlight.configure({ lowlight }),
]

function formatDate(): string {
  return new Intl.DateTimeFormat('ro-RO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date())
}

interface BlogPostPreviewProps {
  title: string
  coverImage: string | null
  content: Record<string, unknown> | string | null
  readingTime: number
  excerpt?: string | null
}

export function BlogPostPreview({ title, coverImage, content, readingTime, excerpt }: BlogPostPreviewProps) {
  let contentHtml = ''
  
  if (content) {
    if (typeof content === 'string') {
      contentHtml = content
    } else {
      contentHtml = generateHTML(content as Record<string, unknown>, extensions)
    }
  }

  return (
    <div className="bg-[#FAFAF9] min-h-full">
      {/* Navigation */}
      <nav className="w-full py-6 px-6">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-stone-400">
            Previzualizare
          </span>
        </div>
      </nav>

      {/* Article Header */}
      <header className="pt-8 pb-16 max-w-4xl mx-auto px-6 text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-10 font-serif leading-[1.1] text-stone-900">
          {title || 'Titlu articol'}
        </h1>

        <div className="flex items-center justify-center gap-4 text-sm font-medium text-stone-500">
          <span>{formatDate()}</span>
          <span className="text-emerald-700">•</span>
          <span className="text-emerald-700">{readingTime || 1} min citire</span>
        </div>
      </header>

      {/* Hero Image */}
      <div className="max-w-5xl mx-auto px-6 mb-24">
        <div className="relative aspect-video md:aspect-[21/9] overflow-hidden rounded-[2rem] border border-stone-200 shadow-2xl shadow-stone-200/50">
          {coverImage ? (
            <img 
              src={coverImage} 
              alt={title}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-emerald-100 to-amber-100" />
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 pb-20">
        <main 
          className="flex-1 max-w-[680px] mx-auto text-lg md:text-xl text-stone-600 leading-relaxed article-content"
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />
      </div>

      {/* CTA Section */}
      <section className="max-w-5xl mx-auto px-6 mb-24">
        <div className="bg-stone-900 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-[80px] -z-10"></div>
          
          <div className="relative z-10">
            <BookHeart className="w-12 h-12 text-emerald-400 mx-auto mb-6" />
            <h3 className="text-3xl md:text-5xl font-serif font-bold text-white mb-6">
              Ai nevoie de cuvintele potrivite chiar acum?
            </h3>
            <p className="text-lg text-stone-400 mb-10 max-w-xl mx-auto">
              Intră în bibliotecă și alege un mesaj de încurajare pentru copilul tău. Un singur gest poate schimba o zi proastă într-una bună.
            </p>
            <div className="inline-flex items-center gap-2 bg-emerald-500 text-white px-8 py-4 rounded-full text-lg font-semibold">
              Descoperă Biblioteca
              <ArrowRight className="w-5 h-5" />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
