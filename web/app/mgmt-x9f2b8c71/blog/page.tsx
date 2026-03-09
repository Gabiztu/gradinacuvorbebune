'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import { 
  Book, FileText, Plus, Pencil, Trash2, ExternalLink, 
  Search, X, LayoutDashboard
} from 'lucide-react'

type BlogPost = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  cover_image: string | null
  reading_time: number
  is_published: boolean
  published_at: string | null
  created_at: string
  author_id: string
  profiles?: {
    id: string
  }
}

type Stats = {
  total: number
  published: number
  drafts: number
}

function formatDate(date: string): string {
  return new Intl.DateTimeFormat('ro-RO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(new Date(date))
}

function DeleteModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title 
}: { 
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string 
}) {
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl">
        <h3 className="text-xl font-semibold text-stone-900 mb-4">Șterge Articolul</h3>
        <p className="text-stone-600 mb-6">
          Ești sigur că vrei să ștergi articolul <strong>„{title}"</strong>? 
          Această acțiune nu poate fi anulată.
        </p>
        <div className="flex gap-4 justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-full text-stone-600 hover:bg-stone-100 transition-colors"
          >
            Anulează
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
          >
            Șterge
          </button>
        </div>
      </div>
    </div>
  )
}

export default function BlogManagementPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [stats, setStats] = useState<Stats>({ total: 0, published: 0, drafts: 0 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all')
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; post: BlogPost | null }>({
    isOpen: false,
    post: null
  })

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    fetchPosts()
  }, [search, filter])

  async function fetchPosts() {
    setLoading(true)
    try {
      let query = supabase
        .from('blog_posts')
        .select('id, title, slug, excerpt, cover_image, reading_time, is_published, published_at, created_at, author_id, profiles(id)')
        .order('created_at', { ascending: false })

      if (search) {
        query = query.ilike('title', `%${search}%`)
      }

      if (filter === 'published') {
        query = query.eq('is_published', true)
      } else if (filter === 'draft') {
        query = query.eq('is_published', false)
      }

      const { data, error } = await query

      if (error) throw error

      setPosts(data || [])
      
      // Calculate stats
      const allPosts = data || []
      setStats({
        total: allPosts.length,
        published: allPosts.filter((p: BlogPost) => p.is_published).length,
        drafts: allPosts.filter((p: BlogPost) => !p.is_published).length
      })
    } catch (error) {
      console.error('Error fetching posts:', error)
      toast.error('Eroare la încărcarea articolelor')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!deleteModal.post) return

    try {
      // Delete cover image from storage if exists
      if (deleteModal.post.cover_image) {
        const imagePath = deleteModal.post.cover_image.split('/blog-images/')[1]
        if (imagePath) {
          await supabase.storage.from('blog-images').remove([imagePath])
        }
      }

      // Delete post from database
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', deleteModal.post.id)

      if (error) throw error

      toast.success('Articol șters cu succes!')
      setDeleteModal({ isOpen: false, post: null })
      fetchPosts()
    } catch (error) {
      console.error('Error deleting post:', error)
      toast.error('Eroare la ștergerea articolului')
    }
  }

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-[#FAFAF9] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAF9] p-6 md:p-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-stone-900">Gestionare Blog</h1>
            <p className="text-stone-500 mt-1">Administrează articolele tale</p>
          </div>
          <Link
            href="/mgmt-x9f2b8c71"
            className="flex items-center gap-2 px-4 py-2 bg-stone-100 text-stone-700 rounded-xl text-sm font-medium hover:bg-stone-200 transition-colors"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>
        </div>
        <Link
          href="/mgmt-x9f2b8c71/blog/new"
          className="flex items-center gap-2 bg-emerald-500 text-white px-6 py-3 rounded-full font-medium hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/25"
        >
          <Plus className="w-5 h-5" />
          Adaugă Articol Nou
        </Link>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <FileText className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-stone-900">{stats.total}</p>
              <p className="text-sm text-stone-500">Total Articole</p>
            </div>
          </div>
        </div>
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
              <Book className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-stone-900">{stats.published}</p>
              <p className="text-sm text-stone-500">Publicate</p>
            </div>
          </div>
        </div>
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center">
              <FileText className="w-5 h-5 text-stone-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-stone-900">{stats.drafts}</p>
              <p className="text-sm text-stone-500">Ciorne</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
          <input
            type="text"
            placeholder="Caută articole..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 glass-input rounded-xl"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as 'all' | 'published' | 'draft')}
          className="px-4 py-3 glass-input rounded-xl"
        >
          <option value="all">Toate</option>
          <option value="published">Publicate</option>
          <option value="draft">Ciorne</option>
        </select>
      </div>

      {/* Posts List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card rounded-2xl p-6 animate-pulse">
              <div className="flex gap-4">
                <div className="w-24 h-24 bg-stone-200 rounded-xl"></div>
                <div className="flex-1 space-y-3">
                  <div className="h-5 bg-stone-200 rounded w-1/3"></div>
                  <div className="h-4 bg-stone-200 rounded w-2/3"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center">
          <FileText className="w-16 h-16 text-stone-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-stone-800 mb-2">
            {search || filter !== 'all' ? 'Nu am găsit articole' : 'Nu ai niciun articol'}
          </h3>
          <p className="text-stone-500 mb-6">
            {search || filter !== 'all' 
              ? 'Încearcă o altă căutare sau filtru' 
              : 'Creează primul tău articol pentru blog'}
          </p>
          {!search && filter === 'all' && (
            <Link
              href="/mgmt-x9f2b8c71/blog/new"
              className="inline-flex items-center gap-2 bg-emerald-500 text-white px-6 py-3 rounded-full font-medium hover:bg-emerald-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Creează Primul Articol
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div 
              key={post.id} 
              className="glass-card rounded-2xl p-5 hover:bg-white/60 transition-colors"
            >
              <div className="flex gap-4">
                {/* Thumbnail */}
                <div className="w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-stone-100">
                  {post.cover_image ? (
                    <img 
                      src={post.cover_image} 
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-emerald-100 to-amber-100 flex items-center justify-center">
                      <Book className="w-8 h-8 text-stone-400" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-stone-900 truncate">
                        {post.title}
                      </h3>
                      <p className="text-sm text-stone-500 line-clamp-1 mt-1">
                        {post.excerpt || 'Fără rezumat'}
                      </p>
                    </div>
                    <span className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium ${
                      post.is_published 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-stone-100 text-stone-600'
                    }`}>
                      {post.is_published ? 'Publicat' : 'Ciornă'}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 mt-3 text-sm text-stone-400">
                    <span>{post.reading_time} min citire</span>
                    <span>•</span>
                    <span>{formatDate(post.created_at)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link
                    href={`/mgmt-x9f2b8c71/blog/edit/${post.id}`}
                    className="p-2 rounded-lg hover:bg-stone-100 text-stone-500 hover:text-stone-700 transition-colors"
                    title="Editează"
                  >
                    <Pencil className="w-5 h-5" />
                  </Link>
                  <button
                    onClick={() => setDeleteModal({ isOpen: true, post })}
                    className="p-2 rounded-lg hover:bg-red-50 text-stone-500 hover:text-red-600 transition-colors"
                    title="Șterge"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  {post.is_published && (
                    <a
                      href={`/blog/${post.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg hover:bg-emerald-50 text-stone-500 hover:text-emerald-600 transition-colors"
                      title="Vizualizează"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, post: null })}
        onConfirm={handleDelete}
        title={deleteModal.post?.title || ''}
      />
    </div>
  )
}
