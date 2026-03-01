import { createFileRoute } from '@tanstack/react-router'
import { Landing } from "@/components/Landing"
import { FloatingMenu } from "@/components/FloatingMenu"

export const Route = createFileRoute('/')({
    component: HomePage,
})

function HomePage() {
    return (
        <div className="relative min-h-screen">
          
            <Landing />
        </div>
    )
}
