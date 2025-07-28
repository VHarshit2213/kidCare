import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { User, InstantCareFormData, babysitterProfile } from "@/lib/types";
import { Booking } from "@/lib/types";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Spinner } from "./ui/spinner";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import mapboxgl from "mapbox-gl";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

interface BookingConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  sitter: babysitterProfile & { distance: number };
  bookingDetails: InstantCareFormData;
}

export default function BookingConfirmation({
  isOpen,
  onClose,
  sitter,
  bookingDetails,
}: BookingConfirmationProps) {
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [estimatedArrival, setEstimatedArrival] = useState<string | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);

  // Calculate estimated arrival time based on distance
  const calculateArrivalTime = (distance: number) => {
    // Assume average driving speed of 25 mph for city driving
    const averageSpeedMph = 25;

    // Calculate travel time in minutes
    const travelTimeMinutes = Math.ceil((distance / averageSpeedMph) * 60);

    // Add random 1-5 minutes for preparation time
    const prepTimeMinutes = Math.floor(Math.random() * 5) + 1;

    // Total time in minutes
    const totalMinutes = travelTimeMinutes + prepTimeMinutes;

    // Calculate arrival time
    const now = new Date();
    const arrivalTime = new Date(now.getTime() + totalMinutes * 60000);

    return {
      minutes: totalMinutes,
      timeDisplay: format(arrivalTime, "h:mm a"),
      fullTime: arrivalTime,
    };
  };

  // Try to get user's geolocation when component mounts
  useEffect(() => {
    if (isOpen && navigator.geolocation) {
      setLoadingLocation(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });

          // Calculate and set estimated arrival time
          const arrival = calculateArrivalTime(sitter.distance);
          setEstimatedArrival(
            `${arrival.timeDisplay} (in about ${arrival.minutes} minutes)`,
          );
          setLoadingLocation(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          // Fallback to distance-based calculation without precise location
          const arrival = calculateArrivalTime(sitter.distance);
          setEstimatedArrival(
            `${arrival.timeDisplay} (in about ${arrival.minutes} minutes)`,
          );
          setLoadingLocation(false);
        },
        { timeout: 10000, enableHighAccuracy: true },
      );
    }
  }, [isOpen, sitter.distance]);

  // ------------------old code for reference------------

  // Generate a map URL for display
  // const getMapUrl = () => {
  //   if (!userLocation) return null;

  //   // In a real application, you would use a proper mapping service
  //   // This is a basic Google Maps static image URL
  //   const mapParams = `center=${userLocation.lat},${userLocation.lng}&zoom=14&size=400x200&markers=color:red%7C${userLocation.lat},${userLocation.lng}`;

  //   return `https://maps.googleapis.com/maps/api/staticmap?${mapParams}`;
  // };

  // ------------------old code for reference------------

  // -----------------new code------------

  const getMapUrl = () => {
    if (!userLocation) return null;

    const { lat, lng } = userLocation;
    const zoom = 14;
    const width = 400;
    const height = 200;

    return `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/pin-s+ff0000(${lng},${lat})/${lng},${lat},${zoom}/${width}x${height}?access_token=${mapboxgl.accessToken}`;
  };

  // --------------------new code------------

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Booking Confirmed!</DialogTitle>
          <DialogDescription>
            {sitter.fullName} will be on their way shortly
          </DialogDescription>
        </DialogHeader>

        <Card className="p-4 mt-4 bg-brand-pink/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-8 w-8 rounded-full bg-brand-pink/20 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="icon-brand"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <div className="font-medium text-brand-blue">
              Booking completed successfully
            </div>
          </div>
        </Card>

        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Your Babysitter</h3>
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 border">
              {sitter.profileImageUrl ? (
                <AvatarImage
                  src={sitter.profileImageUrl}
                  alt={sitter.fullName}
                />
              ) : (
                <div className="bg-brand-pink/20 flex items-center justify-center h-full w-full text-brand-blue font-semibold">
                  {sitter.fullName.charAt(0)}
                </div>
              )}
            </Avatar>
            <div>
              <p className="font-medium">{sitter.fullName}</p>
              <p className="text-sm text-muted-foreground">
                {sitter.distance} miles away • ${sitter.horulyRate}/hr
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-brand-blue/5 p-4 rounded-lg">
          <h3 className="text-md font-medium mb-2 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2 icon-brand"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            Estimated Arrival
          </h3>

          {loadingLocation ? (
            <div className="flex items-center text-sm text-muted-foreground">
              <Spinner className="h-4 w-4 mr-2" />
              <span>Calculating arrival time...</span>
            </div>
          ) : (
            <div className="flex justify-between items-center">
              <p className="text-lg font-semibold">
                {estimatedArrival || "Calculating..."}
              </p>
              {userLocation && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${userLocation.lat},${userLocation.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Badge
                    variant="outline"
                    className="px-2 border-brand-pink text-brand-blue"
                  >
                    open Location
                  </Badge>
                </a>
              )}
            </div>
          )}

          {userLocation && (
            <div className="mt-3 h-40 rounded-md bg-gray-200 overflow-hidden relative">
              {getMapUrl() ? (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${userLocation.lat},${userLocation.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src={getMapUrl()!}
                    alt="Your location"
                    className="w-full h-full object-cover cursor-pointer"
                  />
                </a>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">
                    Location map unavailable
                  </p>
                </div>
              )}
              <div className="absolute bottom-2 right-2">
                <Badge className="bg-brand-blue" variant="default">
                  Your Location
                </Badge>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6">
          <h3 className="text-md font-medium mb-2">Booking Details</h3>
          <div className="text-sm space-y-1 text-muted-foreground">
            <p>
              <span className="font-medium text-foreground">Children:</span>{" "}
              {bookingDetails.children.map((child, index) => (
                <span key={child.id}>
                  {child.firstName} {child.lastName}
                  {index < bookingDetails.children.length - 1 ? ", " : ""}
                </span>
              ))}
            </p>
            {bookingDetails.date ? (
              <p>
                <span className="font-medium text-foreground">Time:</span>{" "}
                {format(bookingDetails.date, "MMM d, yyyy")} (
                {bookingDetails.startTime} -{bookingDetails.endTime})
              </p>
            ) : (
              <>
                <p>
                  <span className="font-medium text-foreground">Time:</span>{" "}
                  {format(new Date(bookingDetails.startTime), "MMM d, h:mm a")}{" "}
                  - {format(new Date(bookingDetails.endTime), "h:mm a")}
                </p>
              </>
            )}

            {bookingDetails.careInstructions && (
              <p>
                <span className="font-medium text-foreground">
                  Special Instructions:
                </span>{" "}
                {bookingDetails.careInstructions}
              </p>
            )}
          </div>
        </div>

        {/* <div className="mt-6 bg-brand-blue/5 p-4 rounded-lg">
          <h3 className="text-md font-medium mb-3">Stay Connected</h3>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="flex items-center justify-center gap-2 border-brand-pink hover:bg-brand-pink/10"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
              Call Sitter
            </Button>
            <Button
              variant="outline"
              className="flex items-center justify-center gap-2 border-brand-pink hover:bg-brand-pink/10"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              Message
            </Button>
          </div>
        </div> */}

        <div className="mt-6 pt-4 border-t flex justify-end">
          <Button
            onClick={onClose}
            style={{ backgroundColor: "#3c5679" }}
            className="text-white font-medium"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
