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
              <button 
                onClick={toggleModal}
                className="btn-brand-primary px-6 py-3 shadow-lg text-lg"
              >
                Request a Sitter Now
              </button>
              <ScheduledCareModal />
            </div>
          </div>
        </div>
      </div>

      <InstantCareModal isOpen={isModalOpen} onClose={toggleModal} />
    </>
  );
}
