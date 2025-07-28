// ------------old code for reference------------

// import { useState, useEffect } from "react";
// import { useForm, Controller } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { z } from "zod";
// import { format } from "date-fns";
// import { useMutation, useQuery } from "@tanstack/react-query";
// import { apiRequest, getQueryFn } from "@/lib/queryClient";
// import { queryClient } from "@/lib/queryClient";
// import { InstantCareFormData, Child } from "@/lib/types";
// import { useToast } from "@/hooks/use-toast";
// import { useAuth } from "@/hooks/use-auth";
// import { useLocation } from "wouter";
// import AvailableSittersPopup from "@/components/AvailableSittersPopup";
// import { X, Plus, Check, AlertCircle } from "lucide-react";

// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
// } from "@/components/ui/dialog";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { Checkbox } from "@/components/ui/checkbox";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover";
// import { Badge } from "@/components/ui/badge";
// import { cn } from "@/lib/utils";

// interface InstantCareModalProps {
//   isOpen: boolean;
//   onClose: () => void;
// }

// const instantCareSchema = z.object({
//   startTime: z.string().min(1, "Start time is required"),
//   endTime: z.string().min(1, "End time is required"),
//   children: z.array(z.object({
//     id: z.string(),
//     name: z.string()
//   })).min(1, "Please select at least one child"),
//   careInstructions: z.string().optional(),
// }).refine(data => new Date(data.startTime) < new Date(data.endTime), {
//   message: "End time must be after start time",
//   path: ['endTime']
// });

// export default function InstantCareModal({ isOpen, onClose }: InstantCareModalProps) {
//   const { toast } = useToast();
//   const { user } = useAuth();
//   const [, navigate] = useLocation();
//   const [bookingDetails, setBookingDetails] = useState<InstantCareFormData | null>(null);
//   const [showSittersPopup, setShowSittersPopup] = useState(false);
//   const [childInput, setChildInput] = useState("");
//   const [minDate, setMinDate] = useState<string>("");
//   const [maxDate, setMaxDate] = useState<string>("");
//   const [hoursNeeded, setHoursNeeded] = useState<number>(2);

//   const hasMembership = !!user && (
//     user.membershipStatus === "active" ||
//     user.membershipStatus === "installment_2" ||
//     user.membershipStatus === "installment_1"
//   );

//   // Check if profile is completed
//   const hasCompletedProfile = !!user && user.profileCompleted === true;

//   // Set time constraints for the current day only
//   useEffect(() => {
//     const today = new Date();
//     const tomorrow = new Date(today);
//     tomorrow.setDate(tomorrow.getDate() + 1);
//     tomorrow.setHours(0, 0, 0, 0);

//     setMinDate(format(today, "yyyy-MM-dd'T'HH:mm"));
//     setMaxDate(format(tomorrow, "yyyy-MM-dd'T'00:00"));
//   }, []);

//   // Update end time when start time or hours needed changes
//   const updateEndTime = (startTimeStr: string, hours: number) => {
//     if (startTimeStr) {
//       const startTime = new Date(startTimeStr);
//       const endTime = new Date(startTime);
//       endTime.setHours(endTime.getHours() + hours);

//       form.setValue("endTime", format(endTime, "yyyy-MM-dd'T'HH:mm"));
//     }
//   };

//   // We'll use a simpler approach just to demonstrate the profile completion check
//   const [childOptions, setChildOptions] = useState<Child[]>([]);

//   // Initialize with current time and current time + hours needed
//   const now = new Date();
//   const nowPlusHours = new Date(now);
//   nowPlusHours.setHours(nowPlusHours.getHours() + hoursNeeded);

//   console.log("Initialize form with start time:", format(now, "yyyy-MM-dd'T'HH:mm"));
//   console.log("Initialize form with end time:", format(nowPlusHours, "yyyy-MM-dd'T'HH:mm"));

//   const form = useForm<InstantCareFormData>({
//     resolver: zodResolver(instantCareSchema),
//     defaultValues: {
//       startTime: format(now, "yyyy-MM-dd'T'HH:mm"),
//       endTime: format(nowPlusHours, "yyyy-MM-dd'T'HH:mm"),
//       children: [],
//       careInstructions: "",
//     },
//   });

//   // Log form values after initialization
//   console.log("Form values after initialization:", form.getValues());

//   const createBookingMutation = useMutation({
//     mutationFn: async (data: InstantCareFormData) => {
//       // Transform the data to match what the backend expects
//       const childNames = data.children.map(childId => {
//         const child = childOptions.find(c => c.id === childId);
//         return child ? `${child.firstName} ${child.lastName}` : '';
//       }).filter(Boolean).join(", ");

