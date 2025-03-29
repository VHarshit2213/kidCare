import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import Hero from "@/components/Hero";
import SitterCard from "@/components/SitterCard";
import BookingCard from "@/components/BookingCard";
import HowItWorks from "@/components/HowItWorks";
import { useContext } from "react";
import { AppContext } from "@/App";
import { User, Booking } from "@/lib/types";

export default function Home() {
  const { currentUser, isAuthenticated } = useContext(AppContext);

  const { data: babysitters, isLoading: isLoadingBabysitters } = useQuery<User[]>({
    queryKey: ["/api/babysitters"],
  });

  const { data: bookings, isLoading: isLoadingBookings } = useQuery<Booking[]>({
    queryKey: ["/api/bookings/parent"],
    enabled: isAuthenticated && currentUser?.userType === "parent",
  });

  return (
    <Layout>
      <Hero />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Featured Sitters */}
        <div className="py-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-neutral-800">Top Rated Babysitters</h2>
            <a href="#" className="text-[#00A699] hover:text-[#008F84] text-sm font-medium">
              View all
            </a>
          </div>
          
          {isLoadingBabysitters ? (
            <div className="mt-6 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden border border-neutral-200 h-64 animate-pulse">
                  <div className="h-1/2 bg-gray-200"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="flex gap-2">
                      <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
                      <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-6 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {babysitters?.map((sitter) => (
                <SitterCard key={sitter.id} sitter={sitter} />
              ))}
            </div>
          )}
        </div>

        {/* User's Bookings - Only shown if logged in as parent */}
        {isAuthenticated && currentUser?.userType === "parent" && (
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
        
        {/* How It Works */}
        <HowItWorks />
      </div>
    </Layout>
  );
}
