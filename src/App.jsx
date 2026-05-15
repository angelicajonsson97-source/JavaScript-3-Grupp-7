import { Outlet } from 'react-router'
import { AuthProvider } from './context/AuthContext'
import Nav from './components/Nav'
import './css/index.css'
import './css/app-layout.css'

export default function App() {
  return (
    <AuthProvider>
      <Nav />
      <main className="main-content">
        <Outlet />
      </main>
    </AuthProvider>
  )
}
