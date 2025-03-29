import { useState, useContext } from "react";
import { AppContext } from "@/App";
import { Button } from "@/components/ui/button";
import InstantCareModal from "./InstantCareModal";

export default function Hero() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isAuthenticated } = useContext(AppContext);

  const toggleModal = () => {
    if (!isAuthenticated) {
      // Show login prompt or login modal
      alert("Please log in to request childcare services.");
      return;
    }
    setIsModalOpen(!isModalOpen);
  };

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
          <div className="mt-8">
            <Button
              onClick={toggleModal}
              size="lg"
              className="rounded-full bg-[#FC642D] hover:bg-[#E85722]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V5z"
                  clipRule="evenodd"
                />
              </svg>
              Request Instant Care
            </Button>
          </div>
        </div>
      </div>

      <InstantCareModal isOpen={isModalOpen} onClose={toggleModal} />
    </>
  );
}
