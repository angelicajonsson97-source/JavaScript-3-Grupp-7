import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getRecipeById, getComments, createComment } from '../services/strapiApi'
import { useAuth } from '../context/AuthContext'

const MOCK_RECIPE = {
  id: 1,
  title: 'Pasta Carbonara',
  description: 'En klassisk italiensk pasta.',
  ingredients: 'Pasta, ägg, pancetta, parmesan, svartpeppar',
  instructions: '1. Koka pasta.\n2. Stek pancetta.\n3. Blanda ägg och ost.\n4. Blanda allt.',
  difficulty: 'Medium',
  prepTime: 10,
  cookTime: 20,
}

export default function RecipePage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [recipe, setRecipe] = useState(null)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [isMock, setIsMock] = useState(false)

  useEffect(() => {
    let active = true
    setLoading(true)
    getRecipeById(id)
      .then(res => {
        if (!active) return
        setRecipe(res.data ?? res)
        setIsMock(false)
      })
      .catch(() => {
        if (!active) return
        setRecipe(MOCK_RECIPE)
        setIsMock(true)
      })
      .finally(() => { if (active) setLoading(false) })

    getComments('', id).then(res => {
      if (!active) return
      setComments(Array.isArray(res) ? res : (res.data ?? []))
    }).catch(() => {})

    return () => { active = false }
  }, [id])

  async function handleComment(e) {
    e.preventDefault()
    if (!newComment.trim()) return
    try {
      const c = await createComment(id, newComment)
      setComments(prev => [...prev, c.data ?? c])
      setNewComment('')
    } catch (err) {
      alert(err.message)
    }
  }

  function get(field) {
    return recipe?.[field] ?? recipe?.attributes?.[field] ?? '—'
  }

  if (loading) return <div className="page-loading">Laddar recept...</div>
  if (!recipe) return <div className="page"><div className="state-error">Receptet hittades inte.</div></div>

  return (
    <div className="page">
      <button className="btn btn-ghost" style={{ marginBottom: '16px' }} onClick={() => navigate(-1)}>
        ← Tillbaka
      </button>

      {isMock && <p className="demo-banner">Strapi ej ansluten — visar exempeldata</p>}

      <h1>{get('title')}</h1>
      <div className="recipe-meta" style={{ marginBottom: '24px' }}>
        <span>{get('difficulty')}</span>
        <span>Prep: {get('prepTime')} min</span>
        <span>Tillagning: {get('cookTime')} min</span>
      </div>

      <p style={{ marginBottom: '24px' }}>{get('description')}</p>

      <h2>Ingredienser</h2>
      <p style={{ whiteSpace: 'pre-line', marginBottom: '24px' }}>{get('ingredients')}</p>

      <h2>Instruktioner</h2>
      <p style={{ whiteSpace: 'pre-line', marginBottom: '32px' }}>{get('instructions')}</p>

      <h2>Kommentarer ({comments.length})</h2>

      {comments.length === 0 && (
        <div className="state-empty" style={{ marginBottom: '16px' }}>Inga kommentarer än.</div>
      )}

      {comments.map(c => (
        <div key={c.id} className="comment-card">
          <span className="cell-muted">{c.author?.username ?? c.attributes?.author?.data?.attributes?.username ?? 'Anonym'}</span>
          <p>{c.content ?? c.attributes?.content}</p>
        </div>
      ))}

      {user ? (
        <form onSubmit={handleComment} style={{ marginTop: '16px' }}>
          <div className="form-group">
            <label htmlFor="comment">Lägg till kommentar</label>
            <textarea
              id="comment"
              rows={3}
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              style={{ resize: 'vertical' }}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary">Skicka</button>
        </form>
      ) : (
        <p className="cell-muted" style={{ marginTop: '12px' }}>
          <a href="/login">Logga in</a> för att kommentera.
        </p>
      )}
    </div>
  )
}