//       const response = await apiRequest("POST", "/api/bookings", {
//         parentId: 1, // Using a default parent ID since we're not requiring login
//         startTime: data.startTime,
//         endTime: data.endTime,
//         childName: childNames, // Combine child names for the backend
//         careInstructions: data.careInstructions,
//         // Adding these fields with default values since they're required by the backend
//         requiresFirstAid: false,
//         requiresTransportation: false,
//         requiresExperience: false,
//       });
//       return await response.json();
//     },
//     onSuccess: () => {
//       toast({
//         title: "Success!",
//         description: "Your babysitting request has been submitted.",
//       });
//       queryClient.invalidateQueries({ queryKey: ["/api/bookings/parent"] });
//       onClose();
//       form.reset();
//     },
//     onError: (error) => {
//       toast({
//         title: "Error",
//         description: `Failed to create booking: ${error.message}`,
//         variant: "destructive",
//       });
//     },
//   });

//   const onSubmit = (data: InstantCareFormData) => {
//     // Store booking details and show available sitters instead of immediately submitting
//     setBookingDetails(data);
//     setShowSittersPopup(true);
//   };

//   const handleSittersPopupClose = () => {
//     setShowSittersPopup(false);
//     // Optional: Close the main form if desired
//     // onClose();
//   };

//   const handleBookingSitter = (sitterId: number) => {
//     // When a sitter is selected in the popup, we'll submit the booking with that sitter
//     if (bookingDetails) {
//       createBookingMutation.mutate({
//         ...bookingDetails,
//         babysitterId: sitterId,
//       } as any); // Using any temporarily to bypass type checking for babysitterId
//     }
//   };

//   return (
//     <>
//       <Dialog open={isOpen && !showSittersPopup} onOpenChange={onClose}>
//         <DialogContent className="sm:max-w-[500px]">
//           <DialogHeader>
//             <DialogTitle>Request Instant Childcare</DialogTitle>
//             <DialogDescription>
//               Fill out the details below and connect with available babysitters near you.
//             </DialogDescription>
//           </DialogHeader>

//           {!hasMembership && (
//             <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
//               <div className="flex items-start">
//                 <AlertCircle className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
//                 <div>
//                   <h3 className="text-sm font-medium text-amber-800">Membership Required</h3>
//                   <p className="text-sm text-amber-700 mt-1">
//                     You need an active membership to request childcare services.
//                   </p>
//                   <Button
//                     className="mt-2"
//                     variant="default"
//                     size="sm"
//                     onClick={() => {
//                       onClose();
//                       navigate("/membership");
//                     }}
//                   >
//                     Get Membership
//                   </Button>
//                 </div>
//               </div>
//             </div>
//           )}

//           {hasMembership && !hasCompletedProfile && (
//             <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
//               <div className="flex items-start">
//                 <AlertCircle className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
//                 <div>
//                   <h3 className="text-sm font-medium text-blue-800">Profile Completion Required</h3>
//                   <p className="text-sm text-blue-700 mt-1">
//                     Please complete your parent profile before requesting childcare services.
//                   </p>
//                   <Button
//                     className="mt-2"
//                     variant="default"
//                     size="sm"
//                     onClick={() => {
//                       onClose();
//                       navigate("/profile-completion");
//                     }}
//                   >
//                     Complete Profile
//                   </Button>
//                 </div>
//               </div>
//             </div>
//           )}

//           <Form {...form}>
//             <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
//               <div className="grid grid-cols-1 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium mb-2">Hours Needed</label>
//                   <div className="flex items-center space-x-2">
//                     <Select
//                       value={hoursNeeded.toString()}
//                       onValueChange={(value) => {
//                         const hours = parseInt(value);
//                         setHoursNeeded(hours);
//                         updateEndTime(form.getValues("startTime"), hours);
//                       }}
//                     >
//                       <SelectTrigger className="w-full">
//                         <SelectValue placeholder="Select hours" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {[1, 2, 3, 4, 5, 6, 7, 8].map((hours) => (
//                           <SelectItem key={hours} value={hours.toString()}>
//                             {hours} {hours === 1 ? 'hour' : 'hours'}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   </div>
//                 </div>

