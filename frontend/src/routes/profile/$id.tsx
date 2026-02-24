import { createFileRoute } from '@tanstack/react-router';
import { useAuth } from '@/contexts/AuthContext';
export const Route = createFileRoute('/profile/$id')({
    component: RouteComponent,
})

function RouteComponent() {
    const { user } = useAuth();
    console.log(user);
    const { id } = Route.useParams();
    return <div>Hello  "/profile/{id}"!</div>
}
