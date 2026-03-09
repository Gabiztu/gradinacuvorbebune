'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { common, createLowlight } from 'lowlight'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { slugify, calculateReadingTime } from '@/lib/utils/slugify'
import { PreviewModal } from '@/components/blog/PreviewModal'
import { toast } from 'sonner'
import { 
  Bold, Italic, Heading2, Heading3, List, ListOrdered, 
  Link as LinkIcon, Quote, Code, Image as ImageIcon,
  ArrowLeft, Save, Send, Upload, X, Eye, EyeOff
} from 'lucide-react'

const lowlight = createLowlight(common)

function SkeletonLoader() {
  return (
    <div className="min-h-screen bg-[#FAFAF9] p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="h-10 w-20 bg-stone-200 rounded animate-pulse" />
          <div className="h-8 w-40 bg-stone-200 rounded animate-pulse" />
          <div className="flex gap-3">
            <div className="h-10 w-32 bg-stone-200 rounded-xl animate-pulse" />
            <div className="h-10 w-32 bg-stone-200 rounded-xl animate-pulse" />
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card rounded-3xl p-6">
            <div className="h-6 w-40 bg-stone-200 rounded animate-pulse mb-4" />
            <div className="h-64 w-full bg-stone-200 rounded-2xl animate-pulse" />
          </div>

          <div className="glass-card rounded-3xl p-6">
            <div className="h-5 w-20 bg-stone-200 rounded animate-pulse mb-2" />
            <div className="h-12 w-full bg-stone-200 rounded-xl animate-pulse" />
          </div>

          <div className="glass-card rounded-3xl p-6">
            <div className="h-5 w-16 bg-stone-200 rounded animate-pulse mb-2" />
            <div className="h-12 w-full bg-stone-200 rounded-xl animate-pulse" />
          </div>

          <div className="glass-card rounded-3xl p-6">
            <div className="h-5 w-48 bg-stone-200 rounded animate-pulse mb-2" />
            <div className="h-24 w-full bg-stone-200 rounded-xl animate-pulse" />
          </div>

          <div className="glass-card rounded-3xl p-6">
            <div className="h-5 w-32 bg-stone-200 rounded animate-pulse mb-2" />
            <div className="h-20 w-full bg-stone-200 rounded-xl animate-pulse" />
          </div>

          <div className="glass-card rounded-3xl p-6">
            <div className="h-5 w-24 bg-stone-200 rounded animate-pulse mb-4" />
            <div className="h-96 w-full bg-stone-200 rounded-2xl animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  )
}

function ToolbarButton({ 
  onClick, 
  active, 
  children, 
  title 
}: { 
  onClick: () => void
  active?: boolean
  children: React.ReactNode
  title: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-2 rounded-lg transition-colors ${
        active 
          ? 'bg-emerald-500 text-white' 
          : 'hover:bg-stone-100 text-stone-600'
      }`}
    >
      {children}
    </button>
  )
}

export default function EditBlogPostPage() {
  const router = useRouter()
  const params = useParams()
  const { user, profile } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const editorImageInputRef = useRef<HTMLInputElement>(null)
  
  const [loading, setLoading] = useState(true)
  const [post, setPost] = useState<any>(null)
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [slugError, setSlugError] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [metaDescription, setMetaDescription] = useState('')
  const [coverImage, setCoverImage] = useState('')
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null)
  const [coverImagePreview, setCoverImagePreview] = useState('')
  const [originalCoverImage, setOriginalCoverImage] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)
  const [isPublished, setIsPublished] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [editorState, setEditorState] = useState(0)

  const forbiddenCharsRegex = /[,;:'"\\()[\]{}!@#$%^&*<>?\s]/
  
  const isSlugValid = (value: string) => !forbiddenCharsRegex.test(value)

  const editor = useEditor({
    immediatelyRender: false,
    onSelectionUpdate: () => {
      setEditorState(prev => prev + 1)
    },
    onUpdate: () => {
      setEditorState(prev => prev + 1)
    },
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Link.configure({
        openOnClick: false,
      }),
      Image.configure({
        inline: true,
      }),
      Placeholder.configure({
        placeholder: 'Scrie conținutul articolului tău aici...',
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none focus:outline-none min-h-[300px] p-4',
      },
    },
  })

  useEffect(() => {
    const fetchPost = async () => {
      const postId = params.id
      
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', postId)
        .single()

      if (error || !data) {
        toast.error('Articolul nu a fost găsit')
        router.push('/mgmt-x9f2b8c71/blog')
        return
      }

      setPost(data)
      setTitle(data.title || '')
      setSlug(data.slug || '')
      setExcerpt(data.excerpt || '')
      setMetaDescription(data.meta_description || '')
      setCoverImage(data.cover_image || '')
      setCoverImagePreview(data.cover_image || '')
      setOriginalCoverImage(data.cover_image || '')
      setIsPublished(data.is_published || false)

      if (editor && data.content) {
        editor.commands.setContent(data.content)
      }

      setLoading(false)
    }

    if (params.id) {
      fetchPost()
    }
  }, [params.id, router, supabase, editor])

  const handleTitleChange = (value: string) => {
    setTitle(value)
    const newSlug = slugify(value)
    if (!slug || slug === slugify(title) || slug === '') {
      setSlug(newSlug)
      if (!isSlugValid(newSlug)) {
        setSlugError('Slug-ul nu poate conține caractere speciale sau spații')
      } else {
        setSlugError('')
      }
    }
  }

  const handleSlugChange = (value: string) => {
    setSlug(value)
    if (!isSlugValid(value)) {
      setSlugError('Slug-ul nu poate conține caractere speciale sau spații: , ; : \' " \\ ( ) [ ] { } ! @ # $ % ^ & * < > ?')
    } else {
      setSlugError('')
    }
  }

  const handleCoverImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setCoverImageFile(file)
      const reader = new FileReader()
      reader.onload = () => {
        setCoverImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const deleteOldImage = async (imageUrl: string) => {
    if (!imageUrl) return
    
    try {
      const urlParts = imageUrl.split('/')
      const fileName = urlParts[urlParts.length - 1]
      
      await supabase.storage
        .from('blog-images')
        .remove([fileName])
    } catch (error) {
      console.error('Error deleting old image:', error)
    }
  }

  const uploadCoverImage = async (): Promise<string | null> => {
    if (!coverImageFile) {
      return coverImage
    }
    
    setUploadingCover(true)
    try {
      if (originalCoverImage && coverImageFile) {
        await deleteOldImage(originalCoverImage)
      }

      const fileExt = coverImageFile.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      
      const { data, error } = await supabase.storage
        .from('blog-images')
        .upload(fileName, coverImageFile)
      
      if (error) throw error
      
      const { data: { publicUrl } } = supabase.storage
        .from('blog-images')
        .getPublicUrl(fileName)
      
      setUploadingCover(false)
      return publicUrl
    } catch (error) {
      console.error('Error uploading cover image:', error)
      toast.error('Eroare la încărcarea imaginii de copertă')
      setUploadingCover(false)
      return null
    }
  }

  const uploadEditorImage = async (): Promise<string | null> => {
    const file = editorImageInputRef.current?.files?.[0]
    if (!file) return null
    
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      
      const { data, error } = await supabase.storage
        .from('blog-images')
        .upload(fileName, file)
      
      if (error) throw error
      
      const { data: { publicUrl } } = supabase.storage
        .from('blog-images')
        .getPublicUrl(fileName)
      
      return publicUrl
    } catch (error) {
      console.error('Error uploading editor image:', error)
      toast.error('Eroare la încărcarea imaginii')
      return null
    }
  }

  const handleEditorImageUpload = () => {
    editorImageInputRef.current?.click()
  }

  const handleEditorImageSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = await uploadEditorImage()
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run()
    }
    if (editorImageInputRef.current) {
      editorImageInputRef.current.value = ''
    }
  }

  const handleSave = async (publish?: boolean) => {
    if (!title.trim()) {
      toast.error('Titlul este obligatoriu')
      return
    }

    if (!user || !profile) {
      toast.error('Trebuie să fii autentificat')
      return
    }

    setSaving(true)
    try {
      const uploadedCoverUrl = await uploadCoverImage()
      const contentJson = editor?.getJSON()
      const contentHtml = editor?.getHTML()
      const readingTime = calculateReadingTime(contentHtml || '')

      let updateData: any = {
        title: title.trim(),
        slug: slug.trim() || slugify(title),
        excerpt: excerpt.trim() || null,
        meta_description: metaDescription.trim() || null,
        cover_image: uploadedCoverUrl || null,
        content: contentJson,
        reading_time: readingTime,
        updated_at: new Date().toISOString(),
      }

      if (publish !== undefined) {
        updateData.is_published = publish
        updateData.published_at = publish ? new Date().toISOString() : null
      }

      const { error } = await supabase
        .from('blog_posts')
        .update(updateData)
        .eq('id', params.id)

      if (error) throw error

      toast.success(publish === true ? 'Articol publicat!' : publish === false ? 'Articol despublicat!' : 'Articol salvat!')
      router.push('/mgmt-x9f2b8c71/blog')
    } catch (error) {
      console.error('Error saving blog post:', error)
      toast.error('Eroare la salvarea articolului')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <SkeletonLoader />
  }

  return (
    <div className="min-h-screen bg-[#FAFAF9] p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <button
            onClick={() => router.push('/mgmt-x9f2b8c71/blog')}
            className="flex items-center gap-2 text-stone-600 hover:text-stone-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Înapoi</span>
          </button>
          <h1 className="text-xl md:text-2xl font-semibold text-stone-900 order-first md:order-none w-full md:w-auto text-center md:text-left -mt-2 md:mt-0">Editează Articol</h1>
          <div className="flex items-center gap-2 md:gap-3">
            <button
              onClick={() => setIsPreviewOpen(true)}
              disabled={!title}
              className="flex items-center gap-2 px-3 md:px-4 py-2 bg-stone-100 text-stone-700 rounded-xl font-medium hover:bg-stone-200 disabled:opacity-50 text-sm"
            >
              <Eye className="w-4 h-4" />
              <span className="hidden md:inline">Previzualizare</span>
            </button>
            <button
              onClick={() => handleSave()}
              disabled={saving || !title || !isSlugValid(slug)}
              className="flex items-center gap-2 px-3 md:px-4 py-2 glass-button rounded-xl text-stone-700 font-medium disabled:opacity-50 text-sm"
            >
              <Save className="w-4 h-4" />
              <span className="hidden md:inline">Salvează</span>
            </button>
            {isPublished ? (
              <button
                onClick={() => handleSave(false)}
                disabled={saving || !title || !isSlugValid(slug)}
                className="flex items-center gap-2 px-3 md:px-4 py-2 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 disabled:opacity-50 text-sm"
              >
                <EyeOff className="w-4 h-4" />
                <span className="hidden md:inline">Despublică</span>
              </button>
            ) : (
              <button
                onClick={() => handleSave(true)}
                disabled={saving || !title || !isSlugValid(slug)}
                className="flex items-center gap-2 px-3 md:px-4 py-2 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 disabled:opacity-50 text-sm"
              >
                <Send className="w-4 h-4" />
                <span className="hidden md:inline">Publică</span>
              </button>
            )}
          </div>
        </div>

        {/* Form */}
        <div className="space-y-6">
          {/* Cover Image */}
          <div className="glass-card rounded-3xl p-6">
            <h3 className="text-lg font-semibold text-stone-800 mb-4">Imagine de Copertă</h3>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleCoverImageSelect}
              accept="image/*"
              className="hidden"
            />
            {coverImagePreview ? (
              <div className="relative">
                <img
                  src={coverImagePreview}
                  alt="Cover preview"
                  className="w-full h-64 object-cover rounded-2xl"
                />
                <button
                  onClick={() => {
                    setCoverImageFile(null)
                    setCoverImagePreview('')
                    setCoverImage('')
                  }}
                  className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-lg hover:bg-stone-100"
                >
                  <X className="w-4 h-4 text-stone-600" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingCover}
                className="w-full h-40 border-2 border-dashed border-stone-300 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-emerald-400 hover:bg-emerald-50/50 transition-colors"
              >
                <Upload className="w-8 h-8 text-stone-400" />
                <span className="text-stone-500">
                  {uploadingCover ? 'Se încarcă...' : 'Încarcă imagine de copertă'}
                </span>
              </button>
            )}
          </div>

          {/* Title */}
          <div className="glass-card rounded-3xl p-6">
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Titlu *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Titlul articolului"
              className="w-full px-4 py-3 glass-input rounded-xl text-lg font-medium"
            />
          </div>

          {/* Slug */}
          <div className="glass-card rounded-3xl p-6">
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Slug
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder="url-articol"
              className={`w-full px-4 py-3 glass-input rounded-xl font-mono text-sm ${slugError ? 'border-red-500 focus:ring-red-500' : ''}`}
            />
            {slugError && (
              <p className="text-red-500 text-sm mt-2">{slugError}</p>
            )}
          </div>

          {/* Excerpt */}
          <div className="glass-card rounded-3xl p-6">
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Rezumat (pentru cardurile din blog)
            </label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="O scurtă descriere a articolului..."
              rows={3}
              className="w-full px-4 py-3 glass-input rounded-xl resize-none"
            />
          </div>

          {/* Meta Description */}
          <div className="glass-card rounded-3xl p-6">
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Meta Descriere (pentru SEO)
            </label>
            <textarea
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              placeholder="Descrierea care apare în rezultatele Google..."
              rows={2}
              className="w-full px-4 py-3 glass-input rounded-xl resize-none"
            />
          </div>

          {/* Editor */}
          <div className="glass-card rounded-3xl p-6">
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Conținut
            </label>
            
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-1 p-2 border-b border-stone-200 mb-4">
              <ToolbarButton
                onClick={() => editor?.chain().focus().toggleBold().run()}
                active={editor?.isActive('bold')}
                title="Bold"
              >
                <Bold className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor?.chain().focus().toggleItalic().run()}
                active={editor?.isActive('italic')}
                title="Italic"
              >
                <Italic className="w-4 h-4" />
              </ToolbarButton>
              <div className="w-px h-6 bg-stone-200 mx-1" />
              <ToolbarButton
                onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                active={editor?.isActive('heading', { level: 2 })}
                title="Heading 2"
              >
                <Heading2 className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
                active={editor?.isActive('heading', { level: 3 })}
                title="Heading 3"
              >
                <Heading3 className="w-4 h-4" />
              </ToolbarButton>
              <div className="w-px h-6 bg-stone-200 mx-1" />
              <ToolbarButton
                onClick={() => editor?.chain().focus().toggleBulletList().run()}
                active={editor?.isActive('bulletList')}
                title="Listă bullet"
              >
                <List className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                active={editor?.isActive('orderedList')}
                title="Listă numerotată"
              >
                <ListOrdered className="w-4 h-4" />
              </ToolbarButton>
              <div className="w-px h-6 bg-stone-200 mx-1" />
              <ToolbarButton
                onClick={() => {
                  const url = window.prompt('URL:')
                  if (url) {
                    editor?.chain().focus().setLink({ href: url }).run()
                  }
                }}
                active={editor?.isActive('link')}
                title="Link"
              >
                <LinkIcon className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor?.chain().focus().toggleBlockquote().run()}
                active={editor?.isActive('blockquote')}
                title="Citare"
              >
                <Quote className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
                active={editor?.isActive('codeBlock')}
                title="Cod"
              >
                <Code className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={handleEditorImageUpload}
                title="Imagine"
              >
                <ImageIcon className="w-4 h-4" />
              </ToolbarButton>
            </div>
            
            <input
              type="file"
              ref={editorImageInputRef}
              onChange={handleEditorImageSelected}
              accept="image/*"
              className="hidden"
            />

            {/* Editor Content */}
            <div className="bg-white rounded-2xl border border-stone-200 min-h-[400px]">
              <EditorContent editor={editor} />
            </div>
          </div>
        </div>
      </div>

      <PreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title={title}
        coverImage={coverImagePreview || coverImage || null}
        contentJson={editor?.getJSON() || null}
      />
    </div>
  )
}
