'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase/client'
import { ArrowRight } from 'lucide-react'

type BlogPost = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  cover_image: string | null
  reading_time: number
  published_at: string
}

function formatDate(date: string): string {
  return new Intl.DateTimeFormat('ro-RO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date(date))
}

function FeaturedPost({ post, index }: { post: BlogPost; index: number }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
    >
      <Link href={`/blog/${post.slug}`} className="group block outline-none">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center bg-white border border-stone-200 rounded-[2.5rem] p-6 md:p-10 transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] hover:border-stone-300">
          <div className="relative aspect-[4/3] md:aspect-square lg:aspect-[4/3] overflow-hidden rounded-[1.5rem] md:order-2 border border-stone-100">
            {post.cover_image ? (
              <img 
                src={post.cover_image} 
                alt={post.title}
                className="object-cover w-full h-full transform transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-emerald-100 to-amber-100" />
            )}
          </div>
          <div className="flex flex-col justify-center md:order-1 md:pr-8">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">
                {post.reading_time} min
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-semibold leading-[1.1] mb-6 font-serif text-stone-900 group-hover:text-emerald-700 transition-colors duration-300">
              {post.title}
            </h2>
            {post.excerpt && (
              <p className="text-lg text-stone-500 mb-8 leading-relaxed line-clamp-3">
                {post.excerpt}
              </p>
            )}
            <div className="flex items-center justify-between border-t border-stone-100 pt-6">
              <span className="text-sm font-medium text-stone-400">{formatDate(post.published_at)}</span>
              <span className="flex items-center gap-2 text-sm font-semibold text-stone-900 group-hover:text-emerald-700 transition-colors">
                Citește articolul <ArrowRight className="w-4 h-4 transform transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.section>
  )
}

function BlogCard({ post, index }: { post: BlogPost; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
    >
      <Link href={`/blog/${post.slug}`} className="group flex flex-col h-full outline-none">
        <div className="relative aspect-video overflow-hidden rounded-[1.5rem] mb-6 border border-stone-100">
          {post.cover_image ? (
            <img 
              src={post.cover_image} 
              alt={post.title}
              className="object-cover w-full h-full transform transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-emerald-100 to-amber-100" />
          )}
        </div>
        <div className="flex items-center gap-3 mb-4">
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-700">
            {post.reading_time} min
          </span>
          <span className="w-1 h-1 rounded-full bg-stone-300"></span>
          <span className="text-[11px] font-medium text-stone-400 uppercase tracking-widest">
            {formatDate(post.published_at)}
          </span>
        </div>
        <div className="flex-1">
          <h4 className="text-xl font-semibold leading-snug mb-3 font-serif text-stone-900 group-hover:text-emerald-700 transition-colors duration-300">
            {post.title}
          </h4>
          {post.excerpt && (
            <p className="text-stone-500 text-sm leading-relaxed line-clamp-3">
              {post.excerpt}
            </p>
          )}
        </div>
      </Link>
    </motion.div>
  )
}

function VaUrmaCard() {
  return (
    <div className="glass-card rounded-3xl p-12 text-center">
      <h3 className="text-2xl font-semibold font-serif text-stone-800 mb-4">
        Va urma...
      </h3>
      <p className="text-stone-500">
        Încă nu avem articole publicate. Revino curând!
      </p>
    </div>
  )
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPosts() {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('id, title, slug, excerpt, cover_image, reading_time, published_at')
        .eq('is_published', true)
        .order('published_at', { ascending: false })

      if (!error && data) {
        setPosts(data)
      }
      setLoading(false)
    }

    fetchPosts()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF9] pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="animate-pulse space-y-8">
            <div className="h-20 bg-stone-200 rounded-2xl w-2/3"></div>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="aspect-[4/3] bg-stone-200 rounded-2xl"></div>
              <div className="space-y-4">
                <div className="h-8 bg-stone-200 rounded w-1/3"></div>
                <div className="h-12 bg-stone-200 rounded w-full"></div>
                <div className="h-4 bg-stone-200 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const featuredPost = posts[0]
  const gridPosts = posts.slice(1)

  return (
    <div className="min-h-screen bg-[#FAFAF9] pt-20 md:pt-28 antialiased">
      <header className="max-w-7xl mx-auto px-6 mb-20">
        <div className="grid md:grid-cols-2 gap-12 items-center pt-8 md:pt-0">
          
          {/* Left Column: Text */}
          <div className="text-center md:text-center relative z-10 transform-gpu subpixel-antialiased">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 font-serif text-stone-900 leading-[1.1]">
              Jurnalul <span className="text-emerald-700 italic">Grădinii</span>
            </h1>
            <p className="text-xl text-stone-500 max-w-lg leading-relaxed mx-auto">
              Resurse, studii și perspective despre educația emoțională, gândite pentru părinți și profesori.
            </p>
          </div>

          {/* Right Column: Illustration */}
          <div className="hidden md:flex justify-center">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              className="w-full max-w-[400px]"
            >
              <img 
                src="/blog-hero-illustration.png" 
                alt="Jurnalul Grădinii" 
                className="w-full h-auto object-contain drop-shadow-xl"
              />
            </motion.div>
          </div>

        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 space-y-20 mb-20 relative z-10 transform-gpu">
        {posts.length === 0 ? (
          <VaUrmaCard />
        ) : (
          <>
            {featuredPost && <FeaturedPost post={featuredPost} index={0} />}
            
            {gridPosts.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-10 border-b border-stone-200 pb-4">
                  <h3 className="text-2xl font-semibold font-serif text-stone-900">
                    Cele mai noi articole
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                  {gridPosts.map((post, index) => (
                    <BlogCard key={post.id} post={post} index={index} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-400 py-12 border-t border-stone-800">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-stone-200">
            <img src="/logonou1.png" alt="Logo" className="h-12 w-auto" />
            <span className="font-bold tracking-tight">Grădina cu Vorbe Bune</span>
          </div>
          <div className="text-sm font-medium text-center">
            Realizat de{' '}
            <a href="https://www.linkedin.com/in/andreia-ionascu/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Andreia Ionașcu</a>
            {' '}si{' '}
            <a href="https://www.linkedin.com/in/gabriel-valentin-dragomir-a70929155" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Gabriel Dragomir</a>
          </div>
          <div className="text-sm font-medium">
            © 2026. Toate drepturile rezervate.
          </div>
        </div>
      </footer>
    </div>
  )
}
