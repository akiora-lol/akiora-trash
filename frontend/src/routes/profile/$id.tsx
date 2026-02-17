import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/profile/$id')({
  component: RouteComponent,
})

function RouteComponent() {

    const {id} = Route.useParams();
  return <div>Hello "/profile/{id}"!</div>
}
