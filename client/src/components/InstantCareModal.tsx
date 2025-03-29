import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { InstantCareFormData } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import AvailableSittersPopup from "@/components/AvailableSittersPopup";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

interface InstantCareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const instantCareSchema = z.object({
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  childName: z.string().min(1, "Child's name is required"),
  careInstructions: z.string().optional(),
}).refine(data => new Date(data.startTime) < new Date(data.endTime), {
  message: "End time must be after start time",
  path: ['endTime']
});

export default function InstantCareModal({ isOpen, onClose }: InstantCareModalProps) {
  const { toast } = useToast();
  const [bookingDetails, setBookingDetails] = useState<InstantCareFormData | null>(null);
  const [showSittersPopup, setShowSittersPopup] = useState(false);

  const form = useForm<InstantCareFormData>({
    resolver: zodResolver(instantCareSchema),
    defaultValues: {
      startTime: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      endTime: format(new Date(new Date().getTime() + 4 * 60 * 60 * 1000), "yyyy-MM-dd'T'HH:mm"),
      childName: "",
      careInstructions: "",
    },
  });

  const createBookingMutation = useMutation({
    mutationFn: async (data: InstantCareFormData) => {
      const response = await apiRequest("POST", "/api/bookings", {
        parentId: 1, // Using a default parent ID since we're not requiring login
        ...data,
        // Adding these fields with default values since they're required by the backend
        requiresFirstAid: false,
        requiresTransportation: false,
        requiresExperience: false,
      });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Your babysitting request has been submitted.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings/parent"] });
      onClose();
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create booking: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InstantCareFormData) => {
    // Store booking details and show available sitters instead of immediately submitting
    setBookingDetails(data);
    setShowSittersPopup(true);
  };
  
  const handleSittersPopupClose = () => {
    setShowSittersPopup(false);
    // Optional: Close the main form if desired
    // onClose();
  };
  
  const handleBookingSitter = (sitterId: number) => {
    // When a sitter is selected in the popup, we'll submit the booking with that sitter
    if (bookingDetails) {
      createBookingMutation.mutate({
        ...bookingDetails,
        babysitterId: sitterId,
      } as any); // Using any temporarily to bypass type checking for babysitterId
    }
  };

  return (
    <>
      <Dialog open={isOpen && !showSittersPopup} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Request Instant Childcare</DialogTitle>
            <DialogDescription>
              Fill out the details below and connect with available babysitters near you.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 text-gray-400"
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
                          </div>
                          <Input
                            type="datetime-local"
                            className="pl-10"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Time</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 text-gray-400"
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
                          </div>
                          <Input
                            type="datetime-local"
                            className="pl-10"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="childName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Child's Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="careInstructions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Care Instructions (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Special needs, meal times, bedtime routine, activities, etc."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
              >
                Find Available Sitters
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Popup with available sitters */}
      {bookingDetails && (
        <AvailableSittersPopup
          isOpen={showSittersPopup}
          onClose={handleSittersPopupClose}
          bookingDetails={bookingDetails}
        />
      )}
    </>
  );
}
