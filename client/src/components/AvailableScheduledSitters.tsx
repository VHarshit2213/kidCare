// -------------- old code for reference------------

// import { useState } from "react";
// import { useQuery } from "@tanstack/react-query";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { Card } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Avatar } from "@/components/ui/avatar";
// import { User } from "@shared/schema";
// import { format } from "date-fns";
// import { Phone, MessageSquare } from "lucide-react";
// import MessageDialog from "./MessageDialog";

// interface AvailableScheduledSittersProps {
//   isOpen: boolean;
//   onClose: () => void;
//   onPlayAndGreet: (sitterId: number) => void;
//   onBookNow: (sitterId: number) => void;
//   date: Date;
//   startTime: string;
//   endTime: string;
//   playAndGreetStatus: { [key: string]: boolean };
//   bookingStatus: { [key: string]: boolean };
// }

// // Mock data for available sitters
// const mockSitters: (User & { distance: number })[] = [
//   {
//     id: 1,
//     username: "emily_wilson",
//     email: "emily@example.com",
//     fullName: "Emily Wilson",
//     userType: "babysitter",
//     profileImageUrl: "https://randomuser.me/api/portraits/women/44.jpg",
//     bio: "Passionate about childcare with 5+ years of experience",
//     hourlyRate: 35,
//     skills: ["First Aid Certified", "Arts & Crafts", "Meal Preparation"],
//     firstAidCertified: true,
//     hasTransportation: true,
//     yearsExperience: 5,
//     location: "San Francisco, CA",
//     distance: 3.2,
//   },
//   {
//     id: 2,
//     username: "michael_johnson",
//     email: "michael@example.com",
//     fullName: "Michael Johnson",
//     userType: "babysitter",
//     profileImageUrl: "https://randomuser.me/api/portraits/men/32.jpg",
//     bio: "Former elementary teacher with a love for educational activities",
//     hourlyRate: 35,
//     skills: ["Educational Activities", "Music", "Special Needs Experience"],
//     firstAidCertified: true,
//     hasTransportation: true,
//     yearsExperience: 7,
//     location: "San Francisco, CA",
//     distance: 4.8,
//   },
// ];

// export default function AvailableScheduledSitters({
//   isOpen,
//   onClose,
//   onPlayAndGreet,
//   onBookNow,
//   date,
//   startTime,
//   endTime,
//   playAndGreetStatus,
//   bookingStatus = {},
//   nearbySitters,
//   bookingDetails,
// }: AvailableScheduledSittersProps) {
//   const [messageDialogOpen, setMessageDialogOpen] = useState(false);
//   const [selectedSitter, setSelectedSitter] = useState<
//     (User & { distance: number }) | null
//   >(null);

//   return (
//     <>
//       {selectedSitter && (
//         <MessageDialog
//           isOpen={messageDialogOpen}
//           onClose={() => setMessageDialogOpen(false)}
//           recipient={selectedSitter}
//         />
//       )}

//       <Dialog open={isOpen} onOpenChange={onClose}>
//         <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
//           <DialogHeader>
//             <DialogTitle>Available Sitters</DialogTitle>
//             <DialogDescription>
//               {/* We found 2 sitters available for {format(date, "MMMM d")} from{" "}
//               {startTime} to {endTime} */}
//               We found {nearbySitters.length} sitters available within 8 miles
//               for your request
//             </DialogDescription>
//           </DialogHeader>

//           <div className="mt-4 space-y-6">
//             {nearbySitters.map((sitter) => (
//               <Card key={sitter.user_id} className="p-6">
//                 <div className="flex flex-col sm:flex-row gap-4">
//                   <div className="flex-shrink-0">
//                     <Avatar className="h-20 w-20 border">
//                       {sitter.profileImageUrl ? (
//                         <img
//                           src={sitter.profileImageUrl}
//                           alt={sitter.fullName}
//                           className="h-full w-full object-cover"
//                         />
//                       ) : (
//                         <div className="bg-brand-pink/20 flex items-center justify-center h-full w-full text-brand-blue font-semibold text-xl">
//                           {sitter.fullName.charAt(0)}
//                         </div>
//                       )}
//                     </Avatar>
//                   </div>

