import * as React from 'react'
import { Outlet, createRootRoute } from '@tanstack/react-router'
import Navbar from '@/components/Navbar'
import { DataCard } from '@/components/data-card'
import { AnimatedProfileMenu } from '@/components/Icon'
import { BackgroundCircles } from '@/components/ui/circles'
import Logo from '@/components/Logo'
import { FloatingMenu } from '@/components/FloatingMenu'


const navigationData = [
  {
    title: 'Home',
    href: '#'
  },
  {
    title: 'Products',
    href: '#'
  },
  {
    title: 'About Us',
    href: '#'
  },
  {
    title: 'Contacts',
    href: '#'
  }
]
export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  return (
    <React.Fragment>
     
        
        <Navbar  navigationData={navigationData}/>
         <Outlet />
        <BackgroundCircles className='fixed -z-10'/>
        <FloatingMenu/>
    
        
          

  
    </React.Fragment>
  )
}
