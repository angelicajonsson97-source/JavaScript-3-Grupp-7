import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Nav() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <nav id="navbar">
      <Link to="/" className="nav-brand">Receptsamling</Link>

      {/* hamburger — mobile only */}
      <button
        className="nav-hamburger"
        aria-label="Öppna meny"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen(o => !o)}
      >
        <span /><span /><span />
      </button>

      <div className={`nav-links${menuOpen ? ' open' : ''}`}>
        <Link to="/" className="nav-link" onClick={() => setMenuOpen(false)}>Recept</Link>
        {user && (
          <Link to="/nytt-recept" className="nav-link" onClick={() => setMenuOpen(false)}>
            Lägg till
          </Link>
        )}
        {user?.role?.type === 'admin' && (
          <Link to="/admin" className="nav-link" onClick={() => setMenuOpen(false)}>Admin</Link>
        )}
        {user ? (
          <button className="btn btn-ghost" onClick={handleLogout}>Logga ut</button>
        ) : (
          <Link to="/login" className="btn btn-primary" onClick={() => setMenuOpen(false)}>
            Logga in
          </Link>
        )}
      </div>
    </nav>
  )
}