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

export default function MyBookings() {
  const { user } = useAuth();
  const isAuthenticated = !!user;
  const [instantCareOpen, setInstantCareOpen] = useState(false);
  const [scheduledCareOpen, setScheduledCareOpen] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  console.log("bookings", bookings);

  // const { data: bookings, isLoading } = useQuery<Booking[]>({
  //   queryKey: ["/api/bookings/parent"],
  //   enabled: isAuthenticated && user?.userType === "parent",
  // });

  // Function handlers for care options
  const openInstantCare = () => {
    setInstantCareOpen(true);
  };

  const openScheduledCare = () => {
    setScheduledCareOpen(true);
  };

  const fetchBookings = async () => {
    if (!user) return;

    const userType = user?.user_metadata?.userType;
    let response;

    if (userType === "parent") {
      response = await supabase
        .from("InstantCare")
        .select("*")
        .eq("parent_id", user.id)
        .order("start_time", { ascending: false });
    } else if (userType === "babysitter") {
      response = await supabase
        .from("InstantCare")
        .select("*")
        .eq("sitter_id", user.id)
        .order("start_time", { ascending: false });
    } else {
      return;
    }

    if (response.error) {
      console.error("Error fetching bookings:", response.error.message);
    } else {
      setBookings(response.data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchBookings();
  }, [user]);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-neutral-800 mb-6">
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
                className="bg-white rounded-lg shadow-sm overflow-hidden border border-neutral-200 p-4 animate-pulse"
              >
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : bookings?.length ? (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-neutral-200 p-8 text-center">
            <p className="text-neutral-600 mb-6">
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
                    onClick={openInstantCare}
                  >
                    <Clock className="mr-2 h-4 w-4" />
                    Request a Sitter Now
                  </Button>

                  <Button
                    variant="outline"
                    className="flex items-center border-brand-blue text-brand-blue hover:bg-brand-blue/10"
                    onClick={openScheduledCare}
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

      {/* Modals for booking care */}
      <InstantCareModal
        isOpen={instantCareOpen}
        onClose={() => setInstantCareOpen(false)}
      />
      <ScheduledCareModal
        isOpen={scheduledCareOpen}
        onClose={() => setScheduledCareOpen(false)}
      />
    </Layout>
  );
}
