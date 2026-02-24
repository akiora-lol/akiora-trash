import { FloatingDock } from "@/components/ui/floating-dock";
import { Home, Github, Twitter } from "lucide-react";
import { FaRegUser } from "react-icons/fa";
import { FaRegMessage, FaRegBell } from "react-icons/fa6";
import { MdOutlineSettings } from "react-icons/md";
import Logo from '@/components/Logo';
export function FloatingMenu() {
    const links = [
        {
            title: "Home",
            icon: <Logo rotationSpeed={10} className="h-full w-full" />,
            href: "/",
        },
        {
            title: "Profile",
            icon: <FaRegUser className="h-full w-full" />,
            href: "/profile/me",
        },
        {
            title: "Messenger",
            icon: <FaRegMessage className="h-full w-full" />,
            href: "/messenger",
        },
        {
            title: "Notifications",
            icon: <FaRegBell className="h-full w-full" />,
            href: "/",
        },
        {
            title: "Settings",
            icon: <MdOutlineSettings className="h-full w-full" />,
            href: "/settings",
        },
    ];

    return (

        <FloatingDock
            mobileClassName="fixed bottom-4 right-4"
            desktopClassName="fixed "
            items={links} />

    );
}
