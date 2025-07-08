import { useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";

export default function MobileNav() {
  const [location, navigate] = useLocation();
  const { user } = useAuth();
  const isAuthenticated = !!user;

  const isActive = (path: string) => location === path;
  
  const handleRequestSitter = () => {
    if (isAuthenticated) {
      window.dispatchEvent(new CustomEvent('open-sitter-request'));
    } else {
      navigate("/auth");
    }
  };
  
  const handleScheduledCare = () => {
    if (isAuthenticated) {
      window.dispatchEvent(new CustomEvent('open-scheduled-care'));
    } else {
      navigate("/auth");
    }
  };

  return (
    <div className="sm:hidden fixed bottom-0 inset-x-0 bg-white shadow-t border-t border-neutral-200 z-10">
      <div className="grid grid-cols-5 divide-x divide-neutral-100">
        <div className="flex flex-col items-center py-3 px-2">
          <Link href="/" className={`flex flex-col items-center ${isActive("/") ? "text-brand-blue" : "text-neutral-600 hover:text-brand-blue"}`}>
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
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            <span className="text-xs mt-1">Home</span>
          </Link>
        </div>
        
        <button 
          onClick={handleRequestSitter}
          className="flex flex-col items-center py-3 px-2 text-[#3c5679] font-medium relative"
        >
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-[#3c5679] text-white text-[10px] px-2 py-0.5 rounded-full">
            Now
          </div>
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
          <span className="text-xs mt-1">Instant</span>
        </button>
        
        <button 
          onClick={handleScheduledCare}
          className="flex flex-col items-center py-3 px-2 text-brand-pink font-medium relative"
        >
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-brand-pink text-white text-[10px] px-2 py-0.5 rounded-full">
            Plan
          </div>
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
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className="text-xs mt-1">Schedule</span>
        </button>

        <div className="flex flex-col items-center py-3 px-2">
          <Link href="/messages" className={`flex flex-col items-center ${isActive("/messages") ? "text-brand-blue" : "text-neutral-600 hover:text-brand-blue"}`}>
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
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <span className="text-xs mt-1">Messages</span>
          </Link>
        </div>

        <div className="flex flex-col items-center py-3 px-2">
          <Link href="/profile" className={`flex flex-col items-center ${isActive("/profile") ? "text-brand-blue" : "text-neutral-600 hover:text-brand-blue"}`}>
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
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <span className="text-xs mt-1">Profile</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
