import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Menu } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DashboardNavbarProps {
  toggleSidebar?: () => void;
  title?: string;
}

export default function DashboardNavbar({ toggleSidebar, title = "Dashboard" }: DashboardNavbarProps) {
  const { user, logoutMutation } = useAuth();
  
  if (!user) return null;
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  // Get user initials for avatar fallback
  const getInitials = () => {
    if (!user.name) return "U";
    
    const names = user.name.split(" ");
    if (names.length === 1) return names[0][0];
    return `${names[0][0]}${names[names.length - 1][0]}`;
  };
  
  return (
    <div className="sticky top-0 z-10 bg-white shadow-sm">
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <button
            type="button"
            onClick={toggleSidebar}
            className="md:hidden text-slate-500 hover:text-slate-700 focus:outline-none"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-semibold text-slate-800 ml-2 md:ml-0">{title}</h1>
        </div>
        
        <div className="flex items-center">
          <Link href={`/${user.username}`} className="text-sm text-slate-600 hover:text-primary mr-4 hidden md:block">
            View Public Portfolio
          </Link>
          
          <DropdownMenu>
            <DropdownMenuTrigger className="focus:outline-none">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.profileImage} alt={user.name} />
                <AvatarFallback>{getInitials()}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/profile">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/${user.username}`}>View Public Portfolio</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} disabled={logoutMutation.isPending}>
                {logoutMutation.isPending ? "Logging out..." : "Logout"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
