import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import Hero from "@/components/Hero";
import BookingCard from "@/components/BookingCard";
import { useAuth } from "@/hooks/use-auth";
import { Booking } from "@/lib/types";

export default function Home() {
  const { user } = useAuth();
  const isAuthenticated = !!user;

  const { data: bookings, isLoading: isLoadingBookings } = useQuery<Booking[]>({
    queryKey: ["/api/bookings/parent"],
    enabled: isAuthenticated && user?.userType === "parent",
  });

  return (
    <Layout>
      <Hero />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* User's Bookings - Only shown if logged in as parent */}
        {isAuthenticated && user?.userType === "parent" && (
          <div className="py-8 border-t border-neutral-200">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-neutral-800">Your Bookings</h2>
              <a href="/bookings" className="text-[#00A699] hover:text-[#008F84] text-sm font-medium">
                View all
              </a>
            </div>
            
            {isLoadingBookings ? (
              <div className="mt-6 space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden border border-neutral-200 p-4 animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : bookings?.length ? (
              <div className="mt-6 space-y-4">
                {bookings.slice(0, 2).map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
              </div>
            ) : (
              <div className="mt-6 bg-white rounded-lg shadow-sm overflow-hidden border border-neutral-200 p-8 text-center">
                <p className="text-neutral-600">You don't have any bookings yet.</p>
                <button className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark">
                  Create your first booking
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
