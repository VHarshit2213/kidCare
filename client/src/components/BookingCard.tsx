import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { formatBookingTimeRange } from "@/lib/utils";
import { Booking, User } from "@shared/schema";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Star, Navigation, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useSignedUrl } from "@/hooks/use-signedUrl";
import StatusBadge from "./common/StatusBadge";
import ReviewForm from "./ReviewForm";
import ParentReviewForm from "./ParentReviewForm";
import NavigationMap from "./NavigationMap";
import supabase from "@/config/supabaseClient";
import { format } from "date-fns";
import { babysitterProfile, ParentProfile } from "@/lib/types";
import ChatDialog from "@/components/ChatDialog";
import { IoIosChatboxes } from "react-icons/io";

interface BookingCardProps {
  booking: Booking;
}

export default function BookingCard({ booking }: BookingCardProps) {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showParentReviewForm, setShowParentReviewForm] = useState(false);
  const [showNavigation, setShowNavigation] = useState(false);
  const [parent, setParent] = useState<ParentProfile[]>([]);
  const [babysitter, setBabySitter] = useState<babysitterProfile[]>([]);
  const [chatProps, setChatProps] = useState(null);
  const { user } = useAuth();
  const { getSignedUrl } = useSignedUrl();
  const [loading, setLoading] = useState(true);

  // const { data: babysitter } = useQuery<User>({
  //   queryKey: booking.babysitterId
  //     ? [`/api/users/${booking.babysitterId}`]
  //     : [],
  //   enabled: !!booking.babysitterId,
  // });

  // const { data: parent } = useQuery<User>({
  //   queryKey: [`/api/users/${booking.parentId}`],
  // });

  // Check if current user has already reviewed this booking (babysitter reviews)
  const { data: existingReviews } = useQuery<any[]>({
    queryKey: [`/api/reviews/booking/${booking.id}`],
    enabled: user?.userType === "babysitter" && booking.status === "completed",
  });

  // Check if current user has already reviewed this booking (parent reviews)
  const { data: existingParentReviews } = useQuery<any[]>({
    queryKey: [`/api/parent-reviews/booking/${booking.id}`],
    enabled: user?.userType === "parent" && booking.status === "completed",
  });

  const openChatDialog = (props) => {
    setChatProps(props);
  };

  const getInitials = (name?: string) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  };

  const fetchProfiles = async () => {
    if (!booking?.parent_id && !booking?.sitter_id) return;

    setLoading(true);

    const getProfile = async (table, userId) => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from(table)
        .select("*")
        .eq("user_id", userId)
        .single();
      if (error) {
        console.error(`Error fetching ${table}:`, error.message);
        return null;
      }
      if (data?.profile_image) {
        const profileImageUrl = await getSignedUrl(data.profile_image);
        return { ...data, profileImageUrl };
      }
      return data;
    };

    try {
      const [parent, sitter] = await Promise.all([
        getProfile("parentprofile", booking.parent_id),
        getProfile("babySitterProfile", booking.sitter_id),
      ]);

      if (parent) setParent(parent);
      if (sitter) setBabySitter(sitter);
    } catch (error) {
      console.error("Error fetching profiles:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (booking) {
      fetchProfiles();
    }
  }, [booking]);

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-neutral-200 p-4">
      {loading ? (
        [1].map((i) => (
          <div
            key={i}
            className="bg-white rounded-lg shadow-sm overflow-hidden border border-neutral-200 p-4 animate-pulse"
          >
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))
      ) : (
        <div className="sm:flex sm:items-center sm:justify-between">
          <div className="sm:flex sm:items-center w-full">
            {/* Parent logged in → show babysitter details */}
            {user?.user_metadata?.userType === "parent" && babysitter && (
              <>
                <div className="hidden sm:block mr-4">
                  <Avatar className="h-12 w-12">
                    {babysitter.profileImageUrl ? (
                      <AvatarImage
                        src={babysitter.profileImageUrl}
                        alt={babysitter.fullName}
                      />
                    ) : (
                      <AvatarFallback>
                        {getInitials(babysitter.fullName)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-neutral-800">
                    {babysitter.fullName} with{" "}
                    {booking.children.map(
                      (child) => child.firstName + " " + child.lastName
                    )}
                  </h3>
                  <p className="font-bold">
                    Address :{" "}
                    <span className="font-medium"> {babysitter?.address}</span>
                  </p>
                  <div className="mt-1 flex items-start text-sm text-neutral-600">
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
                    {booking.date ? (
                      <div className="flex flex-col">
                        <p>
                          <span className="font-medium text-foreground">
                            Date:
                          </span>{" "}
                          {format(booking.date, "MMM d, yyyy")}
                        </p>
                        <p>
                          <span className="font-medium text-foreground">
                            Time:
                          </span>{" "}
                          {/* {format(booking?.date, "MMM d, yyyy")} ( */}
                          {booking.start_time} - {booking.end_time}
                        </p>
                      </div>
                    ) : (
                      <>
                        <span>
                          {formatBookingTimeRange(
                            booking.start_time,
                            booking.end_time
                          )}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="ml-auto">
                  <button
                    className="bg-[#3c5679] hover:bg-[#2c4059] text-white rounded-[4px] px-4 py-2 text-sm tracking-wide font-medium shadow-sm flex items-center gap-1"
                    onClick={() =>
                      openChatDialog({
                        currentUserId: parent?.user_id,
                        otherUserId: babysitter?.user_id,
                        currentUserPhone: parent?.phoneNumber,
                        otherUserPhone: babysitter?.phoneNumber,
                        otherUserName: babysitter.fullName,
                      })
                    }
                  >
                    <IoIosChatboxes className="h-4 w-4" />
                    Chat
                  </button>
                </div>
              </>
            )}

            {/* Babysitter logged in → show parent details */}
            {user?.user_metadata?.userType === "babysitter" && parent && (
              <>
                <div className="hidden sm:block mr-4">
                  <Avatar className="h-12 w-12">
                    <Avatar className="h-12 w-12">
                      {parent.profileImageUrl ? (
                        <AvatarImage
                          src={parent.profileImageUrl}
                          alt={parent.fullName}
                        />
                      ) : (
                        <AvatarFallback>
                          {getInitials(parent.fullName)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                  </Avatar>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-neutral-800">
                    {parent.fullName}’s children:{" "}
                    {booking.children.map(
                      (child) => child.firstName + " " + child.lastName
                    )}
                  </h3>
                  {/* <p className="font-bold">
                  Address :{" "}
                  <span className="font-medium">{booking?.address}</span>
                </p> */}
                  <p className="font-bold">
                    parent Name :{" "}
                    <span className="font-medium">{parent.fullName}</span>
                  </p>
                  <div className="mt-1 flex items-start text-sm text-neutral-600">
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
                    {booking.date ? (
                      <div className="flex flex-col">
                        <p>
                          <span className="font-medium text-foreground">
                            Date:
                          </span>{" "}
                          {format(booking.date, "MMM d, yyyy")}
                        </p>
                        <p>
                          <span className="font-medium text-foreground">
                            Time:
                          </span>{" "}
                          {/* {format(booking?.date, "MMM d, yyyy")} ( */}
                          {booking.start_time} - {booking.end_time}
                        </p>
                      </div>
                    ) : (
                      <>
                        <span>
                          {formatBookingTimeRange(
                            booking.start_time,
                            booking.end_time
                          )}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="mt-4 flex items-center justify-between sm:mt-0 sm:ml-6">
            {/* <StatusBadge status={booking.status} /> */}
            <div className="ml-4 flex flex-shrink-0 space-x-2">
              {/* Navigation button for babysitters on confirmed or in-progress bookings */}
              {user?.user_metadata?.userType === "babysitter" &&
                booking.sitter_id === user.id &&
                // (booking.status === "confirmed" ||
                //   booking.status === "in-progress") &&
                booking?.address && (
                  <>
                    <Button
                      onClick={() => setShowNavigation(true)}
                      size="sm"
                      className="bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      <Navigation className="h-4 w-4 mr-1" />
                      Navigate
                    </Button>
                    <button
                      className="bg-[#3c5679] hover:bg-[#2c4059] text-white rounded-[4px] px-4 py-2 text-sm tracking-wide font-medium shadow-sm flex items-center gap-1"
                      onClick={() =>
                        openChatDialog({
                          currentUserId: babysitter?.user_id,
                          otherUserId: parent?.user_id,
                          currentUserPhone: babysitter?.phoneNumber,
                          otherUserPhone: parent?.phoneNumber,
                          otherUserName: parent.fullName,
                        })
                      }
                    >
                      <IoIosChatboxes className="h-4 w-4" />
                      Chat
                    </button>
                  </>
                )}

              {/* Review button for babysitters on completed bookings */}
              {user?.userType === "babysitter" &&
                booking.status === "completed" &&
                booking.babysitterId === user.id &&
                !existingReviews?.length && (
                  <Button
                    onClick={() => setShowReviewForm(true)}
                    size="sm"
                    className="bg-yellow-500 hover:bg-yellow-600 text-white"
                  >
                    <Star className="h-4 w-4 mr-1" />
                    Leave Review
                  </Button>
                )}

              {user?.userType === "parent" &&
                booking.status === "completed" &&
                booking.parentId === user.id &&
                !existingParentReviews?.length && (
                  <Button
                    onClick={() => setShowParentReviewForm(true)}
                    size="sm"
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    <Star className="h-4 w-4 mr-1" />
                    Review Babysitter
                  </Button>
                )}

              {/* {babysitter && (
              <button className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-neutral-600 bg-neutral-100 hover:bg-neutral-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
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
            )} */}
              {/* <button className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
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
            </button> */}
            </div>
          </div>
        </div>
      )}

      {/* Review Form Modal */}
      {showReviewForm && parent && (
        <ReviewForm
          isOpen={showReviewForm}
          onClose={() => setShowReviewForm(false)}
          booking={booking}
          parentName={parent.fullName}
        />
      )}

      {/* Parent Review Form Modal */}
      {showParentReviewForm && babysitter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold">
                Review {babysitter.fullName}
              </h2>
              <button
                onClick={() => setShowParentReviewForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <ParentReviewForm
                booking={booking}
                babysitter={babysitter}
                onSuccess={() => setShowParentReviewForm(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Navigation Modal */}
      {showNavigation && booking?.address && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto mt-[30px]">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold">
                Navigate to {parent.fullName}'s Home
              </h2>
              <button
                onClick={() => setShowNavigation(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <NavigationMap
                destinationAddress={booking.address}
                onNavigationStart={() => setShowNavigation(false)}
              />
            </div>
          </div>
        </div>
      )}

      {chatProps && (
        <ChatDialog {...chatProps} onClose={() => setChatProps(null)} />
      )}
    </div>
  );
}
