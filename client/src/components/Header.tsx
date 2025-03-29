import { useContext } from "react";
import { Link, useLocation } from "wouter";
import { AppContext } from "@/App";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

export default function Header() {
  const { currentUser, isAuthenticated, setCurrentUser } = useContext(AppContext);
  const [location] = useLocation();

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  };

  const isActive = (path: string) => location === path;

  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="text-primary font-bold text-xl">The Enchanted Co.</span>
            </Link>
            <nav className="hidden sm:ml-10 sm:flex sm:space-x-8">
              <Link
                href="/"
                className={`${
                  isActive("/")
                    ? "border-primary text-primary border-b-2"
                    : "border-transparent text-neutral-600 hover:text-neutral-900 hover:border-neutral-300 border-b-2"
                } px-1 pt-1 font-medium text-sm`}
              >
                Home
              </Link>
              <button 
                onClick={() => window.dispatchEvent(new CustomEvent('open-sitter-request'))}
                className="border-transparent text-neutral-600 hover:text-neutral-900 hover:border-neutral-300 border-b-2 px-1 pt-1 font-medium text-sm"
              >
                Request a Sitter
              </button>
              <Link
                href="/bookings"
                className={`${
                  isActive("/bookings")
                    ? "border-primary text-primary border-b-2"
                    : "border-transparent text-neutral-600 hover:text-neutral-900 hover:border-neutral-300 border-b-2"
                } px-1 pt-1 font-medium text-sm`}
              >
                My Bookings
              </Link>
              <Link
                href="/messages"
                className={`${
                  isActive("/messages")
                    ? "border-primary text-primary border-b-2"
                    : "border-transparent text-neutral-600 hover:text-neutral-900 hover:border-neutral-300 border-b-2"
                } px-1 pt-1 font-medium text-sm`}
              >
                Messages
              </Link>
            </nav>
          </div>
          <div className="hidden sm:flex sm:items-center">
            {isAuthenticated ? (
              <div className="ml-4 flex items-center">
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="flex items-center max-w-xs rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                      <Avatar className="h-8 w-8">
                        {currentUser?.profileImageUrl ? (
                          <AvatarImage src={currentUser.profileImageUrl} alt={currentUser.fullName} />
                        ) : (
                          <AvatarFallback>{getInitials(currentUser?.fullName || "User")}</AvatarFallback>
                        )}
                      </Avatar>
                      <span className="ml-2 text-neutral-600 font-medium">{currentUser?.fullName?.split(" ")[0]}</span>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56">
                    <div className="grid gap-2">
                      <Link href="/profile" className="text-sm font-medium">
                        Profile
                      </Link>
                      <Button variant="ghost" size="sm" className="justify-start" onClick={handleLogout}>
                        Logout
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            ) : (
              <div className="ml-4 flex items-center space-x-2">
                <Button variant="ghost" size="sm">Login</Button>
                <Button>Sign Up</Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button className="inline-flex items-center justify-center p-2 rounded-md text-neutral-600 hover:text-primary hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary">
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
