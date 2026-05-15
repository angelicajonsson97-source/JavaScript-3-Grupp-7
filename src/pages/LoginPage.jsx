import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { login } from '../services/strapiApi'

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { setUser } = useAuth()
  const navigate = useNavigate()

  function handleDevBypass() {
    setUser({ id: 0, username: 'dev-preview', email: 'dev@local', role: { type: 'admin' } })
    navigate('/admin', { replace: true })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login(identifier, password)
      setUser(user)
      navigate('/admin', { replace: true })
    } catch (err) {
      setError(err.message || 'Inloggning misslyckades')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Admin — logga in</h1>
        <p>Receptsamling Grupp 7</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="identifier">E-post eller användarnamn</label>
            <input
              id="identifier"
              type="text"
              value={identifier}
              onChange={e => setIdentifier(e.target.value)}
              autoComplete="username"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Lösenord</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          {error && <p className="form-error">{error}</p>}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center' }}
            disabled={loading}
          >
            {loading ? 'Loggar in...' : 'Logga in'}
          </button>
        </form>

        {/* DEV ONLY — skips login, simulates admin user, disappears in production build */}
        {import.meta.env.DEV && (
          <button
            type="button"
            className="btn btn-ghost"
            style={{ width: '100%', justifyContent: 'center', marginTop: '10px', fontSize: '0.8rem' }}
            onClick={handleDevBypass}
          >
            Dev: hoppa över inloggning
          </button>
        )}
      </div>
    </div>
  )
}

LoginPage.route = { path: '/login', index: 3 }