//                 <FormField
//                   control={form.control}
//                   name="startTime"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Start Time (Today)</FormLabel>
//                       <FormControl>
//                         <div className="relative">
//                           <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                             <svg
//                               xmlns="http://www.w3.org/2000/svg"
//                               className="h-5 w-5 icon-brand"
//                               fill="none"
//                               viewBox="0 0 24 24"
//                               stroke="currentColor"
//                             >
//                               <path
//                                 strokeLinecap="round"
//                                 strokeLinejoin="round"
//                                 strokeWidth={2}
//                                 d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
//                               />
//                             </svg>
//                           </div>
//                           <div className="flex w-full items-center">
//                             <Input
//                               type="time"
//                               className="pl-10"
//                               {...field}
//                               value={field.value ? new Date(field.value).toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit', hour12: false}) : ''}
//                               onChange={(e) => {
//                                 // Convert time-only input to datetime
//                                 const today = new Date();
//                                 const [hours, minutes] = e.target.value.split(':');
//                                 today.setHours(parseInt(hours), parseInt(minutes), 0, 0);

//                                 // Format as datetime-local value
//                                 const dateTimeValue = format(today, "yyyy-MM-dd'T'HH:mm");
//                                 field.onChange(dateTimeValue);
//                                 updateEndTime(dateTimeValue, hoursNeeded);
//                               }}
//                             />
//                             <div className="flex flex-col ml-2">
//                               <Button
//                                 type="button"
//                                 size="icon"
//                                 variant="outline"
//                                 className="h-7 w-7"
//                                 onClick={() => {
//                                   console.log("Start Time UP Button Clicked");
//                                   console.log("Current field value:", field.value);

//                                   // Get current time value or use now if not set
//                                   let currentDate;
//                                   try {
//                                     currentDate = new Date(field.value);
//                                     console.log("Parsed date:", currentDate);

//                                     // Check if date is valid
//                                     if (isNaN(currentDate.getTime())) {
//                                       console.log("Invalid date, using current time");
//                                       currentDate = new Date();
//                                     }
//                                   } catch (e) {
//                                     console.log("Error parsing date:", e);
//                                     currentDate = new Date();
//                                   }

//                                   // Add 30 minutes
//                                   currentDate.setMinutes(currentDate.getMinutes() + 30);
//                                   const newValue = format(currentDate, "yyyy-MM-dd'T'HH:mm");
//                                   console.log("New value:", newValue);

//                                   field.onChange(newValue);
//                                   updateEndTime(newValue, hoursNeeded);

//                                   console.log("After change, field value:", field.value);
//                                 }}
//                               >
//                                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                                   <path d="m18 15-6-6-6 6"/>
//                                 </svg>
//                               </Button>
//                               <Button
//                                 type="button"
//                                 size="icon"
//                                 variant="outline"
//                                 className="h-7 w-7 mt-1"
//                                 onClick={() => {
//                                   // Get current time value or use now if not set
//                                   let currentDate;
//                                   try {
//                                     currentDate = new Date(field.value);
//                                     // Check if date is valid
//                                     if (isNaN(currentDate.getTime())) {
//                                       currentDate = new Date();
//                                     }
//                                   } catch (e) {
//                                     currentDate = new Date();
//                                   }

//                                   // Subtract 30 minutes
//                                   currentDate.setMinutes(currentDate.getMinutes() - 30);
//                                   const newValue = format(currentDate, "yyyy-MM-dd'T'HH:mm");
//                                   field.onChange(newValue);
//                                   updateEndTime(newValue, hoursNeeded);
//                                 }}
//                               >
//                                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                                   <path d="m6 9 6 6 6-6"/>
//                                 </svg>
//                               </Button>
//                             </div>
//                           </div>
//                         </div>
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />

//                 <FormField
//                   control={form.control}
//                   name="endTime"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>End Time (Today)</FormLabel>
//                       <FormControl>
//                         <div className="relative">
//                           <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                             <svg
//                               xmlns="http://www.w3.org/2000/svg"
//                               className="h-5 w-5 icon-brand"
//                               fill="none"
//                               viewBox="0 0 24 24"
//                               stroke="currentColor"
//                             >
//                               <path
//                                 strokeLinecap="round"
//                                 strokeLinejoin="round"
//                                 strokeWidth={2}
//                                 d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
//                               />
//                             </svg>
//                           </div>
//                           <div className="flex w-full items-center">
//                             <Input
//                               type="time"
//                               className="pl-10"
//                               {...field}
//                               value={field.value ? new Date(field.value).toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit', hour12: false}) : ''}
//                               onChange={(e) => {
//                                 // Convert time-only input to datetime
//                                 const today = new Date();
//                                 const [hours, minutes] = e.target.value.split(':');
//                                 today.setHours(parseInt(hours), parseInt(minutes), 0, 0);

