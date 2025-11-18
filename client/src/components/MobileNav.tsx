import { useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { AiOutlineHome } from "react-icons/ai";
import { FaRegCalendarCheck, FaRegClock } from "react-icons/fa6";
import { CalendarIcon, MessageCircleMore } from "lucide-react";
import { FaRegUser } from "react-icons/fa";
import { useZipRestriction } from "@/hooks/use-zip-restriction";
import { useCallback, useEffect, useState } from "react";
import supabase from "@/config/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import { TbUserStar } from "react-icons/tb";

export default function MobileNav() {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();

  const [profile, setProfile] = useState<any>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const isAuthenticated = !!user;
  const isPaymentSuccess = user?.user_metadata?.isPayment;
  const userId = user?.id;
  const isParent = user?.user_metadata?.userType === "parent";

  const {
    guardNavigation
  } = useZipRestriction({ profile });

  const isActive = (path: string) => location === path;

  const handleCareRequest = (type: "instant" | "scheduled") => {
    if (guardNavigation()) return;

    if (!isAuthenticated) {
      setLocation("/auth");
      return;
    }

    if (!isPaymentSuccess) {
      setLocation("/membership");
      return;
    }

    if (!profile) {
      window.dispatchEvent(
        new CustomEvent(type === "instant" ? "open-sitter-request" : "open-scheduled-care")
      );
      return;
    }

    if (!profile?.isApproved) {
      toast({
        title: "Access Denied",
        description: "Your profile is under review you cannot book babysitter.",
        variant: "destructive",
      });
      return;
    }

    window.dispatchEvent(
      new CustomEvent(type === "instant" ? "open-sitter-request" : "open-scheduled-care")
    );
  };

  const fetchParentProfile = async () => {
    if (!user?.id) return;

    const { data, error } = await supabase
      .from("parentprofile")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error) {
      console.error("Fetch error:", error.message);
      return null;
    }
    setProfile(data);
  };

  const fetchUnreadCount = useCallback(async () => {
    if (!userId) {
      setUnreadCount(0);
      return;
    }

    const { count, error } = await supabase
      .from("messages")
      .select("id", { count: "exact", head: true })
      .eq("receiver_id", userId)
      .eq("is_read", false);

    if (error) {
      console.error("Error fetching unread messages:", error.message);
      setUnreadCount(0);
      return;
    }

    setUnreadCount(count ?? 0);
  }, [userId]);

  useEffect(() => {
    if (user?.id && user?.user_metadata?.userType === "parent") {
      fetchParentProfile();
    }
  }, [user]);

  useEffect(() => {
    if (!userId) {
      setUnreadCount(0);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    fetchUnreadCount();

    const channel = supabase
      .channel(`messages-unread-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
          filter: `receiver_id=eq.${userId}`,
        },
        () => fetchUnreadCount()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, fetchUnreadCount]);

  return (
    <div className="xxl:hidden fixed bottom-0 inset-x-0 bg-white shadow-t border-t border-neutral-200 z-10">
      <div className="grid grid-cols-5 divide-x divide-neutral-100">
        <div className="flex flex-col items-center py-3 px-2">
          <Link href="/" className={`flex flex-col items-center ${isActive("/") ? "text-brand-blue" : "text-neutral-600 hover:text-brand-blue"}`}>
            <AiOutlineHome className="h-5 w-5" />
            <span className="text-xs mt-1">Home</span>
          </Link>
        </div>

        {isParent ? (
          <button
            onClick={() => handleCareRequest("instant")}
            className="flex flex-col items-center py-3 px-2 text-[#3c5679] font-medium relative"
          >
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-[#3c5679] text-white text-[10px] px-2 py-0.5 rounded-full">
              Now
            </div>
            <FaRegClock className="w-4 h-4 mt-1" />

            <span className="text-xs mt-1">Instant</span>
          </button>
        ) : (
          <div className="flex flex-col items-center py-3 px-2">
            <Link
              href="/reviews"
              className={`flex flex-col items-center relative ${isActive("/reviews") ? "text-brand-blue" : "text-neutral-600 hover:text-brand-blue"}`}
            >
              <TbUserStar className="w-5 h-5" />
              <span className="text-xs mt-1">Reviews</span>
            </Link>
          </div>
        )
        }

        {isParent ? (
          <button
            onClick={() => handleCareRequest("scheduled")}
            className="flex flex-col items-center py-3 px-2 text-brand-pink font-medium relative"
          >
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-brand-pink text-white text-[10px] px-2 py-0.5 rounded-full">
              Plan
            </div>
            <CalendarIcon className="h-4 w-4 mt-1" />
            <span className="text-xs mt-1">Schedule</span>
          </button>
        ) : (
          <div className="flex flex-col items-center py-3 px-2">
            <Link
              href="/bookings"
              className={`flex flex-col items-center relative ${isActive("/reviews") ? "text-brand-blue" : "text-neutral-600 hover:text-brand-blue"}`}
            >
              <FaRegCalendarCheck className="w-4 h-4" />
              <span className="text-xs mt-2">Bookings</span>
            </Link>
          </div>
        )}

        <div className="flex flex-col items-center py-3 px-2">
          <Link href="/messages" className={`flex flex-col items-center relative ${isActive("/messages") ? "text-brand-blue" : "text-neutral-600 hover:text-brand-blue"}`}>
            <MessageCircleMore className="h-5 w-5" />
            <span className="text-xs mt-1">Messages</span>
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-3 inline-flex items-center justify-center h-5 min-w-[1.25rem] rounded-full bg-red-500 px-1.5 text-xs font-semibold text-white">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </Link>
        </div>

        <div className="flex flex-col items-center py-3 px-2">
          <Link href="/profile" className={`flex flex-col items-center ${isActive("/profile") ? "text-brand-blue" : "text-neutral-600 hover:text-brand-blue"}`}>
            <FaRegUser className="h-4 w-4 mt-1" />
            <span className="text-xs mt-1">Profile</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
