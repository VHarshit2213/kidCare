import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Booking } from "@shared/schema";

interface ReviewFormProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking;
  parentName: string;
}

const reviewCriteria = [
  {
    key: "clarityOfExpectations",
    label: "Clarity of Expectations",
    description: "Were the instructions for the job clear and reasonable?"
  },
  {
    key: "communication",
    label: "Communication",
    description: "Was the parent responsive and respectful during communication?"
  },
  {
    key: "childBehavior",
    label: "Child Behavior",
    description: "Was the child generally well-behaved and manageable?"
  },
  {
    key: "environment",
    label: "Environment",
    description: "Was the work environment safe and clean?"
  },
  {
    key: "timeliness",
    label: "Timeliness",
    description: "Did the parent return on time or communicate delays?"
  },
  {
    key: "respect",
    label: "Respect",
    description: "Were you treated respectfully?"
  },
  {
    key: "emergencyPreparation",
    label: "Emergency Info & Preparation",
    description: "Did the parent provide necessary emergency contact or health information?"
  },
  {
    key: "wouldSitAgain",
    label: "Would You Sit for Them Again?",
    description: "Would you be happy to babysit for this family again?"
  }
];

export default function ReviewForm({ isOpen, onClose, booking, parentName }: ReviewFormProps) {
  const [ratings, setRatings] = useState<{[key: string]: number}>({});
  const [notes, setNotes] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createReviewMutation = useMutation({
    mutationFn: async (reviewData: any) => {
      const res = await apiRequest("POST", "/api/reviews", reviewData);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Review Submitted",
        description: "Thank you for your feedback!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/bookings/babysitter'] });
      onClose();
      // Reset form
      setRatings({});
      setNotes("");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to submit review",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleRatingChange = (criteriaKey: string, rating: number) => {
    setRatings(prev => ({ ...prev, [criteriaKey]: rating }));
  };

  const handleSubmit = () => {
    // Check if all ratings are provided
    const missingRatings = reviewCriteria.filter(criteria => !ratings[criteria.key]);
    if (missingRatings.length > 0) {
      toast({
        title: "Please complete all ratings",
        description: "All criteria must be rated before submitting.",
        variant: "destructive",
      });
      return;
    }

    const reviewData = {
      bookingId: booking.id,
      revieweeId: booking.parentId,
      notes: notes || null,
      ...ratings
    };

    createReviewMutation.mutate(reviewData);
  };

  const StarRating = ({ value, onChange }: { value: number; onChange: (rating: number) => void }) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="focus:outline-none"
          >
            <Star
              className={`h-6 w-6 ${
                star <= value 
                  ? "fill-yellow-400 text-yellow-400" 
                  : "text-gray-300 hover:text-yellow-400"
              } transition-colors`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Review Your Experience with {parentName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Booking:</strong> {booking.childName} • {new Date(booking.startTime).toLocaleDateString()} 
              {" "}{new Date(booking.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - 
              {" "}{new Date(booking.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </p>
          </div>

          {reviewCriteria.map((criteria) => (
            <div key={criteria.key} className="space-y-2">
              <Label className="text-base font-medium">{criteria.label}</Label>
              <p className="text-sm text-gray-600">{criteria.description}</p>
              <StarRating 
                value={ratings[criteria.key] || 0} 
                onChange={(rating) => handleRatingChange(criteria.key, rating)}
              />
            </div>
          ))}

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-base font-medium">Additional Comments (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Share any additional feedback or comments about your experience..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              onClick={handleSubmit}
              disabled={createReviewMutation.isPending}
              className="flex-1"
            >
              {createReviewMutation.isPending ? "Submitting..." : "Submit Review"}
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              disabled={createReviewMutation.isPending}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}