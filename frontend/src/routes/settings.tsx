import { GlassProfileSettingsCard } from '@/pages_new/Settings'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/settings')({
  component: GlassProfileSettingsCard,
})

function RouteComponent() {
  return <div>Hello "/settings"!</div>
}
