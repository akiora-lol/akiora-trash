import { StrictMode } from 'react'

import './index.css'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { routeTree } from './routeTree.gen'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { AuthProvider } from '@/contexts/AuthContext'
// Создаем роутер
const router = createRouter({ routeTree })
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,                    // Количество повторов при ошибке
            staleTime: 5 * 60 * 1000,    // Данные считаются свежими 5 минут
            gcTime: 10 * 60 * 1000,       // Время хранения в кэше (было cacheTime)
            refetchOnWindowFocus: false,  // Не перезапрашивать при фокусе окна
            refetchOnReconnect: true,     // Перезапрашивать при восстановлении сети
        },
        mutations: {
            retry: 1,                     // Повторы для мутаций
        },
    },
})

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
            <QueryClientProvider client={queryClient}>
                <AuthProvider>
                    <RouterProvider router={router} />
                </AuthProvider>
            </QueryClientProvider>
        </StrictMode>,
    )
}
