import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, InstantCareFormData } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { Booking } from "@/lib/types";
import { Spinner } from "./ui/spinner";
import BookingConfirmation from "./BookingConfirmation";

interface AvailableSittersPopupProps {
  isOpen: boolean;
  onClose: () => void;
  bookingDetails: InstantCareFormData;
}

// This function simulates calculating distance between two points
// In a real app, this would use geolocation and a distance calculation algorithm
const calculateDistance = (location: string | undefined): number => {
  // For this demo, generate a random distance between 0.5 and 15 miles
  return parseFloat((Math.random() * 14.5 + 0.5).toFixed(1));
};

// This function checks if sitter is available during requested time
// In a real app, this would check the sitter's schedule against the requested time
const isSitterAvailableDuringTime = (sitter: User): boolean => {
  // For this demo, make 70% of sitters available
  return Math.random() > 0.3;
};

export default function AvailableSittersPopup({
  isOpen,
  onClose,
  bookingDetails,
  nearbySitters,
}: AvailableSittersPopupProps) {
  const [selectedSitter, setSelectedSitter] = useState<number | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [bookedSitter, setBookedSitter] = useState<
    (User & { distance: number }) | null
  >(null);

  // Fetch all babysitters
  const { data, isLoading } = useQuery<User[]>({
    queryKey: ["/api/babysitters"],
  });

  // Ensure we have an array to work with
  const allSitters: User[] = data || [];

  // Filter and sort sitters
  const availableSitters: (User & { distance: number })[] = allSitters
    .filter(
      (sitter: User) =>
        // Only show sitters who are available (not busy or offline)
        sitter.availabilityStatus === "available" &&
        // Check if sitter is available during the requested time
        isSitterAvailableDuringTime(sitter),
    )
    .map((sitter: User) => {
      // Add distance information
      const distance = calculateDistance(sitter.location);
      return { ...sitter, distance };
    })
    .filter(
      (sitter: User & { distance: number }) =>
        // Filter sitters within 8 miles
        sitter.distance <= 8,
    )
    .sort(
      (a: User & { distance: number }, b: User & { distance: number }) =>
        // Sort by distance (closest first)
        a.distance - b.distance,
    )
    .slice(0, 3); // Limit to 3 sitters

  const handleBookNow = (sitterId: number) => {
    setSelectedSitter(sitterId);

    // Find the selected sitter from the filtered list
    const sitter = availableSitters.find((s) => s.id === sitterId);

    // Store the booked sitter
    if (sitter) {
      setBookedSitter(sitter);

      // In a real implementation, you would send the booking to the server here

      // Simulate a brief loading state
      setTimeout(() => {
        setShowConfirmation(true);
      }, 800);
    }
  };

  const handleConfirmationClose = () => {
    setShowConfirmation(false);
    setSelectedSitter(null);
    setBookedSitter(null);
    onClose();
  };

  // Don't show the sitters dialog if we're showing confirmation
  if (showConfirmation && bookedSitter) {
    return (
      <BookingConfirmation
        isOpen={showConfirmation}
        onClose={handleConfirmationClose}
        sitter={bookedSitter}
        bookingDetails={bookingDetails}
      />
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Available Sitters Near You</DialogTitle>
          <DialogDescription>
            We found {nearbySitters.length} sitters available within 8 miles for
            your request
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Spinner className="w-8 h-8" />
            <span className="ml-2">Finding available sitters...</span>
          </div>
        ) : nearbySitters.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-lg font-medium mb-4">No sitters available</p>
            <p className="text-muted-foreground mb-6">
              We couldn't find any available sitters within 8 miles for your
              requested time.
            </p>
            <Button
              onClick={onClose}
              style={{ backgroundColor: "#3c5679" }}
              className="text-white font-medium"
            >
              Try Different Time
            </Button>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            {nearbySitters.map((sitter) => (
              <Card key={sitter.userId} className="p-4">
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12 border">
                    {sitter?.profileImageUrl ? (
                      <img
                        src={sitter?.profileImageUrl}
                        alt={sitter?.fullName}
                      />
                    ) : (
                      <div className="bg-brand-pink/20 flex items-center justify-center h-full w-full text-brand-blue font-semibold">
                        {sitter?.fullName?.charAt(0)}
                      </div>
                    )}
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <p
                          className={`text-sm font-medium ${sitter?.isAvailable ? "text-green-600" : "text-red-600"}`}
                        >
                          {sitter?.isAvailable ? "Online" : "Offline"}
                        </p>
                        <h3 className="font-semibold">{sitter?.fullName}</h3>
                        <p className="text-sm text-muted-foreground">
                          {sitter?.distance.toFixed(2)} miles away • $
                          {sitter?.horulyRate}
                          /hr
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Badge
                          variant="outline"
                          className="px-2 py-0.5 border-brand-blue text-brand-blue"
                        >
                          {sitter?.experience} yrs exp
                        </Badge>
                      </div>
                    </div>

                    <div className="mt-2 flex flex-wrap gap-1">
                      {sitter?.certified && (
                        <Badge
                          variant="outline"
                          className="text-xs px-2 border-brand-pink text-brand-blue"
                        >
                          First Aid
                        </Badge>
                      )}
                      {sitter?.transportation && (
                        <Badge
                          variant="outline"
                          className="text-xs px-2 border-brand-pink text-brand-blue"
                        >
                          Transportation
                        </Badge>
                      )}
                      {sitter?.parentSkill?.slice(0, 2).map((skill, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs px-2 border-brand-pink text-brand-blue"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>

                    <div className="mt-3 flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          window.alert(
                            `Viewing ${sitter?.fullName}'s profile...`,
                          )
                        }
                        style={{ borderColor: "#3c5679", color: "#3c5679" }}
                      >
                        View Profile
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleBookNow(sitter.id)}
                        disabled={selectedSitter === sitter.id}
                        style={{ backgroundColor: "#3c5679" }}
                        className="text-white font-medium"
                      >
                        {selectedSitter === sitter.id
                          ? "Booking..."
                          : "Book Now"}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
