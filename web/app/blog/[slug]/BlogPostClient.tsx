'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { BookHeart, ArrowRight, Home, ChevronRight } from 'lucide-react'

type Post = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  meta_description: string | null
  cover_image: string | null
  reading_time: number
  published_at: string
  content: Record<string, unknown>
}

type TocItem = {
  id: string
  text: string
  level: string
}

function formatDate(date: string): string {
  return new Intl.DateTimeFormat('ro-RO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date(date))
}

export default function BlogPostClient({ post, contentHtml, tocItems }: { 
  post: Post
  contentHtml: string
  tocItems: TocItem[]
}) {
  const [isMounted, setIsMounted] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleShare = async () => {
    const shareData = {
      title: post.title,
      text: post.excerpt || post.meta_description || '',
      url: window.location.href,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Error sharing:', err)
        }
      }
    } else {
      await handleCopyLink()
    }
  }

  useEffect(() => {
    if (!isMounted) return

    // Reading Progress Bar
    const handleScroll = () => {
      const progressBar = document.getElementById('progress-bar')
      if (!progressBar) return
      
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const scrolled = Math.max(0, Math.min(100, (scrollTop / docHeight) * 100))
      
      progressBar.style.width = scrolled + '%'
    }

    window.addEventListener('scroll', handleScroll)

    // Smooth scroll with offset for sticky header
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        e.preventDefault()
        const targetId = this.getAttribute('href').substring(1)
        const target = document.getElementById(targetId)
        if (target) {
          const headerOffset = 100
          const elementPosition = target.getBoundingClientRect().top
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset
          
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          })
        }
      })
    })

    // Active Table of Contents - Scroll Spy with Intersection Observer (desktop only)
    const tocLinks = document.querySelectorAll('.toc-link-desktop')
    if (tocLinks.length > 0) {
      // Clear all active states first
      tocLinks.forEach((link) => {
        link.classList.remove('active', 'text-emerald-700', 'border-emerald-500', 'font-semibold')
        link.classList.add('text-stone-500', 'border-transparent')
      })
      
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const headingId = entry.target.id
            const headingLevel = entry.target.tagName.toLowerCase()
            
            tocLinks.forEach((link) => {
              const linkHeadingId = link.getAttribute('data-heading-id')
              if (linkHeadingId === headingId) {
                link.classList.add('active', 'text-emerald-700', 'border-emerald-500', 'font-semibold')
                link.classList.remove('text-stone-500', 'border-transparent')
              } else {
                link.classList.remove('active', 'text-emerald-700', 'border-emerald-500', 'font-semibold')
                link.classList.add('text-stone-500', 'border-transparent')
              }
            })

            if (headingLevel === 'h2') {
              document.querySelectorAll('.toc-children').forEach(el => {
                el.classList.add('hidden')
              })
              const childrenContainer = document.querySelector('.toc-children[data-parent-id="' + headingId + '"]')
              if (childrenContainer) {
                childrenContainer.classList.remove('hidden')
              }
            }
            
            if (headingLevel === 'h3') {
              let parentH2Id = null
              const allH2Links = document.querySelectorAll('.toc-link[data-heading-id]')
              allH2Links.forEach(link => {
                const h2Id = link.getAttribute('data-heading-id')
                const parentUl = link.closest('li')?.querySelector('.toc-children')
                if (parentUl) {
                  const h3Links = parentUl.querySelectorAll('.toc-link')
                  h3Links.forEach(h3Link => {
                    if (h3Link.getAttribute('data-heading-id') === headingId) {
                      parentH2Id = h2Id
                    }
                  })
                }
              })
              
              if (parentH2Id) {
                document.querySelectorAll('.toc-children').forEach(el => {
                  el.classList.add('hidden')
                })
                const childrenContainer = document.querySelector('.toc-children[data-parent-id="' + parentH2Id + '"]')
                if (childrenContainer) {
                  childrenContainer.classList.remove('hidden')
                }
              }
            }
          }
        })
      }, { rootMargin: '-100px 0px -60% 0px', threshold: 0 })

      document.querySelectorAll('h2[id], h3[id]').forEach((heading) => {
        observer.observe(heading)
      })
    }

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [isMounted])

  return (
    <div className="min-h-screen bg-[#FAFAF9] antialiased">
      {/* Reading Progress Bar */}
      <ProgressBar />

      {/* Article Header */}
      <header className="pt-20 md:pt-32 pb-16 max-w-4xl mx-auto px-6 text-left relative z-10 transform-gpu subpixel-antialiased">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-sm font-medium mb-6">
          <Link href="/" className="text-stone-500 hover:text-stone-900 transition-colors p-2 rounded-lg hover:bg-stone-100">
            <Home className="w-4 h-4" />
          </Link>
          <ChevronRight className="w-4 h-4 text-stone-400" />
          <Link href="/blog" className="text-stone-500 hover:text-stone-900 transition-colors px-2">
            Jurnal
          </Link>
          <ChevronRight className="w-4 h-4 text-stone-400" />
          <span className="text-emerald-700 truncate max-w-[200px]" title={post.title}>
            {post.title}
          </span>
        </nav>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 font-serif leading-[1.1] text-stone-900">
          {post.title}
        </h1>

        <div className="flex items-center justify-center gap-4 text-sm font-medium text-stone-500">
          <span>{formatDate(post.published_at)}</span>
          <span className="text-emerald-700">•</span>
          <span className="text-emerald-700">{post.reading_time} min citire</span>
        </div>

        {/* Mobile TOC - Fixed below date on small screens */}
        {isMounted && tocItems.length > 0 && (
          <div className="lg:hidden mt-6 border-y border-stone-200 py-6">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-stone-400 mb-6">Cuprins</h4>
            <ul className="border-l border-stone-200 space-y-3 text-sm font-medium text-stone-500">
              {tocItems.map((item) => (
                <li key={item.id}>
                  <a 
                    href={`#${item.id}`}
                    className="block pl-4 -ml-px text-base"
                    data-heading-id={item.id}
                  >
                    {item.text}
                  </a>
                  {item.children && item.children.length > 0 && item.level === 2 && (
                    <ul className="mt-2 ml-4 border-l border-stone-200 space-y-2">
                      {item.children.map((child) => (
                        <li key={child.id}>
                          <a 
                            href={`#${child.id}`}
                            className="block pl-4 -ml-px text-sm text-stone-400"
                            data-heading-id={child.id}
                          >
                            {child.text}
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </header>

      {/* Hero Image */}
      <div className="max-w-5xl mx-auto px-6 mb-24">
        <div className="relative aspect-video md:aspect-[21/9] overflow-hidden rounded-[2rem] border border-stone-200 shadow-2xl shadow-stone-200/50">
          {post.cover_image ? (
            <img 
              src={post.cover_image} 
              alt={post.title}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-emerald-100 to-amber-100" />
          )}
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-6xl mx-auto px-6 flex flex-col lg:flex-row gap-16 relative">
        
        {/* Table of Contents - Sticky Sidebar - Only show if 1+ headings */}
        {isMounted && tocItems.length > 0 && (
          <aside className="hidden lg:block w-64 flex-shrink-0 order-1 mb-24">
            <div className="sticky top-32 max-h-[calc(100vh-12rem)] overflow-y-auto no-scrollbar pb-10">
              <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-stone-400 mb-6">Cuprins</h4>
              <ul className="border-l border-stone-200 space-y-3 text-sm font-medium text-stone-500" id="toc-menu">
                {tocItems.map((item) => (
                  <li key={item.id}>
                    <a 
                      href={`#${item.id}`}
                      className="toc-link toc-link-desktop block pl-4 -ml-px hover:text-stone-900 transition-colors border-l-2 border-transparent hover:border-emerald-500 text-base"
                      data-heading-id={item.id}
                    >
                      {item.text}
                    </a>
                    {/* Nested H3 children - hidden until parent H2 is active */}
                    {item.children && item.children.length > 0 && item.level === 2 && (
                      <ul className="toc-children hidden mt-2 ml-4 border-l border-stone-200 space-y-2" data-parent-id={item.id}>
                        {item.children.map((child) => (
                          <li key={child.id}>
                            <a 
                              href={`#${child.id}`}
                              className="toc-link toc-link-desktop block pl-4 -ml-px hover:text-stone-900 transition-colors border-l-2 border-transparent hover:border-emerald-500 text-sm text-stone-400"
                              data-heading-id={child.id}
                            >
                              {child.text}
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        )}

        {/* Article Content */}
        <main 
          className={`flex-1 text-lg md:text-xl text-stone-600 leading-relaxed article-content pb-20 relative z-10 transform-gpu ${tocItems.length > 0 ? 'lg:max-w-[680px]' : 'max-w-3xl mx-auto'}`}
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />
      </div>

      {/* Share Section */}
      <div className="max-w-6xl mx-auto px-6 mb-24">
        <div className={tocItems.length > 0 ? 'lg:pl-80' : ''}>
          <div className={`flex items-center justify-between py-8 border-y border-stone-200 ${tocItems.length > 0 ? 'max-w-[680px]' : 'max-w-3xl mx-auto'}`}>
            <div className="flex items-center gap-4">
              <span className="text-sm font-bold uppercase tracking-widest text-stone-400">Distribuie</span>
              <button 
                onClick={handleCopyLink}
                className="w-10 h-10 rounded-full border border-stone-200 flex items-center justify-center text-stone-600 hover:bg-stone-100 hover:text-emerald-600 transition-colors relative"
              >
                {copied ? (
                  <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                )}
              </button>
              <button 
                onClick={handleShare}
                className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-100 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
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
            <Link 
              href="/biblioteca" 
              className="inline-flex items-center gap-2 bg-emerald-500 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-emerald-600 hover:scale-105 transition-all"
            >
              Descoperă Biblioteca
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-400 py-12 border-t border-stone-800">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-stone-200">
            <img src="/logonou1.png" alt="Logo" className="h-12 w-auto" />
            <span className="font-bold tracking-tight">Grădina cu Vorbe Bune</span>
          </div>
          <div className="text-sm font-medium">
            © 2026. Toate drepturile rezervate.
          </div>
        </div>
      </footer>

      {/* Scripts for ToC and Progress Bar */}
      <script dangerouslySetInnerHTML={{
        __html: `
          // Reading Progress Bar - starts immediately from top
          window.addEventListener('scroll', () => {
            const progressBar = document.getElementById('progress-bar');
            if (!progressBar) return;
            
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrolled = Math.max(0, Math.min(100, (scrollTop / docHeight) * 100));
            
            progressBar.style.width = scrolled + '%';
          });

          // Smooth scroll with offset for sticky header
          document.addEventListener('DOMContentLoaded', () => {
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
              anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href').substring(1);
                const target = document.getElementById(targetId);
                if (target) {
                  const headerOffset = 100;
                  const elementPosition = target.getBoundingClientRect().top;
                  const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                  
                  window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                  });
                }
              });
            });
          });

          // Active Table of Contents - Scroll Spy with Intersection Observer
          document.addEventListener('DOMContentLoaded', () => {
            // Delay to avoid hydration mismatch
            setTimeout(() => {
              const tocLinks = document.querySelectorAll('.toc-link');
              if (tocLinks.length === 0) return;
              
              // Clear all active states first
              tocLinks.forEach((link) => {
                link.classList.remove('active', 'text-emerald-700', 'border-emerald-500', 'font-semibold');
                link.classList.add('text-stone-500', 'border-transparent');
              });
              
              const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                  if (entry.isIntersecting) {
                    // Get the heading ID and level
                    const headingId = entry.target.id;
                    const headingLevel = entry.target.tagName.toLowerCase();
                    
                    // Find and update the corresponding ToC link
                    tocLinks.forEach((link) => {
                      const linkHeadingId = link.getAttribute('data-heading-id');
                      if (linkHeadingId === headingId) {
                        link.classList.add('active', 'text-emerald-700', 'border-emerald-500', 'font-semibold');
                        link.classList.remove('text-stone-500', 'border-transparent');
                      } else {
                        link.classList.remove('active', 'text-emerald-700', 'border-emerald-500', 'font-semibold');
                        link.classList.add('text-stone-500', 'border-transparent');
                      }
                    });

                    // Handle H2 - show its H3 children
                    if (headingLevel === 'h2') {
                      // Hide all H3 children first
                      document.querySelectorAll('.toc-children').forEach(el => {
                        el.classList.add('hidden');
                      });
                      // Show H3 children for this H2
                      const childrenContainer = document.querySelector('.toc-children[data-parent-id="' + headingId + '"]');
                      if (childrenContainer) {
                        childrenContainer.classList.remove('hidden');
                      }
                    }
                    
                    // Handle H3 - when scrolling up and H3 is active, show its parent's H3 children
                    if (headingLevel === 'h3') {
                      // Find parent H2 from the data
                      const tocItemsData = JSON.parse(document.getElementById('toc-data')?.textContent || '[]');
                      let parentH2Id = null;
                      
                      // Find which H2 owns this H3 by checking DOM
                      const allH2Links = document.querySelectorAll('.toc-link[data-heading-id]');
                      allH2Links.forEach(link => {
                        const h2Id = link.getAttribute('data-heading-id');
                        const parentUl = link.closest('li')?.querySelector('.toc-children');
                        if (parentUl) {
                          const h3Links = parentUl.querySelectorAll('.toc-link');
                          h3Links.forEach(h3Link => {
                            if (h3Link.getAttribute('data-heading-id') === headingId) {
                              parentH2Id = h2Id;
                            }
                          });
                        }
                      });
                      
                      if (parentH2Id) {
                        // Hide all H3 children first
                        document.querySelectorAll('.toc-children').forEach(el => {
                          el.classList.add('hidden');
                        });
                        // Show H3 children for parent H2
                        const childrenContainer = document.querySelector('.toc-children[data-parent-id="' + parentH2Id + '"]');
                        if (childrenContainer) {
                          childrenContainer.classList.remove('hidden');
                        }
                      }
                    }
                  }
                });
              }, { rootMargin: '-100px 0px -60% 0px', threshold: 0 });

              document.querySelectorAll('h2[id], h3[id]').forEach((heading) => {
                observer.observe(heading);
              });
            }, 100);
          });
        `
      }} />
    </div>
  )
}

function ProgressBar() {
  return (
    <div 
      id="progress-bar" 
      className="fixed top-[64px] left-0 h-1.5 bg-emerald-500 z-[119] w-0 rounded-r-full transition-all duration-150 ease-out"
    />
  )
}
