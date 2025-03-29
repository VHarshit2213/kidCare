import { useState, useEffect } from "react";
import InstantCareModal from "./InstantCareModal";

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
      <div className="relative bg-primary">
        <div className="absolute inset-0">
          <img
            className="w-full h-full object-cover"
            src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2689&q=80"
            alt="Happy children playing"
          />
          <div className="absolute inset-0 bg-primary mix-blend-multiply"></div>
        </div>
        <div className="relative max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
            Find trusted childcare in minutes
          </h1>
          <p className="mt-4 text-lg text-white opacity-90 max-w-xl">
            Connect with local babysitters for immediate help or schedule care in advance – all from your phone or computer.
          </p>
        </div>
      </div>

      <InstantCareModal isOpen={isModalOpen} onClose={toggleModal} />
    </>
  );
}
