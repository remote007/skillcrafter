import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function Navbar() {
  const { user, logoutMutation } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="text-primary font-bold text-xl">ProjectShelf</span>
            </Link>
          </div>
          
          {/* Desktop menu */}
          <div className="hidden md:flex items-center">
            {user ? (
              <>
                <Link href="/dashboard" className="ml-4 px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100">
                  Dashboard
                </Link>
                <div className="ml-4">
                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    disabled={logoutMutation.isPending}
                    className="px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100"
                  >
                    {logoutMutation.isPending ? "Logging out..." : "Logout"}
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Link href="/auth" className="ml-4 px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100">
                  Login
                </Link>
                <Link href="/auth" className="ml-4 px-3 py-2 rounded-md text-sm font-medium bg-primary hover:bg-indigo-700 text-white">
                  Sign Up
                </Link>
              </>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-slate-500 hover:bg-slate-100 focus:outline-none"
              aria-expanded={isMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {user ? (
              <>
                <Link href="/dashboard" className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-100">
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-100"
                >
                  {logoutMutation.isPending ? "Logging out..." : "Logout"}
                </button>
              </>
            ) : (
              <>
                <Link href="/auth" className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-100">
                  Login
                </Link>
                <Link href="/auth" className="block px-3 py-2 rounded-md text-base font-medium bg-primary hover:bg-indigo-700 text-white">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
