import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import AdminPage from './AdminPage'
import * as strapiApi from '../services/strapiApi'

// Mocka API-anropen för att köra testerna isolerat utan en riktig Strapi-instans
vi.mock('../services/strapiApi', () => ({
  getUsers: vi.fn(),
  deleteUser: vi.fn(),
  getRecipes: vi.fn(),
  deleteRecipe: vi.fn(),
  getComments: vi.fn(),
  deleteComment: vi.fn(),
  getAdminStats: vi.fn(),
}))

// Mocka inloggningskontexten (AuthContext) samt ProtectedRoute för att simulera en inloggad admin
vi.mock('../context/AuthContext', () => {
  return {
    useAuth: () => ({
      user: { id: 1, username: 'adminUser', role: { type: 'admin' } },
      loading: false,
    }),
    ProtectedRoute: ({ children }) => children, // Släpper igenom alla under testkörning
  }
})

describe('AdminPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Förbered standard-returvärden (mock-responses) för API-funktionerna
    strapiApi.getAdminStats.mockResolvedValue({
      totalRecipes: 10,
      totalComments: 5,
      totalUsers: 3,
      mostActiveUsers: [{ id: 1, username: 'activeUser', commentsCount: 4 }]
    })

    strapiApi.getUsers.mockResolvedValue([
      { id: 1, username: 'user1', email: 'user1@example.com', role: { name: 'Authenticated' } }
    ])
    strapiApi.getRecipes.mockResolvedValue([
      { id: 1, title: 'Meatballs', createdAt: '2026-07-01T00:00:00Z', author: { username: 'chef' } }
    ])
    strapiApi.getComments.mockResolvedValue([
      { id: 1, content: 'Delicious!', author: { username: 'user1' }, recipe: { title: 'Meatballs' } }
    ])
  })

  it('renders the admin page header and stats correctly', async () => {
    render(<AdminPage />)

    // Verify header title
    expect(screen.getByText('Adminpanel')).toBeInTheDocument()

    // Verify stats are loaded and rendered
    await waitFor(() => {
      expect(screen.getByText(/Totala recept:/)).toBeInTheDocument()
      expect(screen.getByText('10')).toBeInTheDocument()
      expect(screen.getByText(/Totala kommentarer:/)).toBeInTheDocument()
      expect(screen.getByText('5')).toBeInTheDocument()
      expect(screen.getByText(/Registrerade användare:/)).toBeInTheDocument()
      expect(screen.getByText('3')).toBeInTheDocument()
      expect(screen.getByText(/activeUser \(4\)/)).toBeInTheDocument()
    })
  })

  it('loads users list by default and allows tab switching', async () => {
    render(<AdminPage />)

    // Wait for the default users tab data to load
    await waitFor(() => {
      expect(screen.getByText('user1')).toBeInTheDocument()
      expect(screen.getByText('user1@example.com')).toBeInTheDocument()
    })

    // Switch to Recipes tab
    const recipesTab = screen.getByRole('tab', { name: 'Recept' })
    fireEvent.click(recipesTab)

    // Wait for recipe data to load
    await waitFor(() => {
      expect(screen.getByText('Meatballs')).toBeInTheDocument()
      expect(screen.getByText('chef')).toBeInTheDocument()
    })
  })

  it('allows searching within the active tab', async () => {
    render(<AdminPage />)

    // Search for a user
    const searchInput = screen.getByLabelText('Sök Användare')
    fireEvent.change(searchInput, { target: { value: 'user1' } })

    const searchButton = screen.getByRole('button', { name: 'Sök' })
    fireEvent.click(searchButton)

    await waitFor(() => {
      expect(strapiApi.getUsers).toHaveBeenCalledWith('user1')
    })
  })

  it('handles delete action for a user', async () => {
    // Mock confirm dialog to return true
    const confirmSpy = vi.spyOn(window, 'confirm').mockImplementation(() => true)
    strapiApi.deleteUser.mockResolvedValue({})

    render(<AdminPage />)

    await waitFor(() => {
      expect(screen.getByText('user1')).toBeInTheDocument()
    })

    const deleteButton = screen.getByLabelText('Ta bort Använda 1')
    fireEvent.click(deleteButton)

    await waitFor(() => {
      expect(confirmSpy).toHaveBeenCalled()
      expect(strapiApi.deleteUser).toHaveBeenCalledWith(1)
      // The user row should be removed from the DOM
      expect(screen.queryByText('user1')).not.toBeInTheDocument()
    })

    confirmSpy.mockRestore()
  })
})
