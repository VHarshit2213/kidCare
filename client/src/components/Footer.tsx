import supabase from "@/config/supabaseClient";
import { useAuth } from "@/hooks/use-auth";
import { useZipRestriction } from "@/hooks/use-zip-restriction";
import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";

export default function Footer() {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();

  const [profile, setProfile] = useState<any>(null);

  const isActive = (path: string) => location === path;

  const {
    guardNavigation,
  } = useZipRestriction({ profile });

   const fetchProfile = async () => {
    if (!user?.id) return;

    const userType = user.user_metadata?.userType;

    let tableName = "";
    if (userType === "parent") tableName = "parentprofile";
    else if (userType === "babysitter") tableName = "babySitterProfile";
    else return;

    const { data, error } = await supabase
      .from(tableName)
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error) {
      console.error("Error fetching profile:", error.message);
      return;
    }

    setProfile(data);
  };

  useEffect(() => {
      fetchProfile();
  }, [user]);

  return (
    <footer className="bg-white border-t border-neutral-100 hidden xxl:block">
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
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

          <div className="flex space-x-4 xl:space-x-10 mt-3 md:mt-0">
            <Link
              href="/"
              className={`${isActive("/")
                  ? "text-[#3c5679] font-medium"
                  : "text-neutral-700 hover:text-[#3c5679]"
                } text-sm`}
            >
              Home
            </Link>
            <Link
              href="/bookings"
              className={`${isActive("/bookings")
                  ? "text-[#3c5679] font-medium"
                  : "text-neutral-700 hover:text-[#3c5679]"
                } text-sm`}
                onClick={guardNavigation}
            >
              Bookings
            </Link>
            <Link
              href="/messages"
              className={`${isActive("/messages")
                  ? "text-[#3c5679] font-medium"
                  : "text-neutral-700 hover:text-[#3c5679]"
                } text-sm`}
              onClick={guardNavigation}
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
