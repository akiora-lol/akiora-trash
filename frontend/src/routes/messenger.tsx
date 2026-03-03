import { Messenger } from '@/components/Messenger'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/messenger')({
    component: Messenger,
})

function RouteComponent() {
    return <div>Hello "/messenger"!</div>
}
