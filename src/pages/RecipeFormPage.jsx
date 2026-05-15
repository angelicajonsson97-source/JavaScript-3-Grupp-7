import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createRecipe } from '../services/strapiApi'

const DIFFICULTIES = ['Easy', 'Medium', 'Hard']

export default function RecipeFormPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    title: '', description: '', ingredients: '',
    instructions: '', difficulty: 'Easy', prepTime: '', cookTime: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await createRecipe(form)
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page" style={{ maxWidth: '600px' }}>
      <h1>Nytt recept</h1>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Titel</label>
          <input name="title" value={form.title} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Beskrivning</label>
          <textarea name="description" rows={2} value={form.description} onChange={handleChange} style={{ resize: 'vertical' }} />
        </div>
        <div className="form-group">
          <label>Ingredienser</label>
          <textarea name="ingredients" rows={4} value={form.ingredients} onChange={handleChange} required style={{ resize: 'vertical' }} />
        </div>
        <div className="form-group">
          <label>Instruktioner</label>
          <textarea name="instructions" rows={5} value={form.instructions} onChange={handleChange} required style={{ resize: 'vertical' }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
          <div className="form-group">
            <label>Svårighetsgrad</label>
            <select name="difficulty" value={form.difficulty} onChange={handleChange} style={{ padding: '8px 12px', border: '1px solid var(--border)', borderRadius: '6px', background: 'var(--bg)', color: 'var(--text-h)', fontSize: '0.9rem' }}>
              {DIFFICULTIES.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Förberedelse (min)</label>
            <input name="prepTime" type="number" min="0" value={form.prepTime} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Tillagning (min)</label>
            <input name="cookTime" type="number" min="0" value={form.cookTime} onChange={handleChange} required />
          </div>
        </div>

        {error && <p className="form-error">{error}</p>}

        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Sparar...' : 'Spara recept'}
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>
            Avbryt
          </button>
        </div>
      </form>
    </div>
  )
}

RecipeFormPage.route = { path: '/nytt-recept', index: 5 }
