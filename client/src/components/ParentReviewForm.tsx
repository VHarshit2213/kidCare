import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  insertParentReviewSchema,
  type Booking,
  type User,
} from "@shared/schema";
import supabase from "@/config/supabaseClient";

// const parentReviewFormSchema = insertParentReviewSchema.extend({
//   punctuality: z.number().min(1).max(5),
//   communication: z.number().min(1).max(5),
//   childEngagement: z.number().min(1).max(5),
//   safety: z.number().min(1).max(5),
//   cleanlinessResponsibility: z.number().min(1).max(5),
//   followsInstructions: z.number().min(1).max(5),
//   childReaction: z.number().min(1).max(5),
//   wouldBookAgain: z.number().min(1).max(5),
//   notes: z.string().optional(),
// });

const parentReviewFormSchema = z.object({
  punctuality: z.number().min(1, { message: "Please rate punctuality." }),
  communication: z.number().min(1, { message: "Please rate communication." }),
  childEngagement: z
    .number()
    .min(1, { message: "Please rate child engagement." }),
  safety: z.number().min(1, { message: "Please rate safety." }),
  cleanlinessResponsibility: z
    .number()
    .min(1, { message: "Please rate cleanliness & responsibility." }),
  followsInstructions: z
    .number()
    .min(1, { message: "Please rate how well they followed instructions." }),
  childReaction: z
    .number()
    .min(1, { message: "Please rate child's reaction." }),
  wouldBookAgain: z
    .number()
    .min(1, { message: "Please rate whether you would book again." }),
  notes: z.string().optional(),
});

type ParentReviewFormValues = z.infer<typeof parentReviewFormSchema>;

interface ParentReviewFormProps {
  booking: Booking;
  babysitter: User;
  parent: any;
  onSuccess: () => void;
}

const criteriaLabels = {
  punctuality: "Punctuality",
  communication: "Communication",
  childEngagement: "Child Engagement",
  safety: "Safety",
  cleanlinessResponsibility: "Cleanliness & Responsibility",
  followsInstructions: "Follows Instructions",
  childReaction: "Child's Reaction",
  wouldBookAgain: "Would Book Again",
};

const criteriaDescriptions = {
  punctuality: "Was the babysitter on time for the booking?",
  communication: "How well did the babysitter communicate with you?",
  childEngagement: "How well did the babysitter engage with your child?",
  safety: "How safe did you feel leaving your child with this babysitter?",
  cleanlinessResponsibility:
    "How responsible was the babysitter with your home and child's care?",
  followsInstructions: "How well did the babysitter follow your instructions?",
  childReaction: "How did your child react to the babysitter?",
  wouldBookAgain: "Would you book this babysitter again?",
};

function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="text-2xl transition-colors hover:scale-110"
        >
          <Star
            className={`h-6 w-6 ${
              star <= value
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300 hover:text-yellow-400"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export default function ParentReviewForm({
  booking,
  babysitter,
  parent,
  onSuccess,
}: ParentReviewFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ParentReviewFormValues>({
    resolver: zodResolver(parentReviewFormSchema),
    defaultValues: {
      punctuality: 0,
      communication: 0,
      childEngagement: 0,
      safety: 0,
      cleanlinessResponsibility: 0,
      followsInstructions: 0,
      childReaction: 0,
      wouldBookAgain: 0,
      notes: "",
    },
  });

  // const createReviewMutation = useMutation({
  //   mutationFn: async (data: ParentReviewFormValues) => {
  //     const response = await apiRequest("POST", "/api/parent-reviews", data);
  //     return response.json();
  //   },
  //   onSuccess: () => {
  //     toast({
  //       title: "Review Submitted",
  //       description: "Thank you for your feedback!",
  //     });
  //     queryClient.invalidateQueries({ queryKey: ["/api/bookings/parent"] });
  //     queryClient.invalidateQueries({
  //       queryKey: ["/api/parent-reviews/booking", booking.id],
  //     });
  //     onSuccess();
  //   },
  //   onError: (error: any) => {
  //     toast({
  //       title: "Error",
  //       description: error.message || "Failed to submit review",
  //       variant: "destructive",
  //     });
  //   },
  // });

  // const onSubmit = async (values: ParentReviewFormValues) => {
  //   setIsSubmitting(true);
  //   try {
  //     await createReviewMutation.mutateAsync(values);
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };

  const onSubmit = async (values: ParentReviewFormValues) => {
    setIsSubmitting(true);
    try {
      // Calculate average (overall rating)
      const ratings = [
        values.punctuality,
        values.communication,
        values.childEngagement,
        values.safety,
        values.cleanlinessResponsibility,
        values.followsInstructions,
        values.childReaction,
        values.wouldBookAgain,
      ];

      const overallRating = parseFloat(
        (ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length).toFixed(2)
      );

      const payload = {
        bookingId: booking.id,
        parent_id: parent.user_id,
        babysitter_id: babysitter.user_id,
        overAllRating: overallRating,
        ...values,
      };

      const { error } = await supabase.from("reviews").insert([payload]);

      if (error) throw error;

      toast({
        title: "Review Submitted",
        description: "Thank you for your feedback!",
      });

      onSuccess();
    } catch (err: any) {
      toast({
        title: "Error",
        description:
          err.message || "Something went wrong while submitting your review.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Review {babysitter.fullName}</CardTitle>
        <CardDescription>
          Please rate your experience with {babysitter.fullName} for the
          babysitting session on{" "}
          {new Date(booking.startTime).toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {Object.entries(criteriaLabels).map(([key, label]) => (
              <FormField
                key={key}
                control={form.control}
                name={key as keyof ParentReviewFormValues}
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-base font-medium">
                      {label}
                    </FormLabel>
                    <p className="text-sm text-muted-foreground">
                      {
                        criteriaDescriptions[
                          key as keyof typeof criteriaDescriptions
                        ]
                      }
                    </p>
                    <FormControl>
                      <StarRating
                        value={field.value as number}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Comments (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Share any additional thoughts about your experience..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
