import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import BookingCard from "@/components/BookingCard";
import { Booking } from "@/lib/types";
import { useAuth } from "@/hooks/use-auth";

export default function MyBookings() {
  const { user } = useAuth();
  const isAuthenticated = !!user;

  const { data: bookings, isLoading } = useQuery<Booking[]>({
    queryKey: ["/api/bookings/parent"],
    enabled: isAuthenticated && user?.userType === "parent",
  });

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-neutral-800 mb-6">Your Bookings</h1>

        {!isAuthenticated ? (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-neutral-200 p-8 text-center">
            <p className="text-neutral-600">Bookings will appear here after requesting a sitter.</p>
          </div>
        ) : isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden border border-neutral-200 p-4 animate-pulse">
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
            <p className="text-neutral-600">You don't have any bookings yet.</p>
            <button 
              className="mt-4 px-4 py-2 text-white rounded-md font-medium" 
              style={{ backgroundColor: "#3c5679" }}
            >
              Create your first booking
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}
