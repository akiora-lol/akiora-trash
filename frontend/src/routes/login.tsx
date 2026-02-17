
import { Login } from '@/pages_new/Login'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/login')({
  component: Login,
})