//                                 // Format as datetime-local value
//                                 const dateTimeValue = format(today, "yyyy-MM-dd'T'HH:mm");
//                                 field.onChange(dateTimeValue);
//                               }}
//                             />
//                             <div className="flex flex-col ml-2">
//                               <Button
//                                 type="button"
//                                 size="icon"
//                                 variant="outline"
//                                 className="h-7 w-7"
//                                 onClick={() => {
//                                   // Get current time value or use now if not set
//                                   let currentDate;
//                                   try {
//                                     currentDate = new Date(field.value);
//                                     // Check if date is valid
//                                     if (isNaN(currentDate.getTime())) {
//                                       currentDate = new Date();
//                                     }
//                                   } catch (e) {
//                                     currentDate = new Date();
//                                   }

//                                   // Add 30 minutes
//                                   currentDate.setMinutes(currentDate.getMinutes() + 30);
//                                   const newValue = format(currentDate, "yyyy-MM-dd'T'HH:mm");
//                                   field.onChange(newValue);
//                                 }}
//                               >
//                                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                                   <path d="m18 15-6-6-6 6"/>
//                                 </svg>
//                               </Button>
//                               <Button
//                                 type="button"
//                                 size="icon"
//                                 variant="outline"
//                                 className="h-7 w-7 mt-1"
//                                 onClick={() => {
//                                   // Get current time value or use now if not set
//                                   let currentDate;
//                                   try {
//                                     currentDate = new Date(field.value);
//                                     // Check if date is valid
//                                     if (isNaN(currentDate.getTime())) {
//                                       currentDate = new Date();
//                                     }
//                                   } catch (e) {
//                                     currentDate = new Date();
//                                   }

//                                   // Subtract 30 minutes
//                                   currentDate.setMinutes(currentDate.getMinutes() - 30);
//                                   const newValue = format(currentDate, "yyyy-MM-dd'T'HH:mm");
//                                   field.onChange(newValue);
//                                 }}
//                               >
//                                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                                   <path d="m6 9 6 6 6-6"/>
//                                 </svg>
//                               </Button>
//                             </div>
//                           </div>
//                         </div>
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//               </div>

//               <FormField
//                 control={form.control}
//                 name="children"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Select Children</FormLabel>
//                     <FormControl>
//                       <Popover>
//                         <PopoverTrigger asChild>
//                           <Button
//                             variant="outline"
//                             role="combobox"
//                             className={cn(
//                               "w-full justify-between",
//                               !field.value?.length && "text-muted-foreground"
//                             )}
//                           >
//                             {field.value?.length > 0
//                               ? `${field.value.length} children selected`
//                               : "Select children..."}
//                           </Button>
//                         </PopoverTrigger>
//                         <PopoverContent className="w-[300px] p-0">
//                           <div className="p-4 space-y-2">
//                             {childOptions.map((child) => {
//                               const isSelected = field.value?.some(
//                                 (selectedChild) => selectedChild.id === child.id
//                               );
//                               return (
//                                 <div
//                                   key={child.id}
//                                   className="flex items-center space-x-2 rounded px-2 py-1 hover:bg-accent cursor-pointer"
//                                   onClick={() => {
//                                     const newValue = isSelected
//                                       ? field.value.filter(
//                                           (selectedChild) => selectedChild.id !== child.id
//                                         )
//                                       : [...(field.value || []), child];
//                                     field.onChange(newValue);
//                                   }}
//                                 >
//                                   <Checkbox checked={isSelected} />
//                                   <div>{child.name}</div>
//                                   {isSelected && (
//                                     <Check className="ml-auto h-4 w-4" />
//                                   )}
//                                 </div>
//                               );
//                             })}
//                             <div className="mt-4 pt-3 border-t flex justify-end">
//                               <Button
//                                 type="button"
//                                 style={{ backgroundColor: "#3c5679" }}
//                                 className="text-white font-medium"
//                                 onClick={() => {
//                                   const popover = document.querySelector('[role="combobox"]');
//                                   if (popover) {
//                                     (popover as HTMLElement).click();
//                                   }
//                                 }}
//                               >
//                                 Done
//                               </Button>
//                             </div>
//                           </div>
//                         </PopoverContent>
//                       </Popover>
//                     </FormControl>
//                     <div className="flex flex-wrap gap-2 mt-2">
//                       {field.value?.map((child) => (
//                         <Badge key={child.id} variant="outline" className="py-1 border-brand-pink text-brand-blue">
//                           {child.name}
//                           <X
//                             className="ml-1 h-3 w-3 cursor-pointer"
//                             onClick={() => {
//                               field.onChange(
//                                 field.value.filter(
//                                   (selectedChild) => selectedChild.id !== child.id
//                                 )
//                               );
//                             }}
//                           />
//                         </Badge>
//                       ))}
//                     </div>

