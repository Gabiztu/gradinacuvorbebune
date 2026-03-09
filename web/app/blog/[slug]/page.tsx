import { generateHTML } from '@tiptap/html'
import StarterKit from '@tiptap/starter-kit'
import TiptapLink from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { common, createLowlight } from 'lowlight'
import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import BlogPostClient from './BlogPostClient'

const lowlight = createLowlight(common)

const extensions = [
  StarterKit,
  TiptapLink.configure({ openOnClick: false }),
  Image,
  CodeBlockLowlight.configure({ lowlight }),
]

async function getBlogPost(slug: string) {
  const { data: post } = await supabase
    .from('blog_posts')
    .select('id, title, slug, excerpt, meta_description, cover_image, reading_time, published_at, content')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()
  
  return post
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getBlogPost(slug)
  
  if (!post) {
    return { title: 'Articol negăsit' }
  }
  
  return {
    title: post.title,
    description: post.meta_description || post.excerpt || '',
    openGraph: {
      title: post.title,
      description: post.meta_description || post.excerpt || '',
      images: post.cover_image ? [post.cover_image] : [],
    },
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getBlogPost(slug)
  
  if (!post) {
    notFound()
  }
  
  const contentHtml = generateHTML(post.content || {}, extensions)
  
  // Post-process HTML to add IDs to headings for ToC
  let processedHtml = contentHtml
  
  // Add IDs to h2 tags
  const headingIds = new Map<string, number>()
  processedHtml = processedHtml.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/g, (match, text) => {
    // Strip any HTML tags from the text content for ID
    const plainText = text.replace(/<[^>]+>/g, '').trim()
    const id = plainText
      .toLowerCase()
      .replace(/ăâîșț/g, (c: string) => ({'ă':'a','â':'a','î':'i','ș':'s','ț':'t'}[c] || c))
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
    
    const baseId = id || 'section'
    let uniqueId = baseId
    let counter = headingIds.get(baseId) || 0
    if (counter > 0) {
      uniqueId = `${baseId}-${counter}`
    }
    headingIds.set(baseId, counter + 1)
    
    return `<h2 id="${uniqueId}">${text}</h2>`
  })
  
  // Add IDs to h3 tags
  processedHtml = processedHtml.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/g, (match, text) => {
    const plainText = text.replace(/<[^>]+>/g, '').trim()
    const id = plainText
      .toLowerCase()
      .replace(/ăâîșț/g, (c: string) => ({'ă':'a','â':'a','î':'i','ș':'s','ț':'t'}[c] || c))
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
    
    const baseId = id || 'subsection'
    let uniqueId = baseId
    let counter = headingIds.get(baseId) || 0
    if (counter > 0) {
      uniqueId = `${baseId}-${counter}`
    }
    headingIds.set(baseId, counter + 1)
    
    return `<h3 id="${uniqueId}">${text}</h3>`
  })
  
  // Extract headings for ToC with H3 nested under preceding H2
  const h2Matches = processedHtml.match(/<h2 id="([^"]+)"[^>]*>([\s\S]*?)<\/h2>/g) || []
  const h3Matches = processedHtml.match(/<h3 id="([^"]+)"[^>]*>([\s\S]*?)<\/h3>/g) || []

  // Build hierarchical ToC
  interface TocItemType {
    id: string
    text: string
    level: string
    children?: TocItemType[]
  }

  // Get positions of H2 in HTML to find parent for each H3
  const h2Positions: number[] = []
  h2Matches.forEach((match: string) => {
    const pos = processedHtml.indexOf(match)
    h2Positions.push(pos)
  })

  const tocItems: TocItemType[] = []
  let currentH2Index = 0

  // Add all H2 items first
  h2Matches.forEach((match: string) => {
    const idMatch = match.match(/id="([^"]+)"/)
    const textContent = match.match(/<h2[^>]*>([\s\S]*?)<\/h2>/)
    const plainText = textContent?.[1]?.replace(/<[^>]+>/g, '').trim() || ''
    tocItems.push({
      id: idMatch?.[1] || '',
      text: plainText,
      level: "2",
      children: []
    })
  })

  // Add H3 items to the H2 that precedes them in the article
  h3Matches.forEach((match: string) => {
    const idMatch = match.match(/id="([^"]+)"/)
    const textContent = match.match(/<h3[^>]*>([\s\S]*?)<\/h3>/)
    const plainText = textContent?.[1]?.replace(/<[^>]+>/g, '').trim() || ''
    const h3Pos = processedHtml.indexOf(match)
    
    // Find which H2 comes before this H3
    let parentH2Index = -1
    for (let i = 0; i < h2Positions.length; i++) {
      if (h2Positions[i] < h3Pos) {
        parentH2Index = i
      } else {
        break
      }
    }
    
    if (parentH2Index >= 0 && tocItems[parentH2Index]) {
      // Add to parent H2
      tocItems[parentH2Index].children = tocItems[parentH2Index].children || []
      tocItems[parentH2Index].children!.push({
        id: idMatch?.[1] || '',
        text: plainText,
        level: "3"
      })
    } else {
      // No parent H2 found, add at top level in order
      tocItems.push({
        id: idMatch?.[1] || '',
        text: plainText,
        level: "3"
      })
    }
  })
  
  return (
    <BlogPostClient 
      post={post}
      contentHtml={processedHtml}
      tocItems={tocItems}
    />
  )
}
