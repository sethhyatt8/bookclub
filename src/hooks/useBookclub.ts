import { useCallback, useEffect, useState } from 'react'
import { MEMBERS, type Member } from '../lib/members'
import { supabase } from '../lib/supabase'
import type { BookRecord, BookSearchHit, RatingRecord } from '../types/bookclub'

function schemaHint(message: string): string {
  const lower = message.toLowerCase()
  if (lower.includes('bookclub_books') || lower.includes('schema cache') || lower.includes('does not exist')) {
    return 'Could not reach book club data. Run supabase/bookclub.sql (or add-chooser-fields.sql for updates) in the Supabase SQL Editor.'
  }
  if (lower.includes('least_favorite_character') || lower.includes('ending_opinion')) {
    return 'Could not save chooser notes. Run supabase/add-chooser-fields.sql in the Supabase SQL Editor.'
  }
  return message
}

async function loadActiveBook(): Promise<{
  book: BookRecord | null
  ratings: RatingRecord[]
}> {
  const { data: book, error: bookError } = await supabase
    .from('bookclub_books')
    .select('*')
    .eq('status', 'active')
    .maybeSingle()

  if (bookError) throw new Error(schemaHint(bookError.message))
  if (!book) return { book: null, ratings: [] }

  const { data: ratings, error: ratingsError } = await supabase
    .from('bookclub_ratings')
    .select('*')
    .eq('book_id', book.id)

  if (ratingsError) throw new Error(schemaHint(ratingsError.message))

  return {
    book: book as BookRecord,
    ratings: (ratings ?? []) as RatingRecord[],
  }
}

export function useBookclub(enabled: boolean) {
  const [book, setBook] = useState<BookRecord | null>(null)
  const [ratings, setRatings] = useState<RatingRecord[]>([])
  const [ready, setReady] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const refresh = useCallback(async () => {
    try {
      const next = await loadActiveBook()
      setBook(next.book)
      setRatings(next.ratings)
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load book club data')
    } finally {
      setReady(true)
    }
  }, [])

  useEffect(() => {
    if (!enabled) return
    void refresh()

    const channel = supabase
      .channel('bookclub-live')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookclub_books' },
        () => {
          void refresh()
        },
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookclub_ratings' },
        () => {
          void refresh()
        },
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [enabled, refresh])

  const getRating = useCallback(
    (member: Member): number | null => {
      return ratings.find((r) => r.member === member)?.rating ?? null
    },
    [ratings],
  )

  async function saveRating(member: Member, rating: number | null) {
    if (!book) return
    setSaving(true)
    setError('')
    try {
      const { error: saveError } = await supabase.from('bookclub_ratings').upsert({
        book_id: book.id,
        member,
        rating,
        updated_at: new Date().toISOString(),
      })
      if (saveError) throw new Error(schemaHint(saveError.message))
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save rating')
    } finally {
      setSaving(false)
    }
  }

  async function saveChooserFields(fields: {
    favorite_character: string
    least_favorite_character: string
    meaningful_quote: string
    surprising_plot_point: string
    ending_opinion: string
    discussion_questions: string[]
  }) {
    if (!book) return
    setSaving(true)
    setError('')
    try {
      const questions = fields.discussion_questions
        .map((q) => q.trim())
        .filter(Boolean)
        .slice(0, 5)

      const { error: saveError } = await supabase
        .from('bookclub_books')
        .update({
          favorite_character: fields.favorite_character.trim(),
          least_favorite_character: fields.least_favorite_character.trim(),
          meaningful_quote: fields.meaningful_quote.trim(),
          surprising_plot_point: fields.surprising_plot_point.trim(),
          ending_opinion: fields.ending_opinion.trim(),
          discussion_questions: questions,
          updated_at: new Date().toISOString(),
        })
        .eq('id', book.id)

      if (saveError) throw new Error(schemaHint(saveError.message))
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save notes')
    } finally {
      setSaving(false)
    }
  }

  async function setActiveBook(input: {
    hit: BookSearchHit
    chooser: Member
  }) {
    setSaving(true)
    setError('')
    try {
      if (book) {
        const { error: archiveError } = await supabase
          .from('bookclub_books')
          .update({
            status: 'archived',
            archived_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', book.id)
        if (archiveError) throw new Error(schemaHint(archiveError.message))
      }

      const { data: created, error: createError } = await supabase
        .from('bookclub_books')
        .insert({
          title: input.hit.title,
          author: input.hit.author,
          cover_url: input.hit.coverUrl,
          open_library_key: input.hit.key,
          first_publish_year: input.hit.firstPublishYear,
          chooser: input.chooser,
          status: 'active',
        })
        .select('*')
        .single()

      if (createError) throw new Error(schemaHint(createError.message))

      const rows = MEMBERS.map((member) => ({
        book_id: created.id,
        member,
        rating: null,
      }))
      const { error: ratingsError } = await supabase.from('bookclub_ratings').insert(rows)
      if (ratingsError) throw new Error(schemaHint(ratingsError.message))

      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not set active book')
    } finally {
      setSaving(false)
    }
  }

  return {
    book,
    ratings,
    ready,
    error,
    saving,
    refresh,
    getRating,
    saveRating,
    saveChooserFields,
    setActiveBook,
  }
}
