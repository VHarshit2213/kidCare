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

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { User } from "@shared/schema";
import { format } from "date-fns";
import { Phone, MessageSquare } from "lucide-react";
import MessageDialog from "./MessageDialog";

interface AvailableScheduledSittersProps {
  isOpen: boolean;
  onClose: () => void;
  onPlayAndGreet: (sitterId: number) => void;
  onBookNow: (sitterId: number) => void;
  date: Date;
  startTime: string;
  endTime: string;
  playAndGreetStatus: { [key: string]: boolean };
  bookingStatus: { [key: string]: boolean };
}

// Mock data for available sitters
const mockSitters: (User & { distance: number })[] = [
  {
    id: 1,
    username: "emily_wilson",
    email: "emily@example.com",
    fullName: "Emily Wilson",
    userType: "babysitter",
    profileImageUrl: "https://randomuser.me/api/portraits/women/44.jpg",
    bio: "Passionate about childcare with 5+ years of experience",
    hourlyRate: 35,
    skills: ["First Aid Certified", "Arts & Crafts", "Meal Preparation"],
    firstAidCertified: true,
    hasTransportation: true,
    yearsExperience: 5,
    location: "San Francisco, CA",
    distance: 3.2,
  },
  {
    id: 2,
    username: "michael_johnson",
    email: "michael@example.com",
    fullName: "Michael Johnson",
    userType: "babysitter",
    profileImageUrl: "https://randomuser.me/api/portraits/men/32.jpg",
    bio: "Former elementary teacher with a love for educational activities",
    hourlyRate: 35,
    skills: ["Educational Activities", "Music", "Special Needs Experience"],
    firstAidCertified: true,
    hasTransportation: true,
    yearsExperience: 7,
    location: "San Francisco, CA",
    distance: 4.8,
  },
];

export default function AvailableScheduledSitters({
  isOpen,
  onClose,
  onPlayAndGreet,
  onBookNow,
  date,
  startTime,
  endTime,
  playAndGreetStatus,
  bookingStatus = {},
  nearbySitters,
  bookingDetails,
}: AvailableScheduledSittersProps) {
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [selectedSitter, setSelectedSitter] = useState<
    (User & { distance: number }) | null
  >(null);

  return (
    <>
      {selectedSitter && (
        <MessageDialog
          isOpen={messageDialogOpen}
          onClose={() => setMessageDialogOpen(false)}
          recipient={selectedSitter}
        />
      )}

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
            {nearbySitters.map((sitter) => (
              <Card key={sitter.user_id} className="p-6">
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
                          className={`text-sm font-medium ${sitter?.isAvailable ? "text-green-600" : "text-red-600"}`}
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
                        .map((skill, index) => (
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

                    {bookingStatus[sitter.id.toString()] ? (
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
                    )}
                  </div>
                </div>
              </Card>
            ))}
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
    </>
  );
}

// ---------------new code------------
