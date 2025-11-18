import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { formatBookingTimeRange } from "@/lib/utils";
import { Booking, User } from "@shared/schema";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Star, Navigation, Loader2, CalendarIcon } from "lucide-react";
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
import { IoIosChatboxes, IoMdClose } from "react-icons/io";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";
import { IoMdInformationCircleOutline } from "react-icons/io";
import BookingConfirmation from "./BookingConfirmation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface BookingCardProps {
  booking: Booking;
}

export default function BookingCard({
  booking,
  fetchBookings,
  type,
}: BookingCardProps) {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showParentReviewForm, setShowParentReviewForm] = useState(false);
  const [showNavigation, setShowNavigation] = useState(false);
  const [parent, setParent] = useState<ParentProfile[]>([]);
  const [babysitter, setBabySitter] = useState<babysitterProfile[]>([]);
  const { user } = useAuth();
  const { getSignedUrl } = useSignedUrl();
  const [loading, setLoading] = useState({
    profiles: false,
    review: false,
  });
  const [babySitterStatus, setBabySitterStatus] = useState<string>(
    booking?.status || "Booked"
  );
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);
  const [showBookingInfo, setShowBookingInfo] = useState(false);

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
  // const { data: existingReviews } = useQuery<any[]>({
  //   queryKey: [`/api/reviews/booking/${booking.id}`],
  //   enabled: user?.userType === "babysitter" && booking.status === "completed",
  // });
  //
  // // Check if current user has already reviewed this booking (parent reviews)
  // const { data: existingParentReviews } = useQuery<any[]>({
  //   queryKey: [`/api/parent-reviews/booking/${booking.id}`],
  //   enabled: user?.userType === "parent" && booking.status === "completed",
  // });

  const getInitials = (name?: string) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  };

  // Function to calculate distance between parent and babysitter
  function getDistanceInMiles(lat1, lon1, lat2, lon2) {
    const R = 3958.8; // Radius of the Earth in miles
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  const fetchProfiles = async () => {
    if (!booking?.parent_id && !booking?.sitter_id) return;

    setLoading((prev) => ({ ...prev, profiles: true }));

    const getProfile = async (table: any, userId: string) => {
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
      if (sitter) {
        if (
          parent?.location?.latitude &&
          parent?.location?.longitude &&
          sitter?.location?.latitude &&
          sitter?.location?.longitude
        ) {
          const distance = getDistanceInMiles(
            parent.location.latitude,
            parent.location.longitude,
            sitter.location.latitude,
            sitter.location.longitude
          );
          sitter.distance = distance;
        }

        setBabySitter(sitter);
      }
    } catch (error) {
      console.error("Error fetching profiles:", error);
    } finally {
      setLoading((prev) => ({ ...prev, profiles: false }));
    }
  };

  const updateBabySitterStatus = async (
    bookingId: string,
    value: string,
    type: "instant" | "scheduled"
  ) => {
    try {
      const tableName = type === "instant" ? "InstantCare" : "scheduledCare";

      // Update InstantCare
      const { error } = await supabase
        .from(tableName)
        .update({ status: value })
        .eq("id", bookingId)
        .select();

      if (error) throw error;

      setBabySitterStatus(value);
      await fetchBookings();
      console.log(`Status updated in ${tableName}`);
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  // for check if parent has already reviewed the booking
  const checkReview = async () => {
    setLoading((prev) => ({ ...prev, review: true }));
    try {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("bookingId", booking.id)
        .eq("parent_id", parent.user_id)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        console.error("Error checking review:", error);
      }

      setAlreadyReviewed(!!data);
    } catch (error) {
      console.error("Unexpected error checking review:", err);
    } finally {
      setLoading((prev) => ({ ...prev, review: false }));
    }
  };

  const handleConfirmationClose = () => {
    setShowBookingInfo(false);
  };

  useEffect(() => {
    if (booking) {
      fetchProfiles();
    }
  }, [booking]);

  useEffect(() => {
    if (
      booking &&
      parent.user_id &&
      user?.user_metadata?.userType === "parent"
    ) {
      checkReview();
    }
  }, [booking, parent.user_id]);

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-neutral-200 p-4">
      {loading.profiles || loading.review ? (
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
        <div className="">
          <div className="sm:flex sm:items-start w-full">
            {/* Parent logged in → show babysitter details */}
            {user?.user_metadata?.userType === "parent" && babysitter && (
              <>
                <div className="hidden sm:block mr-4 mt-3">
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
                <div className={"w-full"}>
                  <h3 className="text-lg font-medium text-neutral-800">
                    {babysitter.fullName} with{" "}
                    {booking.children
                      .map((child) => `${child.firstName} ${child.lastName}`)
                      .join(", ")
                      .replace(/, ([^,]*)$/, " and $1")}
                  </h3>
                  <p className="font-bold">
                    Address :{" "}
                    <span className="font-medium"> {babysitter?.address}</span>
                  </p>
                  <div className="flex items-end text-sm text-neutral-600">
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
                  <p className="font-bold text-sm mt-2">
                    Booking Status : <StatusBadge status={booking.status} />
                  </p>
                </div>
                {user?.user_metadata?.userType === "parent" &&
                  booking.status === "Completed" &&
                  booking.parent_id === user.id &&
                  !alreadyReviewed && (
                    // !existingParentReviews?.length &&
                    <Button
                      onClick={() => setShowParentReviewForm(true)}
                      size="sm"
                      className="bg-blue-500 hover:bg-blue-600 text-white mt-5 mr-4"
                    >
                      <Star className="h-4 w-4 mr-1" />
                      Review Babysitter
                    </Button>
                  )}
                <div className="flex justify-between gap-2 mt-5">
                  {user?.user_metadata?.userType === "parent" && (
                    <Button
                      className="flex items-center gap-1"
                      onClick={() => setShowBookingInfo(true)}
                    >
                      <IoMdInformationCircleOutline className="h-4 w-4" />
                      Booking Info
                    </Button>
                  )}

                  <ChatDialog
                    currentUserId={parent?.user_id}
                    currentUserName= {parent?.fullName}
                    otherUserId={babysitter?.user_id}
                    currentUserPhone={parent?.phoneNumber}
                    otherUserPhone={babysitter?.phoneNumber}
                    otherUserName={babysitter?.fullName}
                    trigger={
                      <button className="bg-[#3c5679] hover:bg-[#2c4059] text-white rounded-[4px] px-4 py-2 text-sm tracking-wide font-medium shadow-sm flex items-center gap-1">
                        <IoIosChatboxes className="h-4 w-4" />
                        Chat
                      </button>
                    }
                  />
                </div>
              </>
            )}

            {/* Babysitter logged in → show parent details */}
            {user?.user_metadata?.userType === "babysitter" && parent && (
              <>
                <div className="sm:mr-4 sm:mt-3">
                    <Avatar className="h-14 w-14">
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
                </div>
                <div className={"w-full"}>
                  <h3 className="text-lg font-medium text-neutral-800">
                    {parent.fullName}’s children:{" "}
                    {booking.children
                      .map((child) => `${child.firstName} ${child.lastName}`)
                      .join(", ")
                      .replace(/, ([^,]*)$/, " and $1")}
                  </h3>
                  {/* <p className="font-bold">
                  Address :{" "}
                  <span className="font-medium">{booking?.address}</span>
                </p> */}
                  <p className="font-bold">
                    parent Name :{" "}
                    <span className="font-medium">{parent.fullName}</span>
                  </p>
                  <div className="mt-1 flex items-center text-sm text-neutral-600">
                    <CalendarIcon className="mr-2 h-4 w-4" />
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
                  <div className="flex flex-col xs:flex-row justify-between gap-3 mt-5">
                    <div className={"flex gap-2 w-auto"}>
                      <Select
                        value={babySitterStatus}
                        onValueChange={(value) =>
                          updateBabySitterStatus(booking.id, value, type)
                        }
                      >
                        <SelectTrigger className="w-full !h-8">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          {["Booked", "Away", "Completed"].map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-end flex-shrink-0 space-x-2">
                      {/* Navigation button for babysitters on confirmed or in-progress bookings  */}
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
                            <ChatDialog
                              currentUserId={babysitter?.user_id}
                              currentUserName={babysitter?.fullName}
                              otherUserId={parent?.user_id}
                              currentUserPhone={babysitter?.phoneNumber}
                              otherUserPhone={parent?.phoneNumber}
                              otherUserName={parent?.fullName}
                              trigger={
                                <button className="bg-[#3c5679] hover:bg-[#2c4059] text-white rounded-[4px] px-4 py-2 text-sm tracking-wide font-medium shadow-sm flex items-center gap-1">
                                  <IoIosChatboxes className="h-4 w-4" />
                                  Chat
                                </button>
                              }
                            />
                          </>
                        )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="flex items-center justify-between sm:mt-0 sm:ml-6">
            <div className="ml-4 flex flex-shrink-0 space-x-2">
              {/* Review button for babysitters on completed bookings  */}
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
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold">
                Review {babysitter.fullName}
              </h2>
              <button
                onClick={() => setShowParentReviewForm(false)}
                className="text-gray-400 hover:text-gray-600 font-bold text-xl"
              >
                <IoMdClose />
              </button>
            </div>
            <div className="p-6">
              <ParentReviewForm
                booking={booking}
                babysitter={babysitter}
                parent={parent}
                onSuccess={() => {
                  setShowParentReviewForm(false);
                  checkReview();
                }}
              />
            </div>
          </div>
        </div>
      )}

      <Dialog
        open={showNavigation && !!booking?.address}
        onOpenChange={(open) => setShowNavigation(open)}
      >
        {booking?.address && (
          <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-y-auto pb-28 xxl:pb-10">
            <DialogHeader className="flex flex-row items-center justify-between">
              <DialogTitle>
                Navigate to {parent.fullName}'s Home
              </DialogTitle>
            </DialogHeader>
            <div className="p-4 sm:p-6">
              <NavigationMap
                destinationAddress={booking.address}
                onNavigationStart={() => setShowNavigation(false)}
              />
            </div>
          </DialogContent>
        )}
      </Dialog>

      {showBookingInfo && (
        <BookingConfirmation
          isOpen={showBookingInfo}
          onClose={handleConfirmationClose}
          sitter={babysitter}
          bookingDetails={booking}
        />
      )}
    </div>
  );
}