//                   <div className="flex-1">
//                     <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
//                       <div>
//                         <p
//                           className={`text-sm font-medium ${sitter?.isAvailable ? "text-green-600" : "text-red-600"}`}
//                         >
//                           {sitter?.isAvailable ? "Online" : "Offline"}
//                         </p>
//                         <h3 className="text-lg font-semibold">
//                           {sitter.fullName}
//                         </h3>
//                       </div>
//                       <div>
//                         <div className="flex items-center mt-1 sm:mt-0">
//                           <Badge
//                             variant="outline"
//                             className="text-brand-blue border-brand-pink"
//                           >
//                             ${sitter.horulyRate}/hr
//                           </Badge>
//                           <span className="ml-2 text-sm text-gray-500">
//                             {sitter.distance.toFixed(2)} miles away
//                           </span>
//                         </div>
//                       </div>
//                     </div>

//                     <p className="text-sm text-gray-600 mb-3">
//                       {sitter?.shortBio}
//                     </p>

//                     <div className="flex flex-wrap gap-2 mb-4">
//                       {(sitter.parentSkill || [])
//                         .slice(0, 3)
//                         .map((skill, index) => (
//                           <Badge
//                             key={index}
//                             variant="secondary"
//                             className="bg-brand-blue/10 text-brand-blue text-xs"
//                           >
//                             {skill}
//                           </Badge>
//                         ))}
//                       {sitter?.certified && (
//                         <Badge
//                           variant="outline"
//                           className="bg-brand-blue/10 text-brand-blue text-xs"
//                         >
//                           First Aid
//                         </Badge>
//                       )}
//                       {sitter?.transportation && (
//                         <Badge
//                           variant="outline"
//                           className="bg-brand-blue/10 text-brand-blue text-xs"
//                         >
//                           Transportation
//                         </Badge>
//                       )}
//                     </div>

//                     {bookingStatus[sitter.id.toString()] ? (
//                       <div>
//                         <div className="mt-3 p-3 bg-green-50 text-green-700 rounded-md text-sm mb-4">
//                           Booking confirmed! {sitter.fullName} will be at your
//                           location on {format(date, "MMMM d")} at {startTime}.
//                         </div>
//                         <div className="flex flex-wrap gap-3">
//                           <Button
//                             variant="outline"
//                             className="flex items-center gap-2"
//                             style={{ borderColor: "#3c5679", color: "#3c5679" }}
//                             onClick={() =>
//                               window.alert(`Calling ${sitter.fullName}...`)
//                             }
//                           >
//                             <Phone size={16} />
//                             Call
//                           </Button>
//                           <Button
//                             className="flex items-center gap-2 text-white font-medium"
//                             style={{ backgroundColor: "#3c5679" }}
//                             onClick={() => {
//                               setSelectedSitter(sitter);
//                               setMessageDialogOpen(true);
//                             }}
//                           >
//                             <MessageSquare size={16} />
//                             Message
//                           </Button>
//                           <Button
//                             variant="outline"
//                             style={{ borderColor: "#3c5679", color: "#3c5679" }}
//                             onClick={() =>
//                               window.alert(
//                                 `Viewing ${sitter.fullName}'s profile...`,
//                               )
//                             }
//                           >
//                             View Profile
//                           </Button>
//                         </div>
//                       </div>
//                     ) : playAndGreetStatus[sitter.id.toString()] ? (
//                       <div>
//                         <div className="mt-3 p-3 bg-green-50 text-green-700 rounded-md text-sm mb-4">
//                           Great! {sitter.fullName} has been notified of your
//                           play and greet request.
//                         </div>
//                         <div className="flex flex-wrap gap-3">
//                           <Button
//                             onClick={() => onBookNow(sitter.id)}
//                             style={{ backgroundColor: "#3c5679" }}
//                             className="text-white font-medium"
//                           >
//                             Book Now
//                           </Button>
//                           <Button
//                             variant="outline"
//                             style={{ borderColor: "#3c5679", color: "#3c5679" }}
//                             onClick={() =>
//                               window.alert(
//                                 `Viewing ${sitter.fullName}'s profile...`,
//                               )
//                             }
//                           >
//                             View Profile
//                           </Button>
//                         </div>
//                       </div>
//                     ) : (
//                       <div className="flex flex-wrap gap-3">
//                         <Button
//                           onClick={() => onPlayAndGreet(sitter.id)}
//                           variant="outline"
//                           style={{ borderColor: "#3c5679", color: "#3c5679" }}
//                         >
//                           Schedule a Play and Greet
//                         </Button>
//                         <Button
//                           onClick={() => onBookNow(sitter.id)}
//                           style={{ backgroundColor: "#3c5679" }}
//                           className="text-white font-medium"
//                         >
//                           Book Now
//                         </Button>
//                         <Button
//                           variant="outline"
//                           style={{ borderColor: "#3c5679", color: "#3c5679" }}
//                           onClick={() =>
//                             window.alert(
//                               `Viewing ${sitter.fullName}'s profile...`,
//                             )
//                           }
//                         >
//                           View Profile
//                         </Button>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </Card>
//             ))}
//           </div>

