import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { User } from "@/lib/types";
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
  playAndGreetStatus: {[key: string]: boolean};
  bookingStatus: {[key: string]: boolean};
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
    distance: 3.2
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
    distance: 4.8
  }
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
  bookingStatus = {}
}: AvailableScheduledSittersProps) {
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [selectedSitter, setSelectedSitter] = useState<User & { distance: number } | null>(null);
  
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
        <DialogContent className="sm:max-w-[650px]">
          <DialogHeader>
            <DialogTitle>Available Sitters</DialogTitle>
            <DialogDescription>
              We found 2 sitters available for {format(date, "MMMM d")} from {startTime} to {endTime}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-6">
            {mockSitters.map((sitter) => (
              <Card key={sitter.id} className="p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-shrink-0">
                    <Avatar className="h-20 w-20 border">
                      {sitter.profileImageUrl ? (
                        <img src={sitter.profileImageUrl} alt={sitter.fullName} className="h-full w-full object-cover" />
                      ) : (
                        <div className="bg-brand-pink/20 flex items-center justify-center h-full w-full text-brand-blue font-semibold text-xl">
                          {sitter.fullName.charAt(0)}
                        </div>
                      )}
                    </Avatar>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold">{sitter.fullName}</h3>
                      <div className="flex items-center mt-1 sm:mt-0">
                        <Badge variant="outline" className="text-brand-blue border-brand-pink">
                          ${sitter.hourlyRate}/hr
                        </Badge>
                        <span className="ml-2 text-sm text-gray-500">
                          {sitter.distance} miles away
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">
                      {sitter.bio}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {(sitter.skills || []).slice(0, 3).map((skill, index) => (
                        <Badge key={index} variant="secondary" className="bg-brand-blue/10 text-brand-blue text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                    
                    {bookingStatus[sitter.id.toString()] ? (
                      <div>
                        <div className="mt-3 p-3 bg-green-50 text-green-700 rounded-md text-sm mb-4">
                          Booking confirmed! {sitter.fullName} will be at your location on {format(date, "MMMM d")} at {startTime}.
                        </div>
                        <div className="flex flex-wrap gap-3">
                          <Button 
                            variant="outline"
                            className="flex items-center gap-2"
                            style={{ borderColor: "#3c5679", color: "#3c5679" }}
                            onClick={() => window.alert(`Calling ${sitter.fullName}...`)}
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
                        </div>
                      </div>
                    ) : playAndGreetStatus[sitter.id.toString()] ? (
                      <div>
                        <div className="mt-3 p-3 bg-green-50 text-green-700 rounded-md text-sm mb-4">
                          Great! {sitter.fullName} has been notified of your play and greet request.
                        </div>
                        <Button 
                          onClick={() => onBookNow(sitter.id)}
                          style={{ backgroundColor: "#3c5679" }}
                          className="text-white font-medium"
                        >
                          Book Now
                        </Button>
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
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
          
          <div className="mt-6 pt-4 border-t flex justify-end">
            <Button 
              onClick={onClose} 
              style={{ backgroundColor: "#3c5679" }}
              className="text-white font-medium"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}