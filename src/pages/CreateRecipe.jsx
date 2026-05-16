import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:1337'

const CreateRecipe = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    title: '',
    slug: '',
    description: '',
    cook_time_minutes: '',
    servings: '',
    difficulty: 'easy',
    image: null,
  })
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (event) => {
    setForm((prev) => ({ ...prev, image: event.target.files?.[0] ?? null }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setStatus('Saving recipe...')

    try {
      const slugValue = form.slug.trim() || form.title.trim()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')

      const payload = {
        title: form.title,
        slug: slugValue,
        description: form.description,
        cook_time_minutes: form.cook_time_minutes ? Number(form.cook_time_minutes) : null,
        servings: form.servings ? Number(form.servings) : null,
        difficulty: form.difficulty,
      }

      const body = new FormData()
      body.append('data', JSON.stringify(payload))
      if (form.image) {
        body.append('files.image_url', form.image)
      }

      const response = await fetch(`${API_BASE_URL}/api/recipes`, {
        method: 'POST',
        body,
      })

      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to create recipe')
      }

      setStatus('Recipe created successfully!')
      navigate('/')
    } catch (submitError) {
      setStatus('')
      setError(submitError.message || 'Something went wrong')
    }
  }

  return (
    <section style={{ maxWidth: 700, margin: '0 auto', padding: '1.5rem' }}>
      <h1>Create a new recipe</h1>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
        <label>
          Title
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Slug
          <input
            type="text"
            name="slug"
            value={form.slug}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Description
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            required
            rows={6}
          />
        </label>

        <label>
          Cook time (minutes)
          <input
            type="number"
            name="cook_time_minutes"
            value={form.cook_time_minutes}
            onChange={handleChange}
            min="0"
          />
        </label>

        <label>
          Servings
          <input
            type="number"
            name="servings"
            value={form.servings}
            onChange={handleChange}
            min="1"
          />
        </label>

        <label>
          Difficulty
          <select name="difficulty" value={form.difficulty} onChange={handleChange}>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </label>

        <label>
          Recipe image
          <input type="file" accept="image/*" onChange={handleFileChange} />
        </label>

        <button type="submit">Create recipe</button>
      </form>

      {status && <p style={{ color: 'green' }}>{status}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </section>
  )
}

export default CreateRecipe

CreateRecipe.route = {
  path : '/create',
  label : 'Create Recipe',
  index: true
}