//           <div className="sticky bottom-0 pb-4 pt-4 bg-white border-t mt-6 flex justify-center sm:justify-end">
//             <Button
//               onClick={onClose}
//               style={{ backgroundColor: "#3c5679" }}
//               className="text-white font-medium px-8 py-3 text-base w-full sm:w-auto shadow-md hover:shadow-lg transition-all"
//               size="lg"
//             >
//               Close
//             </Button>
//           </div>
//         </DialogContent>
//       </Dialog>
//     </>
//   );
// }

// -------------- old code for reference------------

// ---------------new code------------
import { useState, type ReactNode } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import {
  babysitterProfile,
  ParentProfile,
  ScheduledCareFormData,
} from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import BookingConfirmation from "./BookingConfirmation";
import UserDetailsDialog from "./admin/UserDetailsDialog";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { apiRequest } from "@/lib/queryClient";
import { BabysitterStripeCheckout } from "./BabysitterStripeCheckout";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { AddressAutofill } from "@mapbox/search-js-react";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface PlayAndGreetDialogProps {
  sitterId: string;
  sitterName: string;
  trigger: ReactNode;
  onSubmit: (values: any) => void;
}

type PlayAndGreetFormValues = {
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  addressDetails: string;
};

const playAndGreetSchema = Yup.object({
  date: Yup.string().required("Date is required"),
  startTime: Yup.string().required("Start time is required"),
  endTime: Yup.string().required("End time is required"),
  location: Yup.string().required("Location is required"),
  addressDetails: Yup.string().optional(),
});

