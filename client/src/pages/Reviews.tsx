import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import React, { useEffect, useState } from "react";
import { Loader2, Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import supabase from "@/config/supabaseClient";
import { format } from "date-fns";
import { useSignedUrl } from "@/hooks/use-signedUrl";

const reviewCriteria = [
  {
    key: "punctuality",
    label: "Punctuality",
    description: "Your punctuality for the booking.",
  },
  {
    key: "communication",
    label: "Communication",
    description: "Your communication skills during the booking.",
  },
  {
    key: "childEngagement",
    label: "Child Engagement",
    description: "How well you engaged with the child.",
  },
  {
    key: "safety",
    label: "Safety",
    description: "The sense of safety you provided to the parent.",
  },
  {
    key: "cleanlinessResponsibility",
    label: "Cleanliness & Responsibility",
    description: "Your responsibility with the home and child's care.",
  },
  {
    key: "followsInstructions",
    label: "Follows Instructions",
    description: "How well you followed the parent's instructions.",
  },
  {
    key: "childReaction",
    label: "Child's Reaction",
    description: "The child's reaction to your care.",
  },
  {
    key: "wouldBookAgain",
    label: "Would Book Again",
    description: "Likelihood that the parent would book you again.",
  },
];

type Review = {
  id: string;
  created_at: string;
  overAllRating: number;
  parent_id: string;
  babysitter_id: string;
  notes?: string;
  parent?: {
    fullName: string;
    profile_image?: string;
    profileImageUrl?: string;
  };
  [key: string]: any;
};

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase();
};

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex items-center">
    {[1, 2, 3, 4, 5].map((star) => {
      const fillLevel = Math.min(Math.max(rating - star + 1, 0), 1);
      return (
        <div key={star} className="relative w-6 h-6">
          <Star className="absolute inset-0 text-gray-300" />
          <Star
            className="absolute inset-0 text-yellow-400 fill-yellow-400 transition-all duration-300"
            style={{
              clipPath: `inset(0 ${100 - fillLevel * 100}% 0 0)`,
            }}
          />
        </div>
      );
    })}
  </div>
);

const Reviews = () => {
  const { getSignedUrl } = useSignedUrl();
  const { user } = useAuth();
  const isAuthenticated = !!user;

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState<number | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchReviews = async () => {
      setLoading(true);

      // Fetch reviews for logged-in babysitter
      const { data: reviewsData, error: reviewsError } = await supabase
        .from("reviews")
        .select(`*`)
        .eq("babysitter_id", user.id)
        .order("created_at", { ascending: false });

      if (reviewsError || !reviewsData) {
        console.error(reviewsError);
        setReviews([]);
        setAverageRating(null);
        setLoading(false);
        return;
      }

      // Fetch parent profiles
      const parentIds = reviewsData.map((r) => r.parent_id);

      const { data: parentProfiles, error: parentError } = await supabase
        .from("parentprofile")
        .select("fullName, profile_image, user_id")
        .in("user_id", parentIds);

      if (parentError) console.error(parentError);

      // Get signed URLs for parent profile images
      const parentProfilesWithUrl = await Promise.all(
        (parentProfiles || []).map(async (parent) => {
          if (parent.profile_image) {
            const signedUrl = await getSignedUrl(parent.profile_image);
            return { ...parent, profileImageUrl: signedUrl };
          }
          return parent;
        })
      );

      // Merge reviews with parent profiles
      const reviewData = reviewsData.map((r) => ({
        ...r,
        parent:
          parentProfilesWithUrl.find((p) => p.user_id === r.parent_id) || null,
      }));

      // Calculate average overall rating
      const totalRating = reviewData.reduce(
        (acc, r) => acc + (r.overAllRating || 0),
        0
      );

      const avg = totalRating / reviewData.length;
      
      setAverageRating(Number(avg.toFixed(2)));
      setReviews(reviewData);
      setLoading(false);
    };

    fetchReviews();
  }, [user]);


  return (
    <>
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 xxl:py-8">
        <h1 className="text-lg xs:text-xl lg:text-2xl font-bold text-brand-blue mb-6">My Reviews</h1>

        {!isAuthenticated ? (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-neutral-200 p-8 text-center">
            <p className="text-neutral-600">
              reviews will appear here after login.
            </p>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center min-h-[50vh]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md overflow-hidden border border-neutral-200 p-8 text-center">
            <p className="text-neutral-600">No reviews yet.</p>
          </div>
        ) : (
          <>
            {averageRating && (
              <div className="flex items-center mb-6">
                <div className="flex flex-col xs:flex-row xs:items-center">
                  <span className="text-lg font-medium text-gray-700 mr-3">
                    Overall Rating :
                  </span>
                  <div className="flex items-center">
                    <StarRating rating={averageRating} />
                    <span className="ml-2 text-lg font-semibold text-gray-700">
                      {averageRating.toFixed(2)} / 5
                    </span>
                  </div>
                </div>
              </div>
            )}
            <div className="max-w-[1500px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
              {reviews.map((review) => (
                <Card key={review.id}>
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <Avatar className="h-20 w-20 sm:h-24 sm:w-24">
                        {review.parent?.profileImageUrl ? (
                          <AvatarImage
                            src={review.parent?.profileImageUrl}
                            alt={review.parent?.fullName}
                          />
                        ) : (
                          <AvatarFallback className="text-xl">
                            {getInitials(review.parent?.fullName || "User")}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div>
                        <CardTitle className="capitalize text-xl font-semibold">
                          {review.parent?.fullName || "User"}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {format(new Date(review.created_at), "dd-MM-yyyy")}
                        </p>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-4">
                      {reviewCriteria.map(({ key, label, description }) => (
                        <div key={key} className="border-b pb-2">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-medium">{label}</span>
                            <span className="flex">
                              <StarRating rating={review[key] || 0} />
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">{description}</p>
                        </div>
                      ))}

                      {review.notes && (
                        <p className="mt-3 italic text-sm text-gray-600">
                          "{review.notes}"
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Reviews;
