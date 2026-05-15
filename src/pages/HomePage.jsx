import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getRecipes } from '../services/strapiApi'

const MOCK_RECIPES = [
  { id: 1, title: 'Pasta Carbonara', difficulty: 'Medium', prepTime: 10, cookTime: 20, attributes: null },
  { id: 2, title: 'Köttbullar', difficulty: 'Easy', prepTime: 20, cookTime: 30, attributes: null },
  { id: 3, title: 'Laxsoppa', difficulty: 'Easy', prepTime: 15, cookTime: 25, attributes: null },
]

export default function HomePage() {
  const [recipes, setRecipes] = useState([])
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [isMock, setIsMock] = useState(false)

  useEffect(() => {
    // active-flagga förhindrar setState efter att komponenten avmonterats
    let active = true
    setLoading(true)
    getRecipes(query)
      .then(res => {
        if (!active) return
        // Strapi v4 returnerar { data: [...] }, v5 returnerar array direkt
        const list = Array.isArray(res) ? res : (res.data ?? [])
        setRecipes(list)
        setIsMock(false)
      })
      .catch(() => {
        // Strapi ej tillgänglig — visa exempeldata istället för tom sida
        if (!active) return
        setRecipes(MOCK_RECIPES)
        setIsMock(true)
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [query])

  function handleSearch(e) {
    e.preventDefault()
    setQuery(search)
  }

  function getTitle(r) {
    return r.title ?? r.attributes?.title ?? '—'
  }
  function getDifficulty(r) {
    return r.difficulty ?? r.attributes?.difficulty ?? '—'
  }
  function getPrepTime(r) {
    return r.prepTime ?? r.attributes?.prepTime ?? '?'
  }
  function getCookTime(r) {
    return r.cookTime ?? r.attributes?.cookTime ?? '?'
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Recept</h1>
        {isMock && (
          <p className="demo-banner">Strapi ej ansluten — visar exempeldata</p>
        )}
      </div>

      <form className="search-bar" onSubmit={handleSearch}>
        <input
          type="search"
          placeholder="Sök recept..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <button type="submit" className="btn btn-primary">Sök</button>
        {query && (
          <button type="button" className="btn btn-ghost" onClick={() => { setSearch(''); setQuery('') }}>
            Rensa
          </button>
        )}
      </form>

      {loading && <div className="state-loading">Laddar recept...</div>}

      {!loading && recipes.length === 0 && (
        <div className="state-empty">Inga recept hittades.</div>
      )}

      {!loading && recipes.length > 0 && (
        <div className="recipe-grid">
          {recipes.map(r => (
            <Link to={`/recept/${r.id}`} key={r.id} className="recipe-card">
              <div className="recipe-card-body">
                <h2>{getTitle(r)}</h2>
                <div className="recipe-meta">
                  <span>{getDifficulty(r)}</span>
                  <span>{getPrepTime(r) + getCookTime(r)} min</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

HomePage.route = { path: '/', index: 1 }
