import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import brandBackgroundImage from "../assets/IMG_1660.jpg";
import logoImage from "../assets/enchanted-logo-full.jpg";
import nurseryCribImage from "../assets/jenna-duxbury-KZ7cfMnSDh8-unsplash.jpg";

export default function Hero() {
  const { user } = useAuth();
  const isAuthenticated = !!user;
  const [, navigate] = useLocation();

  const handleInstantCareRequest = () => {
    if (isAuthenticated) {
      window.dispatchEvent(new CustomEvent('open-sitter-request'));
    } else {
      navigate("/auth");
    }
  };
  
  const handleScheduledCareRequest = () => {
    if (isAuthenticated) {
      window.dispatchEvent(new CustomEvent('open-scheduled-care'));
    } else {
      navigate("/auth");
    }
  };

  return (
    <>
      <div className="relative min-h-screen bg-[#f8f5ff]">
        {/* Background image with midcentury modern overlay */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#7e57c2]/10 to-[#7e57c2]/20"></div>
          <img
            className="w-full h-full object-cover object-center"
            src={brandBackgroundImage}
            alt="The Enchanted Co. background"
            style={{ opacity: 0.8 }}
          />
          <div className="absolute inset-0 bg-[#7e57c2]/10"></div>
        </div>
        
        {/* Content overlay */}
        <div className="relative flex flex-col justify-center min-h-screen max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
          {/* Main content card - midcentury modern style with cleaner lines */}
          <div className="bg-white/90 backdrop-blur-sm rounded-[4px] p-10 md:p-14 shadow-lg max-w-2xl mx-auto border border-[#7e57c2]/10">
            <div className="mb-10 text-center">
              <h1 className="text-3xl font-bold text-[#7e57c2] sm:text-4xl lg:text-5xl tracking-tight leading-tight">
                Find trusted childcare in minutes
              </h1>
              <p className="mt-6 text-lg text-neutral-700 leading-relaxed">
                The Enchanted Co. provides reliable, background-checked babysitters for your peace of mind. Connect with local babysitters for immediate help or schedule care in advance – all from your phone.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-4 justify-center">
              <Button 
                onClick={handleInstantCareRequest}
                size="lg"
                className="px-6 py-3 text-white text-lg bg-[#7e57c2] hover:bg-[#6a46b0] shadow-md rounded-[4px] font-medium tracking-wide"
              >
                Request a Sitter Now
              </Button>
              
              <Button 
                onClick={handleScheduledCareRequest}
                variant="outline" 
                size="lg"
                className="px-6 py-3 bg-white text-[#7e57c2] hover:bg-purple-50 border-[#7e57c2] text-lg shadow-md rounded-[4px] font-medium tracking-wide"
              >
                <CalendarIcon className="mr-2 h-5 w-5 text-[#7e57c2]" />
                Schedule Care
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
