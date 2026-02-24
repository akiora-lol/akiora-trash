import { createFileRoute } from '@tanstack/react-router'
import { NewsFeed } from '@/components/NewsFeed'
export const Route = createFileRoute('/welcome')({
    component: NewsFeed,
})

