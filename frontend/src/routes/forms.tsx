import { WizardForm } from '@/components/MultiStepForm'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/forms')({
    component: WizardForm,
})

function RouteComponent() {
    return <div>Hello "/forms"!</div>
}