//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               <FormField
//                 control={form.control}
//                 name="careInstructions"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Care Instructions (Optional)</FormLabel>
//                     <FormControl>
//                       <Textarea
//                         placeholder="Special needs, meal times, bedtime routine, activities, etc."
//                         className="resize-none"
//                         {...field}
//                       />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               <Button
//                 type="submit"
//                 style={{ backgroundColor: "#3c5679" }}
//                 className="w-full text-white font-medium"
//                 disabled={!hasMembership || !hasCompletedProfile}
//               >
//                 {!hasMembership
//                   ? "Membership Required"
//                   : !hasCompletedProfile
//                     ? "Complete Profile First"
//                     : "Find Available Sitters"}
//               </Button>
//             </form>
//           </Form>
//         </DialogContent>
//       </Dialog>

//       {/* Popup with available sitters */}
//       {bookingDetails && (
//         <AvailableSittersPopup
//           isOpen={showSittersPopup}
//           onClose={handleSittersPopupClose}
//           bookingDetails={bookingDetails}
//         />
//       )}
//     </>
//   );
// }

// ------------------old code for reference------------

// ---------------new code------------

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, getQueryFn } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import {
  InstantCareFormData,
  Child,
  ParentProfile,
  babysitterProfile,
} from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import AvailableSittersPopup from "@/components/AvailableSittersPopup";
import { X, Plus, Check, AlertCircle, MapPin } from "lucide-react";

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
import supabase from "@/config/supabaseClient";
import { log } from "console";
import mapboxgl from "mapbox-gl";
import { useSignedUrl } from "@/hooks/use-signedUrl";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

interface InstantCareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const instantCareSchema = z
  .object({
    startTime: z.string().min(1, "Start time is required"),
    endTime: z.string().min(1, "End time is required"),
    children: z
      .array(
        z.object({
          id: z.string(),
          firstName: z.string(),
          lastName: z.string(),
        }),
      )
      .min(1, "Please select at least one child"),
    careInstructions: z.string().optional(),
  })
  .refine((data) => new Date(data.startTime) < new Date(data.endTime), {
    message: "End time must be after start time",
    path: ["endTime"],
  });

