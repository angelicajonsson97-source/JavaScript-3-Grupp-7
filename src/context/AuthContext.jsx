import { createContext, useContext, useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { getMe, logout as apiLogout } from '../services/strapiApi'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Kontrollera om det finns ett sparat JWT vid sidladdning
    const token = localStorage.getItem('jwt')
    if (!token) {
      setLoading(false)
      return
    }
    // Hämta inloggad användare — om token är ogiltig tas den bort automatiskt
    getMe()
      .then(setUser)
      .catch(() => localStorage.removeItem('jwt'))
      .finally(() => setLoading(false))
  }, [])

  function logout() {
    apiLogout()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, setUser, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

export function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="page-loading">Laddar...</div>
  if (!user) return <Navigate to="/login" replace />
  if (adminOnly && user.role?.type !== 'admin') return <Navigate to="/" replace />
  return children
}
