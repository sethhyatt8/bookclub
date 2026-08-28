import { useState } from 'react'
import { MEMBERS, type Member } from '../lib/members'
import type { BookRecord } from '../types/bookclub'

type Props = {
  book: BookRecord
  canEdit: boolean
  saving: boolean
  getRating: (member: Member) => number | null
  onSaveRating: (member: Member, rating: number | null) => void
  onSaveChooserFields: (fields: {
    favorite_character: string
    least_favorite_character: string
    meaningful_quote: string
    surprising_plot_point: string
    ending_opinion: string
    discussion_questions: string[]
  }) => void
  onChangeBook: () => void
}

function normalizeQuestions(questions: string[]): string[] {
  const next = [...questions]
  while (next.length < 5) next.push('')
  return next.slice(0, 5)
}

export function CurrentBook({
  book,
  canEdit,
  saving,
  getRating,
  onSaveRating,
  onSaveChooserFields,
  onChangeBook,
}: Props) {
  return (
    <CurrentBookEditor
      key={book.id}
      book={book}
      canEdit={canEdit}
      saving={saving}
      getRating={getRating}
      onSaveRating={onSaveRating}
      onSaveChooserFields={onSaveChooserFields}
      onChangeBook={onChangeBook}
    />
  )
}

function CurrentBookEditor({
  book,
  canEdit,
  saving,
  getRating,
  onSaveRating,
  onSaveChooserFields,
  onChangeBook,
}: Props) {
  const [favoriteCharacter, setFavoriteCharacter] = useState(book.favorite_character)
  const [leastFavoriteCharacter, setLeastFavoriteCharacter] = useState(
    book.least_favorite_character ?? '',
  )
  const [quote, setQuote] = useState(book.meaningful_quote)
  const [plotPoint, setPlotPoint] = useState(book.surprising_plot_point)
  const [endingOpinion, setEndingOpinion] = useState(book.ending_opinion ?? '')
  const [questions, setQuestions] = useState(() =>
    normalizeQuestions(book.discussion_questions ?? []),
  )

  const filledQuestions = (book.discussion_questions ?? []).filter((q) => q.trim())
  const average =
    MEMBERS.map((m) => getRating(m)).filter((r): r is number => r != null)
  const avgScore =
    average.length > 0
      ? (average.reduce((a, b) => a + b, 0) / average.length).toFixed(1)
      : null

  function saveNotes() {
    onSaveChooserFields({
      favorite_character: favoriteCharacter,
      least_favorite_character: leastFavoriteCharacter,
      meaningful_quote: quote,
      surprising_plot_point: plotPoint,
      ending_opinion: endingOpinion,
      discussion_questions: questions,
    })
  }

  return (
    <article className="current">
      <div className="current__stage">
        <div className="current__cover-wrap">
          {book.cover_url ? (
            <img
              className="current__cover"
              src={book.cover_url}
              alt={`Cover of ${book.title}`}
            />
          ) : (
            <div className="current__cover current__cover--blank" aria-hidden="true">
              No cover
            </div>
          )}
        </div>

        <div className="current__intro">
          <p className="brand">Bellefonte Cafe Book Club</p>
          <p className="eyebrow">Now reading</p>
          <h1>{book.title}</h1>
          <p className="current__by">
            {book.author}
            {book.first_publish_year ? ` · ${book.first_publish_year}` : ''}
          </p>
          <p className="current__chooser">
            Chosen by <strong>{book.chooser}</strong>
          </p>
          {avgScore ? (
            <p className="current__avg">
              Club average <span>{avgScore}</span>
              <small>/10</small>
            </p>
          ) : (
            <p className="current__avg current__avg--empty">Ratings coming in</p>
          )}
          {canEdit ? (
            <button type="button" className="btn" onClick={onChangeBook} disabled={saving}>
              Archive & pick next
            </button>
          ) : null}
        </div>
      </div>

      <section className="panel">
        <h2>Ratings</h2>
        <ul className="ratings">
          {MEMBERS.map((member) => {
            const value = getRating(member)
            return (
              <li key={member} className="ratings__row">
                <span className="ratings__name">{member}</span>
                {canEdit ? (
                  <label className="ratings__edit">
                    <span className="sr-only">Rating for {member}</span>
                    <input
                      type="number"
                      min={0}
                      max={10}
                      step={1}
                      inputMode="numeric"
                      value={value ?? ''}
                      disabled={saving}
                      placeholder="—"
                      onChange={(e) => {
                        const raw = e.target.value
                        if (raw === '') {
                          onSaveRating(member, null)
                          return
                        }
                        const n = Number(raw)
                        if (Number.isNaN(n)) return
                        onSaveRating(member, Math.min(10, Math.max(0, Math.round(n))))
                      }}
                    />
                    <span>/10</span>
                  </label>
                ) : (
                  <span className="ratings__score">
                    {value == null ? '—' : `${value}/10`}
                  </span>
                )}
              </li>
            )
          })}
        </ul>
      </section>

      <section className="panel">
        <h2>From the chooser</h2>
        {canEdit ? (
          <div className="chooser-form">
            <label className="field">
              <span>Favorite character</span>
              <input
                value={favoriteCharacter}
                disabled={saving}
                onChange={(e) => setFavoriteCharacter(e.target.value)}
              />
            </label>
            <label className="field">
              <span>Least favorite character</span>
              <textarea
                rows={3}
                value={leastFavoriteCharacter}
                disabled={saving}
                onChange={(e) => setLeastFavoriteCharacter(e.target.value)}
              />
            </label>
            <label className="field">
              <span>Meaningful quote</span>
              <textarea
                rows={3}
                value={quote}
                disabled={saving}
                onChange={(e) => setQuote(e.target.value)}
              />
            </label>
            <label className="field">
              <span>Surprising plot point</span>
              <textarea
                rows={3}
                value={plotPoint}
                disabled={saving}
                onChange={(e) => setPlotPoint(e.target.value)}
              />
            </label>
            <label className="field">
              <span>Did you like the ending?</span>
              <textarea
                rows={3}
                value={endingOpinion}
                disabled={saving}
                onChange={(e) => setEndingOpinion(e.target.value)}
              />
            </label>
            <fieldset className="field field--stack">
              <legend>Discussion questions (up to 5)</legend>
              {questions.map((q, i) => (
                <input
                  key={i}
                  value={q}
                  disabled={saving}
                  onChange={(e) => {
                    const next = [...questions]
                    next[i] = e.target.value
                    setQuestions(next)
                  }}
                />
              ))}
            </fieldset>
            <button type="button" className="btn" disabled={saving} onClick={saveNotes}>
              {saving ? 'Saving…' : 'Save chooser notes'}
            </button>
          </div>
        ) : (
          <div className="chooser-view">
            <ChooserBlock label="Favorite character" value={book.favorite_character} />
            <ChooserBlock
              label="Least favorite character"
              value={book.least_favorite_character ?? ''}
            />
            <ChooserBlock label="Meaningful quote" value={book.meaningful_quote} quote />
            <ChooserBlock label="Surprising plot point" value={book.surprising_plot_point} />
            <ChooserBlock label="Did you like the ending?" value={book.ending_opinion ?? ''} />
            <div>
              <h3>Discussion questions</h3>
              {filledQuestions.length === 0 ? (
                <p className="muted">Not added yet.</p>
              ) : (
                <ol className="questions">
                  {filledQuestions.map((q) => (
                    <li key={q}>{q}</li>
                  ))}
                </ol>
              )}
            </div>
          </div>
        )}
      </section>
    </article>
  )
}

function ChooserBlock({
  label,
  value,
  quote = false,
}: {
  label: string
  value: string
  quote?: boolean
}) {
  if (!value.trim()) {
    return (
      <div>
        <h3>{label}</h3>
        <p className="muted">Not added yet.</p>
      </div>
    )
  }
  return (
    <div>
      <h3>{label}</h3>
      {quote ? <blockquote>{value}</blockquote> : <p>{value}</p>}
    </div>
  )
}
