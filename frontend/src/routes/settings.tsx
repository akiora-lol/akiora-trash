import { GlassProfileSettingsCard } from '@/pages_new/Settings'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/settings')({
    component: RouteComponent,
})

function RouteComponent() {
    return <div className=''><GlassProfileSettingsCard /></div>
}
