import { useState, useEffect } from "react";
import InstantCareModal from "./InstantCareModal";
import ScheduledCareModal from "./ScheduledCareModal";
import brandBackgroundImage from "../assets/IMG_1660.jpg";
import logoImage from "../assets/enchanted-logo-full.jpg";
import nurseryCribImage from "../assets/jenna-duxbury-KZ7cfMnSDh8-unsplash.jpg";

export default function Hero() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };
  
  // Listen for the custom event to open the sitter request modal
  useEffect(() => {
    const handleOpenSitterRequest = () => {
      setIsModalOpen(true);
    };
    
    window.addEventListener('open-sitter-request', handleOpenSitterRequest);
    
    return () => {
      window.removeEventListener('open-sitter-request', handleOpenSitterRequest);
    };
  }, []);

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
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">
            {/* Main content card */}
            <div className="lg:col-span-3 bg-white/90 backdrop-blur-sm rounded-xl p-8 md:p-10 shadow-xl">
              <div className="mb-8">
                <img 
                  src={logoImage} 
                  alt="The Enchanted Co. Logo" 
                  className="h-16 mb-6 mx-auto lg:mx-0"
                />
                <h1 className="text-3xl font-bold text-[#3c5679] sm:text-4xl lg:text-5xl">
                  Find trusted childcare in minutes
                </h1>
                <p className="mt-4 text-lg text-[#3c5679]/80">
                  The Enchanted Co. provides reliable, background-checked babysitters for your peace of mind. Connect with local babysitters for immediate help or schedule care in advance – all from your phone or computer.
                </p>
              </div>
              
              <div className="flex flex-wrap gap-3 lg:justify-start justify-center">
                <button 
                  onClick={toggleModal}
                  className="btn-brand-primary px-6 py-3 shadow-lg text-lg"
                >
                  Request a Sitter Now
                </button>
                <ScheduledCareModal />
              </div>
            </div>
            
            {/* Image card - Only visible on large screens */}
            <div className="hidden lg:block lg:col-span-2">
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-xl overflow-hidden">
                <img 
                  src={nurseryCribImage} 
                  alt="Peaceful nursery crib" 
                  className="w-full h-auto rounded-lg object-cover"
                />
                <div className="mt-6 p-4 bg-brand-pink/10 rounded-lg border border-brand-pink/20">
                  <h3 className="text-xl font-semibold text-[#3c5679] mb-2">Peace of Mind</h3>
                  <p className="text-[#3c5679]/80">
                    All our sitters undergo thorough background checks and are experienced in childcare.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <InstantCareModal isOpen={isModalOpen} onClose={toggleModal} />
    </>
  );
}
