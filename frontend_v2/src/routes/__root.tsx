import * as React from 'react'
import { Outlet, createRootRoute } from '@tanstack/react-router'
import { BackgroundCircles } from '@/components/BackGroundCircles'
import { FloatingMenu } from '@/components/FloatingMenu'

export const Route = createRootRoute({
    component: RootComponent,
})

function RootComponent() {
    return (
        <React.Fragment>

            <Outlet />
            <FloatingMenu />
            <BackgroundCircles className='fixed -z-10' />
        </React.Fragment>
    )
}
