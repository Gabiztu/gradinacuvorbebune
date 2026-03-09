const diacriticsMap: Record<string, string> = {
  'ă': 'a', 'â': 'a', 'î': 'i', 'ș': 's', 'ț': 't',
  'Ă': 'A', 'Â': 'A', 'Î': 'I', 'Ș': 'S', 'Ț': 'T'
}

export function slugify(text: string): string {
  let result = text
  
  for (const [char, replacement] of Object.entries(diacriticsMap)) {
    result = result.replace(new RegExp(char, 'g'), replacement)
  }
  
  result = result.toLowerCase()
  result = result.replace(/[^a-z0-9]+/g, '-')
  result = result.replace(/^-+|-+$/g, '')
  
  return result
}

export function calculateReadingTime(content: string): number {
  const text = content.replace(/<[^>]*>/g, '')
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length
  const wordsPerMinute = 200
  return Math.ceil(wordCount / wordsPerMinute)
}
