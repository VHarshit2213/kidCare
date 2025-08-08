// ------------------old code for reference------------

// import { useState, useEffect } from "react";
// import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { Calendar } from "@/components/ui/calendar";
// import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
// import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Textarea } from "@/components/ui/textarea";
// import { Check, CalendarIcon, X, Clock, AlertCircle } from "lucide-react";
// import { Badge } from "@/components/ui/badge";
// import { Child } from "@/lib/types";
// import { format, addDays } from "date-fns";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { z } from "zod";
// import { Form } from "@/components/ui/form";
// import { cn } from "@/lib/utils";
// import { useAuth } from "@/hooks/use-auth";
// import { useLocation } from "wouter";
// import AvailableScheduledSitters from "./AvailableScheduledSitters";

// // Form validation schema
// const scheduledCareSchema = z.object({
//   date: z.date({
//     required_error: "Please select a date",
//   }),
//   startTime: z.string({
//     required_error: "Please select a start time",
//   }),
//   endTime: z.string({
//     required_error: "Please select an end time",
//   }),
//   children: z.array(
//     z.object({
//       id: z.string(),
//       name: z.string(),
//     })
//   ).min(1, "Please select at least one child"),
//   careInstructions: z.string().optional(),
// });

// type ScheduledCareFormData = z.infer<typeof scheduledCareSchema>;

// interface ScheduledCareModalProps {
//   isOpen: boolean;
//   onClose: () => void;
// }

// export default function ScheduledCareModal({ isOpen, onClose }: ScheduledCareModalProps) {
//   const { user } = useAuth();
//   const [, navigate] = useLocation();
//   const [date, setDate] = useState<Date | undefined>(new Date());
//   const [hoursNeeded, setHoursNeeded] = useState(2);
//   const [showAvailableSitters, setShowAvailableSitters] = useState(false);
//   const [playAndGreetStatus, setPlayAndGreetStatus] = useState<{[key: string]: boolean}>({});
//   const [bookingStatus, setBookingStatus] = useState<{[key: string]: boolean}>({});

//   const hasMembership = !!user && (
//     user.membershipStatus === "active" ||
//     user.membershipStatus === "installment_2" ||
//     user.membershipStatus === "installment_1"
//   );

//   // Check if profile is completed
//   const hasCompletedProfile = !!user && user.profileCompleted === true;

//   // Reset form when modal is opened
//   useEffect(() => {
//     if (isOpen) {
//       form.reset({
//         date: new Date(),
//         startTime: "",
//         endTime: "",
//         children: [],
//         careInstructions: ""
//       });
//     }
//   }, [isOpen]);

//   // Mock child data - in a real app, this would be fetched from user's children
//   const childOptions: { id: string; name: string }[] = [
//     { id: "1", name: "Emma" },
//     { id: "2", name: "Noah" },
//     { id: "3", name: "Olivia" },
//     { id: "4", name: "Liam" },
//   ];

//   const form = useForm<ScheduledCareFormData>({
//     resolver: zodResolver(scheduledCareSchema),
//     defaultValues: {
//       date: new Date(),
//       children: [],
//       careInstructions: "",
//     },
//   });

//   // Generate time slots for select
//   const generateTimeSlots = () => {
//     const slots = [];
//     for (let hour = 6; hour < 22; hour++) {
//       for (let minute = 0; minute < 60; minute += 30) {
//         const time = new Date();
//         time.setHours(hour, minute, 0);
//         slots.push({
//           value: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
//           label: format(time, 'h:mm a')
//         });
//       }
//     }
//     return slots;
//   };

//   const timeSlots = generateTimeSlots();

//   const onSubmit = (data: ScheduledCareFormData) => {
//     console.log("Scheduled care form submitted:", data);
//     // Here you would normally send this data to your backend
//     setShowAvailableSitters(true);
//     onClose();
//   };

//   const handlePlayAndGreet = (sitterId: number) => {
//     setPlayAndGreetStatus(prev => ({
//       ...prev,
//       [sitterId.toString()]: true
//     }));
//   };

//   const handleBookNow = (sitterId: number) => {
//     setBookingStatus(prev => ({
//       ...prev,
//       [sitterId.toString()]: true
//     }));
//   };

//   return (
//     <>
//       <AvailableScheduledSitters
//         isOpen={showAvailableSitters}
//         onClose={() => {
//           setShowAvailableSitters(false);
//           form.reset();
//         }}
//         onPlayAndGreet={handlePlayAndGreet}
//         onBookNow={handleBookNow}
//         date={date || new Date()}
//         startTime={form.getValues().startTime || ""}
//         endTime={form.getValues().endTime || ""}
//         playAndGreetStatus={playAndGreetStatus}
//         bookingStatus={bookingStatus}
//       />

