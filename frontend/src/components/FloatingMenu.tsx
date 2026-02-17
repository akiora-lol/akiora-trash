import { FloatingDock } from "@/components/ui/floating-dock";
import { Home, Github, Twitter } from "lucide-react";
import { FaRegUser  } from "react-icons/fa";
import { FaRegMessage , FaRegBell  } from "react-icons/fa6";

export function FloatingMenu() {
  const links = [
    {
      title: "Home",
      icon: <Home className="h-full w-full" />,
      href: "/",
    },
    {
      title: "Profile",
      icon: <FaRegUser className="h-full w-full" />,
      href: "/profile/me",
    },
    {
      title: "Chats",
      icon: <FaRegMessage className="h-full w-full" />,
      href: "/chats",
    },
    {
      title: "Notifications",
      icon: <FaRegBell className="h-full w-full" />,
      href: "/chats",
    },
  ];

  return (
   
      <FloatingDock 
      mobileClassName="fixed bottom-4 right-4"
       desktopClassName="fixed bottom-4 right-1 -translate-x-1/2"
      items={links} />
 
  );
}
