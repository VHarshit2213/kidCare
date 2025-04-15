import { Link, useLocation } from "wouter";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import logo from "../assets/enchanted-logo-full.jpg";
import { useAuth } from "@/hooks/use-auth";

export default function Header() {
  const { user, logoutMutation } = useAuth();
  const [location, navigate] = useLocation();
  const isAuthenticated = !!user;

  const handleLogout = () => {
    logoutMutation.mutate();
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
              <img 
                src={logo} 
                alt="The Enchanted Co. Logo" 
                className="h-8 w-auto mix-blend-multiply"
              />
            </Link>
            <nav className="hidden sm:ml-10 sm:flex sm:space-x-8">
              <Link
                href="/"
                className={`${
                  isActive("/")
                    ? "border-brand-blue text-brand-blue border-b-2"
                    : "border-transparent text-neutral-600 hover:text-brand-blue hover:border-brand-blue border-b-2"
                } px-1 pt-1 font-medium text-sm`}
              >
                Home
              </Link>
              <button 
                onClick={() => window.dispatchEvent(new CustomEvent('open-sitter-request'))}
                className="flex items-center bg-[#3c5679] hover:bg-[#2c4059] text-white rounded-md px-3 py-1.5 font-medium text-sm shadow-sm"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Request a Sitter
              </button>
              <Link
                href="/bookings"
                className={`${
                  isActive("/bookings")
                    ? "border-brand-blue text-brand-blue border-b-2"
                    : "border-transparent text-neutral-600 hover:text-brand-blue hover:border-brand-blue border-b-2"
                } px-1 pt-1 font-medium text-sm`}
              >
                My Bookings
              </Link>
              <Link
                href="/messages"
                className={`${
                  isActive("/messages")
                    ? "border-brand-blue text-brand-blue border-b-2"
                    : "border-transparent text-neutral-600 hover:text-brand-blue hover:border-brand-blue border-b-2"
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
                    <button className="flex items-center max-w-xs rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue">
                      <Avatar className="h-8 w-8">
                        {user?.profileImageUrl ? (
                          <AvatarImage src={user.profileImageUrl} alt={user.fullName} />
                        ) : (
                          <AvatarFallback>{getInitials(user?.fullName || "User")}</AvatarFallback>
                        )}
                      </Avatar>
                      <span className="ml-2 text-neutral-600 font-medium">{user?.fullName?.split(" ")[0]}</span>
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
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-brand-blue hover:text-brand-blue/90"
                  onClick={() => navigate("/auth")}
                >
                  Login
                </Button>
                <Button 
                  style={{ backgroundColor: "#3c5679" }} 
                  className="text-white font-medium"
                  onClick={() => navigate("/auth")}
                >
                  Sign Up
                </Button>
              </div>
            )}
          </div>

          {/* Mobile buttons */}
          <div className="flex items-center sm:hidden space-x-2">
            <button 
              onClick={() => window.dispatchEvent(new CustomEvent('open-sitter-request'))}
              className="inline-flex items-center justify-center p-2 bg-[#3c5679] text-white rounded-md"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </button>
            <button className="inline-flex items-center justify-center p-2 rounded-md text-neutral-600 hover:text-brand-blue hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-blue">
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