//       <Dialog open={isOpen} onOpenChange={onClose}>
//         <DialogContent className="sm:max-w-[550px]">
//           <DialogHeader>
//             <DialogTitle>Schedule Childcare</DialogTitle>
//             <DialogDescription>
//               Request a babysitter up to 7 days in advance.
//             </DialogDescription>
//           </DialogHeader>

//           {!hasMembership && (
//             <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
//               <div className="flex items-start">
//                 <AlertCircle className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
//                 <div>
//                   <h3 className="text-sm font-medium text-amber-800">Membership Required</h3>
//                   <p className="text-sm text-amber-700 mt-1">
//                     You need an active membership to schedule childcare services.
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
//                     Please complete your parent profile before scheduling childcare services.
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
//               <FormField
//                 control={form.control}
//                 name="date"
//                 render={({ field }) => (
//                   <FormItem className="flex flex-col">
//                     <FormLabel>Date</FormLabel>
//                     <Popover>
//                       <PopoverTrigger asChild>
//                         <FormControl>
//                           <Button
//                             variant={"outline"}
//                             className={cn(
//                               "w-full pl-3 text-left font-normal",
//                               !field.value && "text-muted-foreground"
//                             )}
//                           >
//                             {field.value ? (
//                               format(field.value, "MMMM d, yyyy")
//                             ) : (
//                               <span>Select a date</span>
//                             )}
//                             <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
//                           </Button>
//                         </FormControl>
//                       </PopoverTrigger>
//                       <PopoverContent className="w-auto p-0" align="start">
//                         <Calendar
//                           mode="single"
//                           selected={field.value}
//                           onSelect={(date) => {
//                             if (date) {
//                               field.onChange(date);
//                               setDate(date);
//                             }
//                           }}
//                           disabled={(date) =>
//                             date < new Date() || date > addDays(new Date(), 7)
//                           }
//                           initialFocus
//                         />
//                       </PopoverContent>
//                     </Popover>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               <div className="mb-4">
//                 <FormLabel>Hours Needed</FormLabel>
//                 <Popover>
//                   <PopoverTrigger asChild>
//                     <Button
//                       variant="outline"
//                       role="combobox"
//                       className="w-full justify-between"
//                     >
//                       {hoursNeeded ? `${hoursNeeded} ${hoursNeeded === 1 ? 'hour' : 'hours'}` : "Select hours..."}
//                     </Button>
//                   </PopoverTrigger>
//                   <PopoverContent className="w-[200px]">
//                     <div className="space-y-2">
//                       {[1, 2, 3, 4, 5, 6, 7, 8].map((hours) => (
//                         <div
//                           key={hours}
//                           className={`flex items-center space-x-2 rounded px-2 py-1 hover:bg-accent cursor-pointer ${
//                             hoursNeeded === hours ? "bg-accent" : ""
//                           }`}
//                           onClick={() => {
//                             setHoursNeeded(hours);

//                             // Update end time based on start time and hours
//                             const startTimeValue = form.getValues().startTime;
//                             if (startTimeValue) {
//                               const [startHour, startMinute] = startTimeValue.split(':').map(Number);
//                               const endDate = new Date();
//                               endDate.setHours(startHour, startMinute, 0);
//                               endDate.setHours(endDate.getHours() + hours);

//                               const endHour = endDate.getHours().toString().padStart(2, '0');
//                               const endMinute = endDate.getMinutes().toString().padStart(2, '0');
//                               const newEndTime = `${endHour}:${endMinute}`;

//                               form.setValue('endTime', newEndTime);
//                             }
//                           }}
//                         >
//                           <div>{hours} {hours === 1 ? 'hour' : 'hours'}</div>
//                           {hoursNeeded === hours && (
//                             <Check className="ml-auto h-4 w-4" />
//                           )}
//                         </div>
//                       ))}
//                       <div className="mt-4 pt-3 border-t flex justify-end">
//                         <Button
//                           type="button"
//                           style={{ backgroundColor: "#3c5679" }}
//                           className="text-white font-medium"
//                           onClick={() => {
//                             const popover = document.querySelector('[role="combobox"]');
//                             if (popover) {
//                               (popover as HTMLElement).click();
//                             }
//                           }}
//                         >
//                           Done
//                         </Button>
//                       </div>
//                     </div>
//                   </PopoverContent>
//                 </Popover>
//               </div>

