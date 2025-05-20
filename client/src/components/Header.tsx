import { Link, useLocation } from "wouter";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import logo from "../assets/enchanted-logo.png";
import { useAuth } from "@/hooks/use-auth";

export default function Header() {
  const { user, logoutMutation } = useAuth();
  const [location, navigate] = useLocation();
  const isAuthenticated = !!user;
  const hasMembership = !!user && (
    user.membershipStatus === "active" || 
    user.membershipStatus === "installment_2"
  );

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
  
  const handleCareButtonClick = () => {
    if (!isAuthenticated) {
      navigate("/auth");
    } else if (!hasMembership) {
      navigate("/membership");
    } else {
      window.dispatchEvent(new CustomEvent('open-sitter-request'));
    }
  };

  return (
    <header className="bg-white sticky top-0 z-10 border-b border-neutral-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-18">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <img 
                src={logo} 
                alt="The Enchanted Co. Logo" 
                className="h-12 w-auto"
              />
            </Link>
            <nav className="hidden sm:ml-12 sm:flex sm:space-x-10">
              <Link
                href="/"
                className={`${
                  isActive("/")
                    ? "text-[#3c5679] font-medium"
                    : "text-neutral-700 hover:text-[#3c5679]"
                } px-1 pt-1 text-sm tracking-wide`}
              >
                Home
              </Link>
              <Popover>
                <PopoverTrigger asChild>
                  <button 
                    className="flex items-center bg-[#3c5679] hover:bg-[#2c4059] text-white rounded-[4px] px-4 py-2 text-sm tracking-wide font-medium shadow-sm"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-2"
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
                    <svg className="h-4 w-4 ml-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-52 p-4 shadow-lg border-neutral-200">
                  <div className="grid gap-3">
                    <Button 
                      onClick={() => {
                        if (!isAuthenticated) {
                          navigate("/auth");
                        } else if (!hasMembership) {
                          navigate("/membership");
                        } else {
                          window.dispatchEvent(new CustomEvent('open-sitter-request'));
                        }
                      }}
                      className="justify-start bg-[#7e57c2] hover:bg-[#6a46b0] text-white font-medium tracking-wide rounded-[4px]" 
                      size="sm"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-2"
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
                      Instant Care
                    </Button>
                    <Button 
                      onClick={() => {
                        if (!isAuthenticated) {
                          navigate("/auth");
                        } else if (!hasMembership) {
                          navigate("/membership");
                        } else {
                          window.dispatchEvent(new CustomEvent('open-scheduled-care'));
                        }
                      }}
                      variant="outline" 
                      className="justify-start border-[#7e57c2] text-[#7e57c2] hover:bg-purple-50 font-medium tracking-wide rounded-[4px]"
                      size="sm"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-2 text-[#7e57c2]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      Scheduled Care
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
              <Link
                href="/bookings"
                className={`${
                  isActive("/bookings")
                    ? "text-[#3c5679] font-medium"
                    : "text-neutral-700 hover:text-[#3c5679]"
                } px-1 pt-1 text-sm tracking-wide`}
              >
                My Bookings
              </Link>
              <Link
                href="/messages"
                className={`${
                  isActive("/messages")
                    ? "text-[#3c5679] font-medium"
                    : "text-neutral-700 hover:text-[#3c5679]"
                } px-1 pt-1 text-sm tracking-wide`}
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
                    <button className="flex items-center max-w-xs rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#7e57c2] focus:ring-offset-1 px-2 py-1 hover:bg-purple-50 transition-colors">
                      <Avatar className="h-8 w-8 rounded-md">
                        {user?.profileImageUrl ? (
                          <AvatarImage src={user.profileImageUrl} alt={user.fullName} className="rounded-md" />
                        ) : (
                          <AvatarFallback className="rounded-md bg-[#7e57c2]/10 text-[#7e57c2]">{getInitials(user?.fullName || "User")}</AvatarFallback>
                        )}
                      </Avatar>
                      <div className="flex items-center">
                        <span className="ml-2 text-neutral-700 font-medium tracking-wide">{user?.fullName?.split(" ")[0]}</span>
                        {user?.username === "admin" && (
                          <span className="ml-2 text-xs bg-red-100 text-red-800 rounded-sm px-2 py-0.5">Admin</span>
                        )}
                      </div>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56 p-4 shadow-lg border-neutral-200">
                    <div className="grid gap-3">
                      <Link href="/profile" className="text-sm font-medium text-neutral-700 hover:text-[#7e57c2] flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Profile
                      </Link>
                      {user?.username === "admin" && (
                        <Link href="/admin" className="text-sm font-medium text-red-600 hover:text-red-700 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                          Admin Dashboard
                        </Link>
                      )}
                      <Button variant="ghost" size="sm" className="justify-start text-neutral-700 hover:text-[#7e57c2] hover:bg-purple-50" onClick={handleLogout}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Logout
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            ) : (
              <div className="ml-4 flex items-center space-x-3">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-[#7e57c2] hover:text-[#7e57c2]/90 hover:bg-purple-50 font-medium tracking-wide"
                  onClick={() => navigate("/auth")}
                >
                  Login
                </Button>
                <Button 
                  className="bg-[#7e57c2] hover:bg-[#6a46b0] text-white font-medium tracking-wide rounded-[4px]"
                  onClick={() => navigate("/auth")}
                >
                  Sign Up
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-red-600 border-red-600 hover:bg-red-50 rounded-[4px]"
                  onClick={() => navigate("/admin")}
                >
                  Admin
                </Button>
              </div>
            )}
          </div>

          {/* Mobile buttons */}
          <div className="flex items-center sm:hidden space-x-3">
            <button 
              onClick={handleCareButtonClick}
              className="inline-flex items-center justify-center p-2 bg-[#7e57c2] text-white rounded-[4px] shadow-sm"
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
            <button 
              onClick={() => navigate("/admin")}
              className="inline-flex items-center justify-center p-2 border border-red-600 text-red-600 rounded-[4px]"
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
                  d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </button>
            <button className="inline-flex items-center justify-center p-2 rounded-[4px] text-neutral-700 hover:text-[#7e57c2] hover:bg-purple-50 focus:outline-none">
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