const PlayAndGreetDialog = ({
  sitterId,
  sitterName,
  trigger,
  onSubmit,
}: PlayAndGreetDialogProps) => {
  const [open, setOpen] = useState(false);
  
  const formik = useFormik<PlayAndGreetFormValues>({
    initialValues: {
      date: "",
      startTime: "",
      endTime: "",
      location: "",
      addressDetails: "",
    },
    validationSchema: playAndGreetSchema,
    validateOnMount: true,
    onSubmit: (values, { resetForm }) => {
      console.log("values", values);

      onSubmit({ sitterId, ...values });
      resetForm();
      setOpen(false);
    },
  });

  const {
    values,
    errors,
    touched,
    handleBlur,
    handleSubmit,
    isValid,
    resetForm,
    setFieldValue,
    handleChange
  } = formik;

  const handleDialogChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      resetForm();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]" onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Schedule a Play and Greet</DialogTitle>
          <DialogDescription>
            Share when and where you would like to meet {sitterName}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`play-date-${sitterId}`}>Date</Label>
            <Input
              id={`play-date-${sitterId}`}
              type="date"
              name="date"
              min={new Date().toISOString().split("T")[0]}
              value={values.date}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {touched.date && errors.date && (
              <p className="text-xs text-red-500">{errors.date}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor={`play-start-time-${sitterId}`}>Start Time</Label>
            <Input
              id={`play-start-time-${sitterId}`}
              type="time"
              name="startTime"
              value={values.startTime}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {touched.startTime && errors.startTime && (
              <p className="text-xs text-red-500">{errors.startTime}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor={`play-end-time-${sitterId}`}>End Time</Label>
            <Input
              id={`play-end-time-${sitterId}`}
              type="time"
              name="endTime"
              value={values.endTime}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {touched.endTime && errors.endTime && (
              <p className="text-xs text-red-500">{errors.endTime}</p>
            )}
          </div>
          <div className="space-y-2">
              <Label htmlFor={`play-location-${sitterId}`}>Location</Label>
              <AddressAutofill
                accessToken={MAPBOX_TOKEN}
                onRetrieve={(res) => {
                  const feature = res.features?.[0];
                  const address =
                    feature?.properties?.full_address ||
                    feature?.place_name ||
                    feature?.properties?.address_line1 ||
                    "";
                  if (address) setFieldValue("location", address, true);
                }}
              >
                <Input
                  id={`play-location-${sitterId}`}
                  name="location"
                  placeholder="Start typing address..."
                  autoComplete="street-address"
                  value={values.location}
                  onChange={(e) => setFieldValue("location", e.target.value, true)}
                  onBlur={handleBlur}
                  className="mt-2"
                />
              </AddressAutofill>
              {touched.location && errors.location && (
                <p className="text-xs text-red-500">{errors.location}</p>
              )}
            {touched.location && errors.location && (
              <p className="text-xs text-red-500">{errors.location}</p>
            )}
          </div>
           <div className="space-y-2">
            <Input
              type="text"
              name="addressDetails"
              placeholder="Address Details"
              value={values.addressDetails}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <p className="text-xs">E.g. Floor, Flat no ,Tower</p>
            {touched.addressDetails && errors.addressDetails && (
              <p className="text-xs text-red-500">{errors.addressDetails}</p>
            )}
          </div>

          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleDialogChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              style={{ backgroundColor: "#3c5679" }}
              className="text-white font-medium"
              disabled={!isValid}
            >
              Send Request
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

interface AvailableScheduledSittersProps {
  isOpen: boolean;
  onClose: () => void;
  onPlayAndGreet: (sitterId: string) => void;
  onBookNow: (sitterId: string) => void;
  date: Date;
  startTime: string;
  endTime: string;
  playAndGreetStatus: { [key: string]: boolean };
  bookingStatus?: { [key: string]: boolean };
  bookingDetails: ScheduledCareFormData;
  nearbySitters: (babysitterProfile & {
    distance: number;
    userType: "babysitter";
  })[];
  currentUser: ParentProfile;
}

export default function AvailableScheduledSitters(
  props: AvailableScheduledSittersProps,
) {
  const {
    isOpen,
    onClose,
    onPlayAndGreet,
    onBookNow,
    date,
    startTime,
    playAndGreetStatus,
    bookingStatus = {},
    nearbySitters,
    bookingDetails,
  } = props;
  const { toast } = useToast();
  const [selectedSitter, setSelectedSitter] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [bookedSitter, setBookedSitter] = useState<
    (babysitterProfile & { distance: number }) | null
  >(null);
  const [stripeClientSecret, setStripeClientSecret] = useState("");
  const [showStripeModal, setShowStripeModal] = useState(false);
  const [totalAmount, setTotalAmount] = useState<number | null>(null);

  const options = {
    clientSecret: stripeClientSecret,
    appearance: {
      theme: "stripe" as const,
    },
  };

  const handleBookNow = async (sitterId: string) => {
    setSelectedSitter(sitterId);

    // Find the selected sitter from the filtered list
    const sitter = nearbySitters.find(
      (candidate) => String(candidate.user_id) === sitterId,
    );

    if (!sitter) {
      toast({
        title: "Sitter unavailable",
        description: "We could not find this sitter anymore. Please refresh.",
        variant: "destructive",
      });
      setSelectedSitter(null);
      return;
    }

    const calculatedTotal = sitter.horulyRate * bookingDetails.hoursNeeded;
    setTotalAmount(calculatedTotal);

    try {
      const response = await apiRequest(
        "POST",
        "/api/payments/create-booking-intent",
        {
          totalAmount: calculatedTotal,
          stripeAccountID: sitter.stripeAccountID,
        },
      );

      const payment = await response.json();

      if (!response.ok || !payment?.clientSecret) {
        throw new Error(payment?.message || "Failed to initiate payment.");
      }

      setStripeClientSecret(payment.clientSecret);
      setBookedSitter(sitter);
      setShowStripeModal(true);
      onBookNow(sitterId);
      onClose();
    } catch (error: any) {
      toast({
        title: "Payment Error",
        description: error.message ?? "Failed to initiate payment.",
        variant: "destructive",
      });
      setSelectedSitter(null);
    }
  };

  const handleConfirmationClose = () => {
    setShowConfirmation(false);
    setSelectedSitter(null);
    setBookedSitter(null);
    onClose();
  };

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
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Available Sitters</DialogTitle>
            <DialogDescription>
              {/* We found 2 sitters available for {format(date, "MMMM d")} from{" "}
              {startTime} to {endTime} */}
              We found {nearbySitters.length} sitters available within 8 miles
              for your request
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-6">
            {nearbySitters.map((sitter) => {
              const sitterId = String(sitter.user_id);
            
              const isBooked = Boolean(bookingStatus?.[sitterId]);

              return (
                <Card key={sitterId} className="p-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-shrink-0">
                      <Avatar className="h-20 w-20 border">
                        {sitter.profileImageUrl ? (
                          <img
                            src={sitter.profileImageUrl}
                            alt={sitter.fullName}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="bg-brand-pink/20 flex items-center justify-center h-full w-full text-brand-blue font-semibold text-xl">
                            {sitter.fullName.charAt(0)}
                          </div>
                        )}
                      </Avatar>
                    </div>

                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                        <div>
                          <p
                            className={`text-sm font-medium ${sitter?.isAvailable
                              ? "text-green-600"
                              : "text-red-600"
                              }`}
                          >
                            {sitter?.isAvailable ? "Online" : "Offline"}
                          </p>
                          <h3 className="text-lg font-semibold">
                            {sitter.fullName}
                          </h3>
                        </div>
                        <div>
                          <div className="flex items-center mt-1 sm:mt-0">
                            <Badge
                              variant="outline"
                              className="text-brand-blue border-brand-pink"
                            >
                              ${sitter.horulyRate}/hr
                            </Badge>
                            <span className="ml-2 text-sm text-gray-500">
                              {sitter.distance.toFixed(2)} miles away
                            </span>
                          </div>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 mb-3">
                        {sitter?.shortBio}
                      </p>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {(sitter.parentSkill || [])
                          .slice(0, 3)
                          .map((skill: string, index: number) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="bg-brand-blue/10 text-brand-blue text-xs"
                            >
                              {skill}
                            </Badge>
                          ))}
                        {sitter?.certified && (
                          <Badge
                            variant="outline"
                            className="bg-brand-blue/10 text-brand-blue text-xs"
                          >
                            First Aid
                          </Badge>
                        )}
                        {sitter?.transportation && (
                          <Badge
                            variant="outline"
                            className="bg-brand-blue/10 text-brand-blue text-xs"
                          >
                            Transportation
                          </Badge>
                        )}
                      </div>

                    {/* old  code for reference */}

                    {/* {bookingStatus[sitter.id.toString()] ? (
                      <div>
                        <div className="mt-3 p-3 bg-green-50 text-green-700 rounded-md text-sm mb-4">
                          Booking confirmed! {sitter.fullName} will be at your
                          location on {format(date, "MMMM d")} at {startTime}.
                        </div>
                        <div className="flex flex-wrap gap-3">
                          <Button
                            variant="outline"
                            className="flex items-center gap-2"
                            style={{ borderColor: "#3c5679", color: "#3c5679" }}
                            onClick={() =>
                              window.alert(`Calling ${sitter.fullName}...`)
                            }
                          >
                            <Phone size={16} />
                            Call
                          </Button>
                          <Button
                            className="flex items-center gap-2 text-white font-medium"
                            style={{ backgroundColor: "#3c5679" }}
                            onClick={() => {
                              setSelectedSitter(sitter);
                              setMessageDialogOpen(true);
                            }}
                          >
                            <MessageSquare size={16} />
                            Message
                          </Button>
                          <Button
                            variant="outline"
                            style={{ borderColor: "#3c5679", color: "#3c5679" }}
                            onClick={() =>
                              window.alert(
                                `Viewing ${sitter.fullName}'s profile...`,
                              )
                            }
                          >
                            View Profile
                          </Button>
                        </div>
                      </div>
                    ) : playAndGreetStatus[sitter.id.toString()] ? (
                      <div>
                        <div className="mt-3 p-3 bg-green-50 text-green-700 rounded-md text-sm mb-4">
                          Great! {sitter.fullName} has been notified of your
                          play and greet request.
                        </div>
                        <div className="flex flex-wrap gap-3">
                          <Button
                            onClick={() => onBookNow(sitter.id)}
                            style={{ backgroundColor: "#3c5679" }}
                            className="text-white font-medium"
                          >
                            Book Now
                          </Button>
                          <Button
                            variant="outline"
                            style={{ borderColor: "#3c5679", color: "#3c5679" }}
                            onClick={() =>
                              window.alert(
                                `Viewing ${sitter.fullName}'s profile...`,
                              )
                            }
                          >
                            View Profile
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-3">
                        <Button
                          onClick={() => onPlayAndGreet(sitter.id)}
                          variant="outline"
                          style={{ borderColor: "#3c5679", color: "#3c5679" }}
                        >
                          Schedule a Play and Greet
                        </Button>
                        <Button
                          onClick={() => onBookNow(sitter.id)}
                          style={{ backgroundColor: "#3c5679" }}
                          className="text-white font-medium"
                        >
                          Book Now
                        </Button>
                        <Button
                          variant="outline"
                          style={{ borderColor: "#3c5679", color: "#3c5679" }}
                          onClick={() =>
                            window.alert(
                              `Viewing ${sitter.fullName}'s profile...`,
                            )
                          }
                        >
                          View Profile
                        </Button>
                      </div>
                    )} */}

                    {/* old  code for reference */}

                      <div className="mt-3 flex flex-wrap justify-end gap-2">
                          <PlayAndGreetDialog
                            sitterId={sitterId}
                            sitterName={sitter.fullName}
                            trigger={
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-[#3c5679] text-[#3c5679]"
                              >
                                Schedule a Play and Greet
                              </Button>
                            }
                            onSubmit={({
                              sitterId,
                              date,
                              startTime,
                              endTime,
                              location,
                            }) => {
                              onPlayAndGreet(sitterId);
                              toast({
                                title: "Play and greet requested",
                                description: `We'll let ${sitter.fullName} know about ${date} from ${startTime} to ${endTime} in ${location}.`,
                              });
                            }}
                          />
                       

                        <UserDetailsDialog
                          user={sitter}
                          trigger={
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-[#3c5679] text-[#3c5679]"
                            >
                              View Profile
                            </Button>
                          }
                          fieldsToShow={false}
                        />
                        <Button
                          size="sm"
                          onClick={() => handleBookNow(sitterId)}
                          disabled={selectedSitter === sitterId || isBooked}
                          style={{ backgroundColor: "#3c5679" }}
                          className="text-white font-medium"
                        >
                          {selectedSitter === sitterId
                            ? "Booking..."
                            : isBooked
                              ? "Booked"
                              : "Book Now"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          <div className="sticky bottom-0 pb-4 pt-4 bg-white border-t mt-6 flex justify-center sm:justify-end">
            <Button
              onClick={onClose}
              style={{ backgroundColor: "#3c5679" }}
              className="text-white font-medium px-8 py-3 text-base w-full sm:w-auto shadow-md hover:shadow-lg transition-all"
              size="lg"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {showStripeModal && stripeClientSecret && totalAmount !== null && (
        <Elements stripe={stripePromise} options={options}>
          <BabysitterStripeCheckout
            clientSecret={stripeClientSecret}
            amount={totalAmount}
            onSuccess={() => {
              setShowStripeModal(false);
              setShowConfirmation(true); // optional: show BookingConfirmation
            }}
            onClose={() => {
              setShowStripeModal(false);
              setSelectedSitter(null);
            }}
            bookingType="scheduled"
            bookedSitter={bookedSitter}
            bookingDetails={bookingDetails}
          />
        </Elements>
      )}
    </>
  );
}

// ---------------new code------------
