import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { formatBookingTimeRange } from "@/lib/utils";
import { Booking, User } from "@shared/schema";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import StatusBadge from "./common/StatusBadge";
import ReviewForm from "./ReviewForm";

interface BookingCardProps {
  booking: Booking;
}

export default function BookingCard({ booking }: BookingCardProps) {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const { user } = useAuth();
  
  const { data: babysitter } = useQuery<User>({
    queryKey: booking.babysitterId ? [`/api/users/${booking.babysitterId}`] : [],
    enabled: !!booking.babysitterId,
  });
  
  const { data: parent } = useQuery<User>({
    queryKey: [`/api/users/${booking.parentId}`],
  });
  
  // Check if current user has already reviewed this booking
  const { data: existingReviews } = useQuery({
    queryKey: [`/api/reviews/booking/${booking.id}`],
    enabled: user?.userType === "babysitter" && booking.status === "completed",
  });

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-neutral-200 p-4">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div className="sm:flex sm:items-center">
          {babysitter ? (
            <>
              <div className="hidden sm:block mr-4">
                <Avatar className="h-12 w-12">
                  {babysitter.profileImageUrl ? (
                    <AvatarImage src={babysitter.profileImageUrl} alt={babysitter.fullName} />
                  ) : (
                    <AvatarFallback>{getInitials(babysitter.fullName)}</AvatarFallback>
                  )}
                </Avatar>
              </div>
              <div>
                <h3 className="text-lg font-medium text-neutral-800">
                  {babysitter.fullName} with {booking.childName}
                </h3>
                <div className="mt-1 flex items-center text-sm text-neutral-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
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
                  <span>{formatBookingTimeRange(booking.startTime, booking.endTime)}</span>
                </div>
              </div>
            </>
          ) : (
            <div>
              <h3 className="text-lg font-medium text-neutral-800">
                Booking for {booking.childName}
              </h3>
              <div className="mt-1 flex items-center text-sm text-neutral-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
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
                <span>{formatBookingTimeRange(booking.startTime, booking.endTime)}</span>
              </div>
            </div>
          )}
        </div>
        <div className="mt-4 flex items-center justify-between sm:mt-0 sm:ml-6">
          <StatusBadge status={booking.status} />
          <div className="ml-4 flex flex-shrink-0">
            {babysitter && (
              <button className="mr-2 inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-neutral-600 bg-neutral-100 hover:bg-neutral-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
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
              </button>
            )}
            <button className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
