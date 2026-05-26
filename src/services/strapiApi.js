const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:1337/api'

function getToken() {
  return localStorage.getItem('jwt')
}

function authHeaders() {
  const token = getToken()
  // Returnerar Authorization-header om JWT finns, annars tomt objekt (spread-safe)
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function request(path, options = {}) {
  // Spridningsoperatorn slår ihop Content-Type, auth-header och ev. anropspecifika headers
  // options.headers skriver över authHeaders om samma nyckel finns (t.ex. vid login)
  const res = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...options.headers,
    },
    ...options,
  })
  if (!res.ok) {
    // Försök läsa Strapis felbeskrivning; misslyckas det används HTTP-statuskoden
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error?.message || `Request failed: ${res.status}`)
  }
  return res.json()
}

// Auth
export async function login(identifier, password) {
  const data = await request('/auth/local', {
    method: 'POST',
    body: JSON.stringify({ identifier, password }),
  })
  localStorage.setItem('jwt', data.jwt)
  return data.user
}

export function logout() {
  localStorage.removeItem('jwt')
}

export async function getMe() {
  return request('/users/me?populate=role')
}

// Admin — Users
export async function getUsers(search = '') {
  // $containsi = Strapis skiftlägesokänsliga innehållsfilter (i = case-insensitive)
  const query = search ? `?filters[username][$containsi]=${encodeURIComponent(search)}` : ''
  return request(`/users${query}`)
}

export async function deleteUser(id) {
  return request(`/users/${id}`, { method: 'DELETE' })
}

// Recipes
export async function getRecipes(search = '') {
  // populate=author,category hämtar relationsdata i samma anrop (undviker extra rundresor)
  const query = search
    ? `?filters[title][$containsi]=${encodeURIComponent(search)}&populate=author,category`
    : '?populate=*' //edits by William to have recipe be shown. origin code : "author,category" instead of "*" 
  return request(`/recipes${query}`)
}

export async function getRecipeById(id) {
  return request(`/recipes/${id}?populate=author,category`)
}

export async function createRecipe(data) {
  // Strapi kräver att POST-kroppen wrapas i { data: { ... } } — inte bara objektet direkt
  return request('/recipes', {
    method: 'POST',
    body: JSON.stringify({ data }),
  })
}

export async function deleteRecipe(id) {
  return request(`/recipes/${id}`, { method: 'DELETE' })
}

// Comments
export async function getComments(search = '', recipeId = null) {
  let q = '?populate=*' //edits by William to have recipe be shown. origin code : "author,recipe" instead of "*" 
  // $eq filtrerar exakt recept-ID — används på receptsidan för att bara visa dess kommentarer
  if (recipeId) q += `&filters[recipe][id][$eq]=${recipeId}`
  if (search) q += `&filters[content][$containsi]=${encodeURIComponent(search)}`
  return request(`/comments${q}`)
}

export async function createComment(recipeId, content) {
  // recipe: recipeId skapar relationen till rätt recept i Strapis databas
  return request('/comments', {
    method: 'POST',
    body: JSON.stringify({ data: { content, recipe: recipeId } }),
  })
}

export async function deleteComment(id) {
  return request(`/comments/${id}`, { method: 'DELETE' })
}