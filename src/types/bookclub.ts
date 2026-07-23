import type { Member } from '../lib/members'

export type BookStatus = 'active' | 'archived'

export type BookRecord = {
  id: string
  title: string
  author: string
  cover_url: string | null
  open_library_key: string | null
  first_publish_year: number | null
  chooser: Member
  status: BookStatus
  favorite_character: string
  meaningful_quote: string
  surprising_plot_point: string
  discussion_questions: string[]
  started_at: string
  archived_at: string | null
  updated_at: string
}

export type RatingRecord = {
  book_id: string
  member: Member
  rating: number | null
  updated_at: string
}

export type BookSearchHit = {
  key: string
  title: string
  author: string
  coverUrl: string | null
  firstPublishYear: number | null
}