//               <div className="grid grid-cols-2 gap-4">
//                 <FormField
//                   control={form.control}
//                   name="startTime"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Start Time</FormLabel>
//                       <Select onValueChange={field.onChange} defaultValue={field.value}>
//                         <FormControl>
//                           <SelectTrigger>
//                             <SelectValue placeholder="Select start time" />
//                             <Clock className="ml-2 h-4 w-4 opacity-50" />
//                           </SelectTrigger>
//                         </FormControl>
//                         <SelectContent>
//                           {timeSlots.map((slot) => (
//                             <SelectItem key={slot.value} value={slot.value}>
//                               {slot.label}
//                             </SelectItem>
//                           ))}
//                         </SelectContent>
//                       </Select>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />

//                 <FormField
//                   control={form.control}
//                   name="endTime"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>End Time</FormLabel>
//                       <Select onValueChange={field.onChange} defaultValue={field.value}>
//                         <FormControl>
//                           <SelectTrigger>
//                             <SelectValue placeholder="Select end time" />
//                             <Clock className="ml-2 h-4 w-4 opacity-50" />
//                           </SelectTrigger>
//                         </FormControl>
//                         <SelectContent>
//                           {timeSlots.map((slot) => (
//                             <SelectItem key={slot.value} value={slot.value}>
//                               {slot.label}
//                             </SelectItem>
//                           ))}
//                         </SelectContent>
//                       </Select>
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
//                     : "Schedule Sitter"}
//               </Button>
//             </form>
//           </Form>
//         </DialogContent>
//       </Dialog>
//     </>
//   );
// }

// ------------------old code for reference------------

// ---------------new code------------

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Check,
  CalendarIcon,
  X,
  Clock,
  AlertCircle,
  MapPin,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { babysitterProfile, Child, ScheduledCareFormData } from "@/lib/types";
import { format, addDays } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import AvailableScheduledSitters from "./AvailableScheduledSitters";
import supabase from "@/config/supabaseClient";
import mapboxgl from "mapbox-gl";
import { useToast } from "@/hooks/use-toast";
import { useSignedUrl } from "@/hooks/use-signedUrl";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

// Form validation schema
const scheduledCareSchema = z.object({
  date: z.date({
    required_error: "Please select a date",
  }),
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
});

// type ScheduledCareFormData = z.infer<typeof scheduledCareSchema>;

