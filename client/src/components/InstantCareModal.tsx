import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { InstantCareFormData, Child } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import AvailableSittersPopup from "@/components/AvailableSittersPopup";
import { X, Plus, Check } from "lucide-react";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface InstantCareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const instantCareSchema = z.object({
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  children: z.array(z.object({
    id: z.string(),
    name: z.string()
  })).min(1, "Please select at least one child"),
  careInstructions: z.string().optional(),
}).refine(data => new Date(data.startTime) < new Date(data.endTime), {
  message: "End time must be after start time",
  path: ['endTime']
});

export default function InstantCareModal({ isOpen, onClose }: InstantCareModalProps) {
  const { toast } = useToast();
  const [bookingDetails, setBookingDetails] = useState<InstantCareFormData | null>(null);
  const [showSittersPopup, setShowSittersPopup] = useState(false);
  const [childInput, setChildInput] = useState("");
  const [minDate, setMinDate] = useState<string>("");
  const [maxDate, setMaxDate] = useState<string>("");
  const [hoursNeeded, setHoursNeeded] = useState<number>(2);
  
  // Set time constraints for the current day only
  useEffect(() => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    setMinDate(format(today, "yyyy-MM-dd'T'HH:mm"));
    setMaxDate(format(tomorrow, "yyyy-MM-dd'T'00:00"));
  }, []);
  
  // Update end time when start time or hours needed changes
  const updateEndTime = (startTimeStr: string, hours: number) => {
    if (startTimeStr) {
      const startTime = new Date(startTimeStr);
      const endTime = new Date(startTime);
      endTime.setHours(endTime.getHours() + hours);
      
      form.setValue("endTime", format(endTime, "yyyy-MM-dd'T'HH:mm"));
    }
  };
  
  // Mock children for demonstration purposes
  const [childOptions] = useState<Child[]>([
    { id: "1", name: "Emma" },
    { id: "2", name: "Noah" },
    { id: "3", name: "Olivia" },
    { id: "4", name: "Liam" },
    { id: "5", name: "Ava" }
  ]);

  const form = useForm<InstantCareFormData>({
    resolver: zodResolver(instantCareSchema),
    defaultValues: {
      startTime: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      endTime: format(new Date(new Date().getTime() + 4 * 60 * 60 * 1000), "yyyy-MM-dd'T'HH:mm"),
      children: [],
      careInstructions: "",
    },
  });

  const createBookingMutation = useMutation({
    mutationFn: async (data: InstantCareFormData) => {
      // Transform the data to match what the backend expects
      const childNames = data.children.map(child => child.name).join(", ");
      
      const response = await apiRequest("POST", "/api/bookings", {
        parentId: 1, // Using a default parent ID since we're not requiring login
        startTime: data.startTime,
        endTime: data.endTime,
        childName: childNames, // Combine child names for the backend
        careInstructions: data.careInstructions,
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
              <div className="grid grid-cols-1 gap-4">
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
                              className="h-5 w-5 icon-brand"
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
                            min={minDate}
                            max={maxDate}
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              updateEndTime(e.target.value, hoursNeeded);
                            }}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div>
                  <label className="block text-sm font-medium mb-2">Hours Needed</label>
                  <div className="flex items-center space-x-2">
                    <Select
                      value={hoursNeeded.toString()}
                      onValueChange={(value) => {
                        const hours = parseInt(value);
                        setHoursNeeded(hours);
                        updateEndTime(form.getValues("startTime"), hours);
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select hours" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((hours) => (
                          <SelectItem key={hours} value={hours.toString()}>
                            {hours} {hours === 1 ? 'hour' : 'hours'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

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
                              className="h-5 w-5 icon-brand"
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
                            min={minDate}
                            max={maxDate}
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
                name="children"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Children</FormLabel>
                    <FormControl>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "w-full justify-between",
                              !field.value?.length && "text-muted-foreground"
                            )}
                          >
                            {field.value?.length > 0
                              ? `${field.value.length} children selected`
                              : "Select children..."}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[300px] p-0">
                          <div className="p-4 space-y-2">
                            {childOptions.map((child) => {
                              const isSelected = field.value?.some(
                                (selectedChild) => selectedChild.id === child.id
                              );
                              return (
                                <div
                                  key={child.id}
                                  className="flex items-center space-x-2 rounded px-2 py-1 hover:bg-accent cursor-pointer"
                                  onClick={() => {
                                    const newValue = isSelected
                                      ? field.value.filter(
                                          (selectedChild) => selectedChild.id !== child.id
                                        )
                                      : [...(field.value || []), child];
                                    field.onChange(newValue);
                                  }}
                                >
                                  <Checkbox checked={isSelected} />
                                  <div>{child.name}</div>
                                  {isSelected && (
                                    <Check className="ml-auto h-4 w-4" />
                                  )}
                                </div>
                              );
                            })}
                            <div className="mt-4 pt-3 border-t flex justify-end">
                              <Button 
                                type="button" 
                                style={{ backgroundColor: "#3c5679" }}
                                className="text-white font-medium"
                                onClick={() => {
                                  const popover = document.querySelector('[role="combobox"]');
                                  if (popover) {
                                    (popover as HTMLElement).click();
                                  }
                                }}
                              >
                                Done
                              </Button>
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </FormControl>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {field.value?.map((child) => (
                        <Badge key={child.id} variant="outline" className="py-1 border-brand-pink text-brand-blue">
                          {child.name}
                          <X 
                            className="ml-1 h-3 w-3 cursor-pointer" 
                            onClick={() => {
                              field.onChange(
                                field.value.filter(
                                  (selectedChild) => selectedChild.id !== child.id
                                )
                              );
                            }} 
                          />
                        </Badge>
                      ))}
                    </div>

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
                style={{ backgroundColor: "#3c5679" }}
                className="w-full text-white font-medium"
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