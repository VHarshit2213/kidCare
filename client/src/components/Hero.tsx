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
      <div className="relative min-h-screen bg-[#f6e6df]">
        {/* Background image */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-brand-pink/20 to-brand-blue/20"></div>
          <img
            className="w-full h-full object-cover object-center"
            src={brandBackgroundImage}
            alt="The Enchanted Co. background"
            style={{ opacity: 0.95 }}
          />
          <div className="absolute inset-0 bg-[#3c5679]/10"></div>
        </div>
        
        {/* Content overlay */}
        <div className="relative flex flex-col justify-center min-h-screen max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
          {/* Main content card */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-8 md:p-10 shadow-xl max-w-2xl mx-auto">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold text-[#3c5679] sm:text-4xl lg:text-5xl">
                Find trusted childcare in minutes
              </h1>
              <p className="mt-4 text-lg text-[#3c5679]/80">
                The Enchanted Co. provides reliable, background-checked babysitters for your peace of mind. Connect with local babysitters for immediate help or schedule care in advance – all from your phone.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-3 justify-center">
              <Button 
                onClick={handleInstantCareRequest}
                size="lg"
                style={{ backgroundColor: "#3c5679" }}
                className="px-6 py-3 text-white text-lg shadow-lg"
              >
                Request a Sitter Now
              </Button>
              
              <Button 
                onClick={handleScheduledCareRequest}
                variant="outline" 
                size="lg"
                className="px-6 py-3 bg-white text-brand-blue hover:bg-gray-50 border-brand-pink text-lg shadow-lg"
              >
                <CalendarIcon className="mr-2 h-5 w-5 text-brand-pink" />
                Schedule Care
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
