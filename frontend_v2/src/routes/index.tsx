import { createFileRoute } from '@tanstack/react-router'
import { Landing } from "@/components/Landing"
import { FloatingMenu } from "@/components/FloatingMenu"
import { useWebSocket } from '@/contexts/WebSocketContext'

export const Route = createFileRoute('/')({
    component: HomePage,
})

function HomePage() {
    const { isConnected, lastMessage, sendMessage, error } = useWebSocket();
    console.log(isConnected)
    return (
        <div className="relative min-h-screen">

            <Landing />
        </div>
    )
}
