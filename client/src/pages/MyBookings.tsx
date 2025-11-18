import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import BookingCard from "@/components/BookingCard";
import { Booking } from "@/lib/types";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { CalendarClock, Clock, ChevronDown } from "lucide-react";
import InstantCareModal from "@/components/InstantCareModal";
import ScheduledCareModal from "@/components/ScheduledCareModal";
import supabase from "@/config/supabaseClient";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function MyBookings() {
  const { user } = useAuth();
   const { toast } = useToast();
  const isAuthenticated = !!user;
   const [, navigate] = useLocation();
  const [instantCareOpen, setInstantCareOpen] = useState(false);
  const [scheduledCareOpen, setScheduledCareOpen] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [instantCareBookings, setInstantCareBookings] = useState<Booking[]>([]);
  const [scheduleCareBookings, setScheduleCareBookings] = useState<Booking[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  const isPaymentSuccess = user?.user_metadata?.isPayment;

  // const { data: bookings, isLoading } = useQuery<Booking[]>({
  //   queryKey: ["/api/bookings/parent"],
  //   enabled: isAuthenticated && user?.userType === "parent",
  // });

  const handleCareRequest = (type: "instant" | "scheduled") => {
    // if (guardNavigation()) return;

    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }

    if (!isPaymentSuccess) {
      navigate("/membership");
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

  const fetchBookings = async () => {
    if (!user) return;

    const userType = user?.user_metadata?.userType;

    try {
      const [instantCareRes, scheduleCareRes] = await Promise.all([
        supabase
          .from("InstantCare")
          .select("*")
          .eq(userType === "parent" ? "parent_id" : "sitter_id", user.id)
          .order("start_time", { ascending: false }),

        supabase
          .from("scheduledCare")
          .select("*")
          .eq(userType === "parent" ? "parent_id" : "sitter_id", user.id)
          .order("start_time", { ascending: false }),
      ]);

      if (instantCareRes.error) {
        console.error(
          "Error fetching InstantCare:",
          instantCareRes.error.message,
        );
      } else {
        setInstantCareBookings(instantCareRes.data || []);
      }

      if (scheduleCareRes.error) {
        console.error(
          "Error fetching ScheduleCare:",
          scheduleCareRes.error.message,
        );
      } else {
        setScheduleCareBookings(scheduleCareRes.data || []);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
    } finally {
      setLoading(false);
    }
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

  useEffect(() => {
    fetchBookings();
  }, [user]);

  useEffect(() => {
    if (user?.id && user?.user_metadata?.userType === "parent") {
      fetchParentProfile();
    }
  }, [user]);

  return (
    <Layout>
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 xxl:py-8">
        <h1 className="text-lg xs:text-xl lg:text-2xl font-bold text-brand-blue mb-6">
          Your Bookings
        </h1>

        {!isAuthenticated ? (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-neutral-200 p-8 text-center">
            <p className="text-neutral-600">
              Bookings will appear here after requesting a sitter.
            </p>
          </div>
        ) : loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-lg shadow-md overflow-hidden border border-neutral-200 p-4 animate-pulse"
              >
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : instantCareBookings.length > 0 ||
          scheduleCareBookings.length > 0 ? (
          <>
            {/* Instant Care Bookings */}
            <h2 className="text-lg sm:text-xl font-semibold text-neutral-700 mb-2">
              Instant Care Bookings
            </h2>
            {instantCareBookings.length > 0 ? (
              <div className="space-y-4 mb-6">
                {instantCareBookings.map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    fetchBookings={fetchBookings}
                    type="instant"
                  />
                ))}
              </div>
            ) : (
              <p className="text-neutral-500 mb-6">
                No Instant Care bookings yet.
              </p>
            )}

            {/* Scheduled Care Bookings */}
            <h2 className="text-lg sm:text-xl font-semibold text-neutral-700 mb-2">
              Scheduled Care Bookings
            </h2>
            {scheduleCareBookings.length > 0 ? (
              <div className="space-y-4">
                {scheduleCareBookings.map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    fetchBookings={fetchBookings}
                    type="scheduled"
                  />
                ))}
              </div>
            ) : (
              <p className="text-neutral-500">
                No Scheduled Care bookings yet.
              </p>
            )}
          </>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden border border-neutral-200 p-8 text-center">
            <p className="text-neutral-600 m-6">
              You don't have any bookings yet.
            </p>

            {user?.user_metadata?.userType === "parent" && (
              <div className="flex flex-col items-center">
                <h3 className="text-lg font-medium mb-3">
                  Create your first booking
                </h3>

                <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
                  <Button
                    className="bg-brand-blue hover:bg-brand-blue/90 flex items-center"
                    onClick={() => handleCareRequest("instant")}
                  >
                    <Clock className="mr-2 h-4 w-4" />
                    Request a Sitter Now
                  </Button>

                  <Button
                    variant="outline"
                    className="flex items-center border-brand-blue text-brand-blue hover:bg-brand-blue/10"
                    onClick={() => handleCareRequest("scheduled")}
                  >
                    <CalendarClock className="mr-2 h-4 w-4" />
                    Schedule Care
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
