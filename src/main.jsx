import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'

import App from './App.jsx'
import routes from './routes'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: routes
  }
])

createRoot(document.querySelector('#root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