interface ScheduledCareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ScheduledCareModal({
  isOpen,
  onClose,
}: ScheduledCareModalProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const { getSignedUrl } = useSignedUrl();
  const [, navigate] = useLocation();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [hoursNeeded, setHoursNeeded] = useState(2);
  const [showAvailableSitters, setShowAvailableSitters] = useState(false);
  const [playAndGreetStatus, setPlayAndGreetStatus] = useState<{
    [key: string]: boolean;
  }>({});
  const [bookingStatus, setBookingStatus] = useState<{
    [key: string]: boolean;
  }>({});
  const [parentLocation, setParentLocation] = useState({
    latitude: 0,
    longitude: 0,
  });
  const [babySitterProfiles, setBabySitterProfiles] = useState<
    babysitterProfile[]
  >([]);
  const [nearbySitters, setNearbySitters] = useState([]);
  const [childOptions, setChildOptions] = useState<Child[]>([]);
  const [childrenPopoverOpen, setChildrenPopoverOpen] = useState(false);
  const [address, setAddress] = useState("");
  const [AddressLoading, setAddressLoading] = useState(false);
  const [bookingDetails, setBookingDetails] =
    useState<ScheduledCareFormData | null>(null);
  const [userData, setUserData] = useState<any>(null);

  const isPaymentSuccess = user?.user_metadata?.isPayment;
  const hasCompletedProfile = userData?.user_metadata?.profileCompleted;

  const hasMembership =
    !!user &&
    (user.membershipStatus === "active" ||
      user.membershipStatus === "installment_2" ||
      user.membershipStatus === "installment_1");

  // Reset form when modal is opened
  useEffect(() => {
    if (isOpen) {
      form.reset({
        date: new Date(),
        startTime: "",
        endTime: "",
        children: [],
        careInstructions: "",
      });
    }
  }, [isOpen]);

  const form = useForm<ScheduledCareFormData>({
    resolver: zodResolver(scheduledCareSchema),
    defaultValues: {
      date: new Date(),
      startTime: "",
      endTime: "",
      children: [],
      careInstructions: "",
    },
  });

  // Generate time slots for select
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 6; hour < 22; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = new Date();
        time.setHours(hour, minute, 0);
        const formattedTime = format(time, "h:mm a"); // e.g., "6:00 AM", "6:30 PM"

        slots.push({
          value: formattedTime,
          label: formattedTime,
        });
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const onSubmit = (data: ScheduledCareFormData) => {
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

    setBookingDetails(payload);
    setShowAvailableSitters(true);
    onClose();
  };

  const handlePlayAndGreet = (sitterId: number) => {
    setPlayAndGreetStatus((prev) => ({
      ...prev,
      [sitterId.toString()]: true,
    }));
  };

  const handleBookNow = (sitterId: number) => {
    setBookingStatus((prev) => ({
      ...prev,
      [sitterId.toString()]: true,
    }));
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
    if (user?.id && user?.user_metadata?.userType === "parent") {
      loadProfile();
      fetchBabySitterProfiles();
    }
  }, [user]);

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
      <AvailableScheduledSitters
        isOpen={showAvailableSitters}
        onClose={() => {
          setShowAvailableSitters(false);
          form.reset();
        }}
        onPlayAndGreet={handlePlayAndGreet}
        onBookNow={handleBookNow}
        date={date || new Date()}
        startTime={form.getValues().startTime || ""}
        /* endTime={form.getValues().endTime || ""} */
        playAndGreetStatus={playAndGreetStatus}
        bookingStatus={bookingStatus}
        nearbySitters={nearbySitters}
        bookingDetails={bookingDetails}
      />

      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Schedule Childcare</DialogTitle>
            <DialogDescription>
              Request a babysitter up to 7 days in advance.
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
                    You need an active membership to schedule childcare
                    services.
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
                    Please complete your parent profile before scheduling
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
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            {field.value ? (
                              format(field.value, "MMMM d, yyyy")
                            ) : (
                              <span>Select a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={(date) => {
                            if (date) {
                              field.onChange(date);
                              setDate(date);
                            }
                          }}
                          disabled={(date) =>
                            date < new Date() || date > addDays(new Date(), 7)
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="mb-4">
                <FormLabel>Hours Needed</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="w-full justify-between"
                    >
                      {hoursNeeded
                        ? `${hoursNeeded} ${hoursNeeded === 1 ? "hour" : "hours"}`
                        : "Select hours..."}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[200px]">
                    <div className="space-y-2">
                      {[2, 3, 4, 5, 6, 7, 8].map((hours) => (
                        <div
                          key={hours}
                          className={`flex items-center space-x-2 rounded px-2 py-1 hover:bg-accent cursor-pointer ${
                            hoursNeeded === hours ? "bg-accent" : ""
                          }`}
                          onClick={() => {
                            setHoursNeeded(hours);

                            // Update end time based on start time and hours
                            const startTimeValue = form.getValues().startTime;
                            if (startTimeValue) {
                              const [startHour, startMinute] = startTimeValue
                                .split(":")
                                .map(Number);
                              const endDate = new Date();
                              endDate.setHours(startHour, startMinute, 0);
                              endDate.setHours(endDate.getHours() + hours);

                              const endHour = endDate
                                .getHours()
                                .toString()
                                .padStart(2, "0");
                              const endMinute = endDate
                                .getMinutes()
                                .toString()
                                .padStart(2, "0");
                              const newEndTime = `${endHour}:${endMinute}`;

                              form.setValue("endTime", newEndTime);
                            }
                          }}
                        >
                          <div>
                            {hours} {hours === 1 ? "hour" : "hours"}
                          </div>
                          {hoursNeeded === hours && (
                            <Check className="ml-auto h-4 w-4" />
                          )}
                        </div>
                      ))}
                      <div className="mt-4 pt-3 border-t flex justify-end">
                        <Button
                          type="button"
                          style={{ backgroundColor: "#3c5679" }}
                          className="text-white font-medium"
                          onClick={() => {
                            const popover =
                              document.querySelector('[role="combobox"]');
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select start time" />
                            <Clock className="ml-2 h-4 w-4 opacity-50" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {timeSlots.map((slot) => (
                            <SelectItem key={slot.value} value={slot.value}>
                              {slot.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select end time" />
                            <Clock className="ml-2 h-4 w-4 opacity-50" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {timeSlots.map((slot) => (
                            <SelectItem key={slot.value} value={slot.value}>
                              {slot.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                    : "Schedule Sitter"}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ---------------new code------------
