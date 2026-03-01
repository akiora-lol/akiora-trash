import { createFileRoute, Link } from '@tanstack/react-router'
import { LoginForm } from "@/components/LoginForm"
import { FloatingMenu } from "@/components/FloatingMenu"

export const Route = createFileRoute('/login')({
    component: LoginPage,
})

function LoginPage() {
    return (
        <div className="relative min-h-screen flex items-center justify-center p-4">
            <FloatingMenu />

            <LoginForm
                onLogin={() => {
                    // TODO: Handle successful login
                    console.log("Logged in")
                }}
            />

            <Link
                to={'/'}
                className="fixed top-6 left-6 text-cyan-200/60 hover:text-cyan-400 transition-colors flex items-center gap-2"
            >
                ← На главную
            </Link>
        </div>
    )
}
