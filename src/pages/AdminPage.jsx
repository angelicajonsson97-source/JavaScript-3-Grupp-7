import { useState, useEffect } from 'react'
import { ProtectedRoute } from '../context/AuthContext'
import {
  getUsers, deleteUser,
  getRecipes, deleteRecipe,
  getComments, deleteComment,
} from '../services/strapiApi'

// Amir Hemmatnia — Admin panel med flikar för användare, recept och kommentarer.
// Kräver inloggad admin-användare (adminOnly via ProtectedRoute).

const TABS = ['Användare', 'Recept', 'Kommentarer']

export default function AdminPage() {
  const [tab, setTab] = useState(0)
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // active flag: förhindrar setState efter unmount (t.ex. snabb flikbyte = race condition)
    let active = true
    setLoading(true)
    setError('')

    // Array av funktioner indexerade efter aktiv flik (0=användare, 1=recept, 2=kommentarer) — renare än if/else
    const fetchers = [
      () => getUsers(query),
      () => getRecipes(query),
      () => getComments(query),
    ]

    fetchers[tab]()
      .then(res => {
        if (!active) return
        // Strapi v4 returnerar { data: [] }, v5 returnerar en vanlig array — hanterar båda
        setData(Array.isArray(res) ? res : (res.data ?? []))
      })
      .catch(err => {
        if (!active) return
        setError(err.message)
        setData([])
      })
      .finally(() => { if (active) setLoading(false) })

    return () => { active = false }
  }, [tab, query])

  function handleSearch(e) {
    e.preventDefault()
    setQuery(search)
  }

  function handleTabChange(i) {
    setTab(i)
    setSearch('')
    setQuery('')
    setData([])
  }

  async function handleDelete(id) {
    if (!confirm('Är du säker?')) return
    try {
      // Samma index-trick som fetchers — väljer rätt delete-funktion baserat på aktiv flik
      const deleters = [deleteUser, deleteRecipe, deleteComment]
      await deleters[tab](id)
      // Ta bort posten lokalt utan att hämta om hela listan
      setData(prev => prev.filter(item => item.id !== id))
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <ProtectedRoute adminOnly> {/* adminOnly utan värde = adminOnly={true} */}
      <div className="admin-page">
        <div className="admin-header">
          <h1>Adminpanel</h1>
          <p>Sök, granska och ta bort användare, recept och kommentarer.</p>
        </div>

        <form className="search-bar" onSubmit={handleSearch}>
          <input
            type="search"
            placeholder={`Sök ${TABS[tab].toLowerCase()}...`}
            value={search}
            onChange={e => setSearch(e.target.value)}
            aria-label={`Sök ${TABS[tab]}`}
          />
          <button type="submit" className="btn btn-primary">Sök</button>
          {query && (
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => { setSearch(''); setQuery('') }}
            >
              Rensa
            </button>
          )}
        </form>

        <div className="tab-bar" role="tablist">
          {TABS.map((label, i) => (
            <button
              key={label}
              role="tab"
              aria-selected={tab === i}
              className={`tab-btn${tab === i ? ' active' : ''}`}
              onClick={() => handleTabChange(i)}
            >
              {label}
            </button>
          ))}
        </div>

        {loading && <div className="state-loading">Laddar...</div>}
        {!loading && error && <div className="state-error">{error}</div>}
        {!loading && !error && data.length === 0 && (
          <div className="state-empty">
            {query ? `Inga ${TABS[tab].toLowerCase()} matchade "${query}".` : `Inga ${TABS[tab].toLowerCase()} hittades.`}
          </div>
        )}

        {!loading && !error && data.length > 0 && (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  {tab === 0 && <><th>ID</th><th>Användarnamn</th><th>E-post</th><th>Roll</th><th></th></>}
                  {tab === 1 && <><th>ID</th><th>Titel</th><th>Skapad av</th><th>Skapad</th><th></th></>}
                  {tab === 2 && <><th>ID</th><th>Kommentar</th><th>Av</th><th>Recept</th><th></th></>}
                </tr>
              </thead>
              <tbody>
                {data.map(item => (
                  <tr key={item.id}>
                    {tab === 0 && (
                      <>
                        <td className="cell-muted">{item.id}</td>
                        <td>{item.username}</td>
                        <td>{item.email}</td>
                        <td className="cell-muted">{item.role?.name ?? '—'}</td>
                      </>
                    )}
                    {tab === 1 && (
                      <>
                        <td className="cell-muted">{item.id}</td>
                        <td>{item.title ?? item.attributes?.title ?? '—'}</td>
                        <td className="cell-muted">
                          {item.author?.username ?? item.attributes?.author?.data?.attributes?.username ?? '—'}
                        </td>
                        <td className="cell-muted">
                          {new Date(item.createdAt ?? item.attributes?.createdAt).toLocaleDateString('sv-SE')}
                        </td>
                      </>
                    )}
                    {tab === 2 && (
                      <>
                        <td className="cell-muted">{item.id}</td>
                        <td>{(item.content ?? item.attributes?.content ?? '').slice(0, 80)}</td>
                        <td className="cell-muted">
                          {item.author?.username ?? item.attributes?.author?.data?.attributes?.username ?? '—'}
                        </td>
                        <td className="cell-muted">
                          {item.recipe?.title ?? item.attributes?.recipe?.data?.attributes?.title ?? '—'}
                        </td>
                      </>
                    )}
                    <td>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleDelete(item.id)}
                        aria-label={`Ta bort ${TABS[tab].slice(0, -2)} ${item.id}`}
                      >
                        Ta bort
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}

// Statisk property på komponenten — hämtas av auto-routing-systemet (import.meta.glob)
AdminPage.route = { path: '/admin', index: 4 }