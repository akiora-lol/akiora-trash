import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n/config'
import App from './App_test.tsx'
import { AuthProvider } from './lib/auth-context'
// Импортируем сгенерированное дерево маршрутов
import { routeTree } from './routeTree.gen'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
// Создаем роутер
const router = createRouter({ routeTree })

// Регистрируем роутер для типобезопасности (TypeScript)
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
const rootElement = document.getElementById('root')!
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  )
}
