import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Home,
  Folder,
  Images,
  LineChart,
  Palette,
  User,
  LogOut
} from "lucide-react";
import { useState } from "react";

export default function DashboardSidebar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  
  if (!user) return null;
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  // Check if current route is active
  const isActive = (path: string) => {
    return location === path || location.startsWith(`${path}/`);
  };
  
  return (
    <>
      {/* Mobile sidebar backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-800 bg-opacity-50 z-20 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={`w-64 bg-slate-800 text-white fixed inset-y-0 left-0 z-30 transform transition-transform duration-200 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-slate-700">
            <div className="flex items-center">
              <Link href="/dashboard" className="text-primary font-bold text-xl">
                ProjectShelf
              </Link>
            </div>
          </div>
          
          <ScrollArea className="flex-1 pt-4 pb-4">
            <nav className="px-2">
              <ul className="space-y-1">
                <li>
                  <Link 
                    href="/dashboard"
                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-md mx-2 ${
                      isActive("/dashboard") && !isActive("/dashboard/case-studies") && !isActive("/dashboard/media") && !isActive("/dashboard/analytics") && !isActive("/dashboard/theme") && !isActive("/dashboard/profile")
                        ? "bg-slate-700 text-white"
                        : "text-slate-300 hover:bg-slate-700 hover:text-white"
                    }`}
                  >
                    <Home className="w-5 h-5 mr-3" />
                    Dashboard Overview
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/dashboard/case-studies"
                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-md mx-2 ${
                      isActive("/dashboard/case-studies")
                        ? "bg-slate-700 text-white"
                        : "text-slate-300 hover:bg-slate-700 hover:text-white"
                    }`}
                  >
                    <Folder className="w-5 h-5 mr-3" />
                    Case Studies
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/dashboard/media"
                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-md mx-2 ${
                      isActive("/dashboard/media")
                        ? "bg-slate-700 text-white"
                        : "text-slate-300 hover:bg-slate-700 hover:text-white"
                    }`}
                  >
                    <Images className="w-5 h-5 mr-3" />
                    Media Library
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/dashboard/analytics"
                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-md mx-2 ${
                      isActive("/dashboard/analytics")
                        ? "bg-slate-700 text-white"
                        : "text-slate-300 hover:bg-slate-700 hover:text-white"
                    }`}
                  >
                    <LineChart className="w-5 h-5 mr-3" />
                    Analytics
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/dashboard/theme"
                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-md mx-2 ${
                      isActive("/dashboard/theme")
                        ? "bg-slate-700 text-white"
                        : "text-slate-300 hover:bg-slate-700 hover:text-white"
                    }`}
                  >
                    <Palette className="w-5 h-5 mr-3" />
                    Theme Settings
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/dashboard/profile"
                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-md mx-2 ${
                      isActive("/dashboard/profile")
                        ? "bg-slate-700 text-white"
                        : "text-slate-300 hover:bg-slate-700 hover:text-white"
                    }`}
                  >
                    <User className="w-5 h-5 mr-3" />
                    Profile
                  </Link>
                </li>
              </ul>
            </nav>
          </ScrollArea>
          
          <div className="p-4 border-t border-slate-700">
            <button
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
              className="flex items-center w-full px-4 py-3 text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-white rounded-md"
            >
              <LogOut className="w-5 h-5 mr-3" />
              {logoutMutation.isPending ? "Logging out..." : "Logout"}
            </button>
          </div>
        </div>
      </aside>
      
      {/* Mobile toggle button */}
      <div className="fixed top-0 left-0 z-20 md:hidden p-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-slate-500 hover:text-slate-700 focus:outline-none"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </>
  );
}
