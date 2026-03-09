'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import { 
  Bold, Italic, Heading2, Heading3, List, ListOrdered, 
  Link as LinkIcon, Quote, Code, Image as ImageIcon
} from 'lucide-react'
import { useRef } from 'react'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface TiptapEditorProps {
  content?: string
  onContentChange?: (json: any, html: string) => void
}

export function TiptapEditor({ content = '', onContentChange }: TiptapEditorProps) {
  const editorImageInputRef = useRef<HTMLInputElement>(null)

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
      }),
      Image.configure({
        inline: true,
      }),
      Placeholder.configure({
        placeholder: 'Scrie conținutul articolului tău aici...',
      }),
    ],
    content: content,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none focus:outline-none min-h-[300px] p-4',
      },
    },
    onUpdate: ({ editor }) => {
      if (onContentChange) {
        onContentChange(editor.getJSON(), editor.getHTML())
      }
    },
  })

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

  const ToolbarButton = ({ 
    onClick, 
    active, 
    children, 
    title 
  }: { 
    onClick: () => void
    active?: boolean
    children: React.ReactNode
    title: string
  }) => (
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

  return (
    <>
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

      <div className="bg-white rounded-2xl border border-stone-200 min-h-[400px]">
        <EditorContent editor={editor} />
      </div>
    </>
  )
}
