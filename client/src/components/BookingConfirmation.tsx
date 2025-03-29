import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { User, InstantCareFormData } from "@/lib/types";
import { Booking } from "@/lib/types";
import { Avatar } from "@/components/ui/avatar";
import { Spinner } from "./ui/spinner";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";

interface BookingConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  sitter: User & { distance: number };
  bookingDetails: InstantCareFormData;
}

export default function BookingConfirmation({
  isOpen,
  onClose,
  sitter,
  bookingDetails
}: BookingConfirmationProps) {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
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
      fullTime: arrivalTime
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
            lng: position.coords.longitude
          });
          
          // Calculate and set estimated arrival time
          const arrival = calculateArrivalTime(sitter.distance);
          setEstimatedArrival(`${arrival.timeDisplay} (in about ${arrival.minutes} minutes)`);
          setLoadingLocation(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          // Fallback to distance-based calculation without precise location
          const arrival = calculateArrivalTime(sitter.distance);
          setEstimatedArrival(`${arrival.timeDisplay} (in about ${arrival.minutes} minutes)`);
          setLoadingLocation(false);
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    }
  }, [isOpen, sitter.distance]);

  // Generate a map URL for display
  const getMapUrl = () => {
    if (!userLocation) return null;
    
    // In a real application, you would use a proper mapping service
    // This is a basic Google Maps static image URL
    const mapParams = `center=${userLocation.lat},${userLocation.lng}&zoom=14&size=400x200&markers=color:red%7C${userLocation.lat},${userLocation.lng}`;
    
    return `https://maps.googleapis.com/maps/api/staticmap?${mapParams}`;
  };

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
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-blue">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <div className="font-medium text-brand-blue">Booking completed successfully</div>
          </div>
        </Card>

        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Your Babysitter</h3>
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 border">
              {sitter.profileImageUrl ? (
                <img src={sitter.profileImageUrl} alt={sitter.fullName} />
              ) : (
                <div className="bg-brand-pink/20 flex items-center justify-center h-full w-full text-brand-blue font-semibold">
                  {sitter.fullName.charAt(0)}
                </div>
              )}
            </Avatar>
            <div>
              <p className="font-medium">{sitter.fullName}</p>
              <p className="text-sm text-muted-foreground">
                {sitter.distance} miles away • ${sitter.hourlyRate}/hr
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-brand-blue/5 p-4 rounded-lg">
          <h3 className="text-md font-medium mb-2 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-brand-blue">
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
              <p className="text-lg font-semibold">{estimatedArrival || 'Calculating...'}</p>
              <Badge variant="outline" className="px-2 border-brand-pink text-brand-blue">Live Tracking</Badge>
            </div>
          )}
          
          {userLocation && (
            <div className="mt-3 h-40 rounded-md bg-gray-200 overflow-hidden relative">
              {getMapUrl() ? (
                <img 
                  src={getMapUrl()!} 
                  alt="Your location" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">Location map unavailable</p>
                </div>
              )}
              <div className="absolute bottom-2 right-2">
                <Badge className="bg-brand-blue" variant="default">Your Location</Badge>
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
                  {child.name}{index < bookingDetails.children.length - 1 ? ", " : ""}
                </span>
              ))}
            </p>
            <p>
              <span className="font-medium text-foreground">Time:</span>{" "}
              {format(new Date(bookingDetails.startTime), "MMM d, h:mm a")} - {format(new Date(bookingDetails.endTime), "h:mm a")}
            </p>
            {bookingDetails.careInstructions && (
              <p><span className="font-medium text-foreground">Special Instructions:</span> {bookingDetails.careInstructions}</p>
            )}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t flex justify-end">
          <Button onClick={onClose} className="btn-brand-primary">Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}