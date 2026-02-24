import { createFileRoute } from '@tanstack/react-router'
import { useAuth } from '@/contexts/AuthContext'
export const Route = createFileRoute('/profile/me')({
    component: RouteComponent,
})

function RouteComponent() {
    const { user } = useAuth();

    return <div>Hello {user?.nickname}!</div>
}
