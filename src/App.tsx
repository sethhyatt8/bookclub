import { useEffect, useState } from 'react'
import { BookSearch } from './components/BookSearch'
import { CurrentBook } from './components/CurrentBook'
import { EditPasswordPrompt } from './components/EditPasswordPrompt'
import { useBookclub } from './hooks/useBookclub'
import { isEditUnlocked, lockEditing } from './lib/appAuth'
import { MEMBERS } from './lib/members'
import './App.css'

export default function App() {
  const [canEdit, setCanEdit] = useState(isEditUnlocked)
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false)
  const [picking, setPicking] = useState(false)

  const {
    book,
    ready,
    error,
    saving,
    getRating,
    saveRating,
    saveChooserFields,
    setActiveBook,
  } = useBookclub(true)

  useEffect(() => {
    const sync = () => setCanEdit(isEditUnlocked())
    window.addEventListener('bookclub-edit-unlock', sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener('bookclub-edit-unlock', sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  function stopEditing() {
    lockEditing()
    setCanEdit(false)
    setPicking(false)
  }

  return (
    <div className="app">
      <header className="topbar">
        <nav className="tabs" aria-label="Sections">
          <button type="button" className="tabs__btn tabs__btn--active">
            Current
          </button>
          <button type="button" className="tabs__btn" disabled title="Coming soon">
            Archives
          </button>
        </nav>
        {canEdit ? (
          <button type="button" className="topbar__lock" onClick={stopEditing}>
            Stop editing
          </button>
        ) : (
          <button
            type="button"
            className="topbar__lock"
            onClick={() => setShowPasswordPrompt(true)}
          >
            Edit
          </button>
        )}
      </header>

      <main className="main">
        {error ? (
          <p className="banner banner--error" role="alert">
            {error}
          </p>
        ) : null}

        {!ready ? <p className="muted center">Loading…</p> : null}

        {ready && picking && canEdit ? (
          <BookSearch
            defaultChooser={book?.chooser ?? MEMBERS[0]}
            busy={saving}
            onCancel={() => setPicking(false)}
            onPick={async (hit, chooser) => {
              await setActiveBook({ hit, chooser })
              setPicking(false)
            }}
          />
        ) : null}

        {ready && !picking && book ? (
          <CurrentBook
            book={book}
            canEdit={canEdit}
            saving={saving}
            getRating={getRating}
            onSaveRating={saveRating}
            onSaveChooserFields={saveChooserFields}
            onChangeBook={() => setPicking(true)}
          />
        ) : null}

        {ready && !picking && !book ? (
          <section className="empty">
            <p className="brand">Bellefonte Cafe Book Club</p>
            <h1>No active book yet</h1>
            <p className="muted">
              Unlock editing to pick the club&apos;s current read.
            </p>
            {canEdit ? (
              <button type="button" className="btn" onClick={() => setPicking(true)}>
                Pick a book
              </button>
            ) : (
              <button
                type="button"
                className="btn"
                onClick={() => setShowPasswordPrompt(true)}
              >
                Edit
              </button>
            )}
          </section>
        ) : null}
      </main>

      {showPasswordPrompt ? (
        <EditPasswordPrompt
          onClose={() => setShowPasswordPrompt(false)}
          onUnlocked={() => setCanEdit(true)}
        />
      ) : null}
    </div>
  )
}
