import { useState, useEffect } from "react";
import InstantCareModal from "./InstantCareModal";
import heroBackgroundImage from "../assets/jenna-duxbury-KZ7cfMnSDh8-unsplash.jpg";

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
      <div className="relative bg-brand-pink">
        <div className="absolute inset-0">
          <img
            className="w-full h-full object-cover"
            src={heroBackgroundImage}
            alt="Wooden baby crib in a nursery"
          />
          <div className="absolute inset-0 bg-brand-blue/60 mix-blend-multiply"></div>
        </div>
        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-36 md:py-48 lg:py-56 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
            Find trusted childcare in minutes
          </h1>
          <p className="mt-4 text-lg text-white opacity-90 max-w-xl">
            The Enchanted Co. provides reliable, background-checked babysitters for your peace of mind. Connect with local babysitters for immediate help or schedule care in advance – all from your phone or computer.
          </p>
          <div className="mt-8">
            <button 
              onClick={toggleModal}
              className="btn-brand-primary px-6 py-3 shadow-lg text-lg"
            >
              Request a Sitter Now
            </button>
          </div>
        </div>
      </div>

      <InstantCareModal isOpen={isModalOpen} onClose={toggleModal} />
    </>
  );
}
