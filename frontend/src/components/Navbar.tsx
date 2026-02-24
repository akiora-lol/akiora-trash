import { MenuIcon } from 'lucide-react'
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

import Logo from '@/components/Logo';

type NavigationItem = {
    title: string
    href: string
}[]

const Navbar = ({ navigationData }: { navigationData: NavigationItem }) => {
    return (
        <header className='bg-transparent sticky  top-0 z-50'>
            <div className='mx-auto flex max-w-7xl items-center justify-between gap-8 px-4 py-7 sm:px-6'>
                <div className='text-muted-foreground flex flex-1 items-center gap-8 font-medium md:justify-center lg:gap-16'>
                    <Link to="/" className='hover:text-primary max-md:hidden'>
                        Home
                    </Link>
                    <Link to="/login" className='hover:text-primary max-md:hidden'>
                        Login
                    </Link>
                    <Link to="/profile/$id" params={{ id: 'zxcv' }} className='hover:text-primary max-md:hidden'>
                        Profile
                    </Link>
                    <a href='#'>
                        <Logo className='text-foreground gap-3' size='5vmin' />
                    </a>
                    <a href='#' className='hover:text-primary max-md:hidden'>
                        About Us
                    </a>
                    <a href='#' className='hover:text-primary max-md:hidden'>
                        Contacts
                    </a>
                    <Link to="/profile/$id" params={{ id: 'zxcv' }} className='hover:text-primary max-md:hidden'>
                        Profile
                    </Link>
                </div>

                <div className='flex items-center gap-6'>

                    <DropdownMenu>
                        <DropdownMenuTrigger className='md:hidden' asChild>
                            <Button variant='outline' size='icon'>
                                <MenuIcon />
                                <span className='sr-only'>Menu</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className='w-56' align='end'>
                            <DropdownMenuGroup>
                                {navigationData.map((item, index) => (
                                    <DropdownMenuItem key={index}>
                                        <a href={item.href}>{item.title}</a>
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    )
}

export default Navbar
