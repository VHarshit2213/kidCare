import Layout from "@/components/Layout";
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

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase();
};

const Reviews = () => {
  const { getSignedUrl } = useSignedUrl();
  const { user } = useAuth();
  const isAuthenticated = !!user;

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

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

      if (reviewsError) console.error("Error fetching reviews:", reviewsError);

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

      setReviews(reviewData);
      setLoading(false);
    };

    fetchReviews();
  }, [user]);


  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-neutral-800 mb-6">My Reviews</h1>

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
          <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-neutral-200 p-8 text-center">
            <p className="text-neutral-600">No reviews yet.</p>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6">
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
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{label}</span>
                          <span className="text-yellow-500 flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-5 w-5 ${
                                  star <= (review?.[key] || 0)
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
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
        )}
      </div>
    </Layout>
  );
};

export default Reviews;
