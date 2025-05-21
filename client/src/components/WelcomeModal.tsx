import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
}

export function WelcomeModal({ isOpen, onClose, userName }: WelcomeModalProps) {
  const [_, navigate] = useLocation();

  const handleContinue = () => {
    onClose();
    navigate("/membership");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl text-[#3c5679]">
            Welcome to the Enchanted Co! 🧸
          </DialogTitle>
          <DialogDescription className="text-base pt-2">
            We're excited to have you on board, {userName}!
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
            <h3 className="font-medium text-[#3c5679] mb-2">Here's what you can do next:</h3>
            <ul className="space-y-2 pl-2">
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">•</span>
                <span><strong>Complete your profile</strong> – This helps us and our caregivers learn more about you</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">•</span>
                <span><strong>Explore the dashboard</strong> – Get familiar with the tools and features</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">•</span>
                <span><strong>Start Booking</strong> - Book care with confidence! Our caregivers are background checked and reviewed by our team</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">•</span>
                <span><strong>Reach out anytime</strong> – Our support team is here to help at <a href="mailto:hello@lovetheenchantedco.com" className="text-blue-600 underline">hello@lovetheenchantedco.com</a></span>
              </li>
            </ul>
          </div>

          <div className="text-center font-medium">
            Welcome to the Enchanted Co Family! 🎉
          </div>
        </div>

        <DialogFooter>
          <Button 
            onClick={handleContinue} 
            className="w-full"
            style={{ backgroundColor: "#3c5679" }}
          >
            Continue to Membership
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}