export default function InstantCareModal({
  isOpen,
  onClose,
}: InstantCareModalProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const { getSignedUrl } = useSignedUrl();
  const [, navigate] = useLocation();
  const [bookingDetails, setBookingDetails] =
    useState<InstantCareFormData | null>(null);
  const [showSittersPopup, setShowSittersPopup] = useState(false);
  const [childInput, setChildInput] = useState("");
  const [minDate, setMinDate] = useState<string>("");
  const [maxDate, setMaxDate] = useState<string>("");
  const [hoursNeeded, setHoursNeeded] = useState<number>(2);
  const [parentLocation, setParentLocation] = useState({
    latitude: 0,
    longitude: 0,
  });
  const [babySitterProfiles, setBabySitterProfiles] = useState<
    babysitterProfile[]
  >([]);
  const [nearbySitters, setNearbySitters] = useState([]);
  const [childrenPopoverOpen, setChildrenPopoverOpen] = useState(false);
  const [address, setAddress] = useState("");
  const [AddressLoading, setAddressLoading] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  const isPaymentSuccess = user?.user_metadata?.isPayment;
  const hasMembership =
    !!user &&
    (user.membershipStatus === "active" ||
      user.membershipStatus === "installment_2" ||
      user.membershipStatus === "installment_1");

  // Check if profile is completed
  const hasCompletedProfile = userData?.user_metadata?.profileCompleted;

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

  // We'll use a simpler approach just to demonstrate the profile completion check
  const [childOptions, setChildOptions] = useState<Child[]>([]);

  // Initialize with current time and current time + hours needed
  const now = new Date();
  const nowPlusHours = new Date(now);
  nowPlusHours.setHours(nowPlusHours.getHours() + hoursNeeded);

  console.log(
    "Initialize form with start time:",
    format(now, "yyyy-MM-dd'T'HH:mm"),
  );
  console.log(
    "Initialize form with end time:",
    format(nowPlusHours, "yyyy-MM-dd'T'HH:mm"),
  );

  const form = useForm<InstantCareFormData>({
    resolver: zodResolver(instantCareSchema),
    defaultValues: {
      startTime: format(now, "yyyy-MM-dd'T'HH:mm"),
      endTime: format(nowPlusHours, "yyyy-MM-dd'T'HH:mm"),
      children: [],
      careInstructions: "",
    },
  });

  // Log form values after initialization
  console.log("Form values after initialization:", form.getValues());

  const createBookingMutation = useMutation({
    mutationFn: async (data: InstantCareFormData) => {
      // Transform the data to match what the backend expects
      const childNames = data.children
        .map((childId) => {
          const child = childOptions.find((c) => c.id === childId);
          return child ? `${child.firstName} ${child.lastName}` : "";
        })
        .filter(Boolean)
        .join(", ");

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
    const { latitude, longitude } = parentLocation;

    if (!address || !latitude || !longitude) {
      toast({
        title: "Location is required",
        description: "Please use 'Use My Location' to fetch location.",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      ...data,
      address,
      latitude,
      longitude,
      hoursNeeded,
    };

    // Store booking details and show available sitters instead of immediately submitting
    setBookingDetails(payload);
    setShowSittersPopup(true);
    onClose();
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

  // Find sitters within 8 miles of the parent's location
  function findNearbySitters(babySitterProfiles, radiusMiles = 8) {
    return babySitterProfiles
      ?.map((sitter) => {
        const distance = getDistanceInMiles(
          parentLocation?.latitude,
          parentLocation?.longitude,
          sitter.location?.latitude,
          sitter.location?.longitude,
        );
        return { ...sitter, distance };
      })
      .filter((sitter) => sitter.distance <= radiusMiles);
  }

  // fetch parent profile
  const fetchParentProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("parentprofile")
      .select("*")
      .eq("user_id", userId) // filter by userId
      .limit(1); // expects exactly one row

    if (error) {
      console.error("Fetch error:", error.message);
      return null;
    }

    return data;
  };

  const loadProfile = async () => {
    const data = await fetchParentProfile(user?.id);
    const { children } = data?.[0];
    setChildOptions(children);
  };

  // fetch babysitters profile
  const fetchBabySitterProfiles = async () => {
    const babysitterRes = await supabase
      .from("babySitterProfile")
      .select("*")
      .eq("isApproved", true);

    if (babysitterRes.error) {
      console.error("Error fetching babysitter profiles:", babysitterRes.error);
      return;
    }

    const babysittersWithDoc = await Promise.all(
      babysitterRes.data.map(async (b) => {
        const profileImageUrl = await getSignedUrl(b.profile_image);
        const certificateUrl = await getSignedUrl(b.certified);
        const transportationUrl = await getSignedUrl(b.transportation);
        const videoUrl = await getSignedUrl(b.instrucationVideo);

        return {
          ...b,
          profileImageUrl,
          certificateUrl,
          transportationUrl,
          videoUrl,
          userType: "babysitter",
        };
      }),
    );

    setBabySitterProfiles(babysittersWithDoc);
  };

  // Function to get the current location
  const handleUseMyLocation = () => {
    setAddressLoading(true);
    if (!navigator.geolocation) {
      alert("Geolocation not supported by your browser");
      setAddressLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setParentLocation({ latitude, longitude });
        try {
          const res = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${mapboxgl.accessToken}`,
          );
          const data = await res.json();
          const placeName = data.features?.[0]?.place_name || "";
          setAddress(placeName);
        } catch (err) {
          alert("Failed to get address");
        } finally {
          setAddressLoading(false);
        }
      },
      () => {
        alert("Permission denied or location unavailable");
        setAddressLoading(false);
      },
      {
        enableHighAccuracy: true, // 📍 Request more precise location
        timeout: 10000,
        maximumAge: 0,
      },
    );
  };

  useEffect(() => {
    const result = findNearbySitters(babySitterProfiles, 8);
    setNearbySitters(result);
  }, [babySitterProfiles, parentLocation]);

  useEffect(() => {
    if (user?.id) {
      loadProfile();
      fetchBabySitterProfiles();
    }
  }, [user?.id]);

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Error:", error.message);
      } else {
        setUserData(data?.user);
      }
    };

    fetchUser();
  }, []);

  return (
    <>
      <Dialog open={isOpen && !showSittersPopup} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Request Instant Childcare</DialogTitle>
            <DialogDescription>
              Fill out the details below and connect with available babysitters
              near you.
            </DialogDescription>
          </DialogHeader>

          {!isPaymentSuccess && (
            <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-amber-800">
                    Membership Required
                  </h3>
                  <p className="text-sm text-amber-700 mt-1">
                    You need an active membership to request childcare services.
                  </p>
                  <Button
                    className="mt-2"
                    variant="default"
                    size="sm"
                    onClick={() => {
                      onClose();
                      navigate("/membership");
                    }}
                  >
                    Get Membership
                  </Button>
                </div>
              </div>
            </div>
          )}

          {isPaymentSuccess && !hasCompletedProfile && (
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-blue-800">
                    Profile Completion Required
                  </h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Please complete your parent profile before requesting
                    childcare services.
                  </p>
                  <Button
                    className="mt-2"
                    variant="default"
                    size="sm"
                    onClick={() => {
                      onClose();
                      navigate("/profile-completion");
                    }}
                  >
                    Complete Profile
                  </Button>
                </div>
              </div>
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                <div className="w-full">
                  <button
                    type="button"
                    onClick={handleUseMyLocation}
                    className="px-4 py-2 bg-blue-100 text-black rounded w-full"
                    disabled={AddressLoading}
                  >
                    {AddressLoading ? (
                      "Fetching..."
                    ) : (
                      <>
                        <MapPin className="inline-block mr-2" />
                        Use My Current Location
                      </>
                    )}
                  </button>
                  {AddressLoading && <p>Getting address...</p>}
                  {address && (
                    <p className="pt-1">
                      <strong>Address:</strong> {address}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Hours Needed
                  </label>
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
                        {[2, 3, 4, 5, 6, 7, 8].map((hours) => (
                          <SelectItem key={hours} value={hours.toString()}>
                            {hours} {hours === 1 ? "hour" : "hours"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time (Today)</FormLabel>
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
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          </div>
                          <div className="flex w-full items-center">
                            <Input
                              type="time"
                              className="pl-10"
                              {...field}
                              value={
                                field.value
                                  ? new Date(field.value).toLocaleTimeString(
                                      "en-US",
                                      {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        hour12: false,
                                      },
                                    )
                                  : ""
                              }
                              onChange={(e) => {
                                // Convert time-only input to datetime
                                const today = new Date();
                                const [hours, minutes] =
                                  e.target.value.split(":");
                                today.setHours(
                                  parseInt(hours),
                                  parseInt(minutes),
                                  0,
                                  0,
                                );

                                // Format as datetime-local value
                                const dateTimeValue = format(
                                  today,
                                  "yyyy-MM-dd'T'HH:mm",
                                );
                                field.onChange(dateTimeValue);
                                updateEndTime(dateTimeValue, hoursNeeded);
                              }}
                            />
                            <div className="flex flex-col ml-2">
                              <Button
                                type="button"
                                size="icon"
                                variant="outline"
                                className="h-7 w-7"
                                onClick={() => {
                                  console.log("Start Time UP Button Clicked");
                                  console.log(
                                    "Current field value:",
                                    field.value,
                                  );

                                  // Get current time value or use now if not set
                                  let currentDate;
                                  try {
                                    currentDate = new Date(field.value);
                                    console.log("Parsed date:", currentDate);

                                    // Check if date is valid
                                    if (isNaN(currentDate.getTime())) {
                                      console.log(
                                        "Invalid date, using current time",
                                      );
                                      currentDate = new Date();
                                    }
                                  } catch (e) {
                                    console.log("Error parsing date:", e);
                                    currentDate = new Date();
                                  }

                                  // Add 30 minutes
                                  currentDate.setMinutes(
                                    currentDate.getMinutes() + 30,
                                  );
                                  const newValue = format(
                                    currentDate,
                                    "yyyy-MM-dd'T'HH:mm",
                                  );
                                  console.log("New value:", newValue);

                                  field.onChange(newValue);
                                  updateEndTime(newValue, hoursNeeded);

                                  console.log(
                                    "After change, field value:",
                                    field.value,
                                  );
                                }}
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
                                  <path d="m18 15-6-6-6 6" />
                                </svg>
                              </Button>
                              <Button
                                type="button"
                                size="icon"
                                variant="outline"
                                className="h-7 w-7 mt-1"
                                onClick={() => {
                                  // Get current time value or use now if not set
                                  let currentDate;
                                  try {
                                    currentDate = new Date(field.value);
                                    // Check if date is valid
                                    if (isNaN(currentDate.getTime())) {
                                      currentDate = new Date();
                                    }
                                  } catch (e) {
                                    currentDate = new Date();
                                  }

                                  // Subtract 30 minutes
                                  currentDate.setMinutes(
                                    currentDate.getMinutes() - 30,
                                  );
                                  const newValue = format(
                                    currentDate,
                                    "yyyy-MM-dd'T'HH:mm",
                                  );
                                  field.onChange(newValue);
                                  updateEndTime(newValue, hoursNeeded);
                                }}
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
                                  <path d="m6 9 6 6 6-6" />
                                </svg>
                              </Button>
                            </div>
                          </div>
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
                      <FormLabel>End Time (Today)</FormLabel>
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
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          </div>
                          <div className="flex w-full items-center">
                            <Input
                              type="time"
                              className="pl-10"
                              {...field}
                              value={
                                field.value
                                  ? new Date(field.value).toLocaleTimeString(
                                      "en-US",
                                      {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        hour12: false,
                                      },
                                    )
                                  : ""
                              }
                              onChange={(e) => {
                                // Convert time-only input to datetime
                                const today = new Date();
                                const [hours, minutes] =
                                  e.target.value.split(":");
                                today.setHours(
                                  parseInt(hours),
                                  parseInt(minutes),
                                  0,
                                  0,
                                );

                                // Format as datetime-local value
                                const dateTimeValue = format(
                                  today,
                                  "yyyy-MM-dd'T'HH:mm",
                                );
                                field.onChange(dateTimeValue);
                              }}
                            />
                            <div className="flex flex-col ml-2">
                              <Button
                                type="button"
                                size="icon"
                                variant="outline"
                                className="h-7 w-7"
                                onClick={() => {
                                  // Get current time value or use now if not set
                                  let currentDate;
                                  try {
                                    currentDate = new Date(field.value);
                                    // Check if date is valid
                                    if (isNaN(currentDate.getTime())) {
                                      currentDate = new Date();
                                    }
                                  } catch (e) {
                                    currentDate = new Date();
                                  }

                                  // Add 30 minutes
                                  currentDate.setMinutes(
                                    currentDate.getMinutes() + 30,
                                  );
                                  const newValue = format(
                                    currentDate,
                                    "yyyy-MM-dd'T'HH:mm",
                                  );
                                  field.onChange(newValue);
                                }}
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
                                  <path d="m18 15-6-6-6 6" />
                                </svg>
                              </Button>
                              <Button
                                type="button"
                                size="icon"
                                variant="outline"
                                className="h-7 w-7 mt-1"
                                onClick={() => {
                                  // Get current time value or use now if not set
                                  let currentDate;
                                  try {
                                    currentDate = new Date(field.value);
                                    // Check if date is valid
                                    if (isNaN(currentDate.getTime())) {
                                      currentDate = new Date();
                                    }
                                  } catch (e) {
                                    currentDate = new Date();
                                  }

                                  // Subtract 30 minutes
                                  currentDate.setMinutes(
                                    currentDate.getMinutes() - 30,
                                  );
                                  const newValue = format(
                                    currentDate,
                                    "yyyy-MM-dd'T'HH:mm",
                                  );
                                  field.onChange(newValue);
                                }}
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
                                  <path d="m6 9 6 6 6-6" />
                                </svg>
                              </Button>
                            </div>
                          </div>
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
                      <Popover
                        open={childrenPopoverOpen}
                        onOpenChange={setChildrenPopoverOpen}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "w-full justify-between",
                              !field.value?.length && "text-muted-foreground",
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
                                (selectedChild) =>
                                  selectedChild.id === child.id,
                              );
                              return (
                                <div
                                  key={child.id}
                                  className="flex items-center space-x-2 rounded px-2 py-1 hover:bg-accent cursor-pointer"
                                  onClick={() => {
                                    const newValue = isSelected
                                      ? field.value.filter(
                                          (selectedChild) =>
                                            selectedChild.id !== child.id,
                                        )
                                      : [...(field.value || []), child];
                                    field.onChange(newValue);
                                  }}
                                >
                                  <Checkbox checked={isSelected} />
                                  <div>
                                    {child.firstName} {child.lastName}
                                  </div>
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
                                onClick={(e) => {
                                  setChildrenPopoverOpen(false);
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
                        <Badge
                          key={child.id}
                          variant="outline"
                          className="py-1 border-brand-pink text-brand-blue"
                        >
                          {child.firstName} {child.lastName}
                          <X
                            className="ml-1 h-3 w-3 cursor-pointer"
                            onClick={() => {
                              field.onChange(
                                field.value.filter(
                                  (selectedChild) =>
                                    selectedChild.id !== child.id,
                                ),
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
                /* disabled={!hasMembership || !hasCompletedProfile} */
                disabled={!isPaymentSuccess || !hasCompletedProfile}
              >
                {!isPaymentSuccess
                  ? "Membership Required"
                  : !hasCompletedProfile
                    ? "Complete Profile First"
                    : "Find Available Sitters"}
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
          nearbySitters={nearbySitters}
        />
      )}
    </>
  );
}

// --------------new code------------
