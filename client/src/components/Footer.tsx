import { Link, useLocation } from "wouter";

export default function Footer() {
  const [location, setLocation] = useLocation();

  const isActive = (path: string) => location === path;

  return (
    <footer className="bg-white border-t border-neutral-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-wrap justify-between items-center">
          <div className="flex items-center space-x-4">
            <span className="text-[#3c5679] font-medium">
              The Enchanted Co.
            </span>
            <span className="text-neutral-400">|</span>
            <a
              href="mailto:hello@lovetheenchantedco.com"
              className="text-[#3c5679] text-sm hover:underline"
            >
              hello@lovetheenchantedco.com
            </a>
          </div>

          <div className="flex space-x-4 mt-3 md:mt-0">
            <Link
              href="/"
              className={`${
                isActive("/")
                  ? "text-[#3c5679] font-medium"
                  : "text-neutral-700 hover:text-[#3c5679]"
              } text-sm`}
            >
              Home
            </Link>
            <Link
              href="/bookings"
              className={`${
                isActive("/bookings")
                  ? "text-[#3c5679] font-medium"
                  : "text-neutral-700 hover:text-[#3c5679]"
              } text-sm`}
            >
              Bookings
            </Link>
            <Link
              href="/messages"
              className={`${
                isActive("/messages")
                  ? "text-[#3c5679] font-medium"
                  : "text-neutral-700 hover:text-[#3c5679]"
              } text-sm`}
            >
              Messages
            </Link>
          </div>

          <p className="w-full md:w-auto text-sm text-neutral-500 mt-3 md:mt-0">
            © {new Date().getFullYear()} The Enchanted Co. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
