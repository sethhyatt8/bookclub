import type { BookSearchHit } from '../types/bookclub'

type OpenLibraryDoc = {
  key?: string
  title?: string
  author_name?: string[]
  cover_i?: number
  first_publish_year?: number
}

type OpenLibrarySearchResponse = {
  docs?: OpenLibraryDoc[]
}

function coverFromId(coverId: number | undefined): string | null {
  if (coverId == null) return null
  return `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`
}

export async function searchBooks(query: string): Promise<BookSearchHit[]> {
  const q = query.trim()
  if (!q) return []

  const url = new URL('https://openlibrary.org/search.json')
  url.searchParams.set('q', q)
  url.searchParams.set('limit', '8')
  url.searchParams.set('fields', 'key,title,author_name,cover_i,first_publish_year')

  const res = await fetch(url)
  if (!res.ok) throw new Error('Book search failed')

  const data = (await res.json()) as OpenLibrarySearchResponse
  return (data.docs ?? [])
    .filter((doc) => doc.key && doc.title)
    .map((doc) => ({
      key: doc.key!,
      title: doc.title!,
      author: doc.author_name?.[0] ?? 'Unknown author',
      coverUrl: coverFromId(doc.cover_i),
      firstPublishYear: doc.first_publish_year ?? null,
    }))
}
