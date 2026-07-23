import { useEffect, useState } from 'react'
import { MEMBERS, type Member } from '../lib/members'
import { searchBooks } from '../lib/openLibrary'
import type { BookSearchHit } from '../types/bookclub'

type Props = {
  defaultChooser: Member
  busy: boolean
  onPick: (hit: BookSearchHit, chooser: Member) => void
  onCancel: () => void
}

export function BookSearch({ defaultChooser, busy, onPick, onCancel }: Props) {
  const [query, setQuery] = useState('')
  const [chooser, setChooser] = useState<Member>(defaultChooser)
  const [hits, setHits] = useState<BookSearchHit[]>([])
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const q = query.trim()
    if (q.length < 2) return

    const handle = window.setTimeout(() => {
      setSearching(true)
      setError('')
      void searchBooks(q)
        .then(setHits)
        .catch(() => setError('Search failed. Try again in a moment.'))
        .finally(() => setSearching(false))
    }, 350)

    return () => window.clearTimeout(handle)
  }, [query])

  const visibleHits = query.trim().length < 2 ? [] : hits

  return (
    <div className="search">
      <div className="search__header">
        <h2 className="search__title">Pick the next book</h2>
        <button type="button" className="btn btn--ghost" onClick={onCancel}>
          Cancel
        </button>
      </div>

      <label className="field">
        <span>Who chose it?</span>
        <select
          value={chooser}
          disabled={busy}
          onChange={(e) => setChooser(e.target.value as Member)}
        >
          {MEMBERS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span>Search Open Library</span>
        <input
          type="search"
          placeholder="Title or author…"
          value={query}
          disabled={busy}
          onChange={(e) => setQuery(e.target.value)}
        />
      </label>

      {searching ? <p className="muted">Searching…</p> : null}
      {error ? (
        <p className="gate__error" role="alert">
          {error}
        </p>
      ) : null}

      <ul className="search__results">
        {visibleHits.map((hit) => (
          <li key={hit.key}>
            <button
              type="button"
              className="search__hit"
              disabled={busy}
              onClick={() => onPick(hit, chooser)}
            >
              {hit.coverUrl ? (
                <img src={hit.coverUrl} alt="" />
              ) : (
                <div className="search__hit-blank" aria-hidden="true" />
              )}
              <span>
                <strong>{hit.title}</strong>
                <em>
                  {hit.author}
                  {hit.firstPublishYear ? ` · ${hit.firstPublishYear}` : ''}
                </em>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
