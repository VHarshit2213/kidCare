import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import Header from "./Header";
import Footer from "./Footer";
import MobileNav from "./MobileNav";
import { useAuth } from "@/hooks/use-auth";
import InstantCareModal from "./InstantCareModal";
import ScheduledCareModal from "./ScheduledCareModal";
import MessageNotifications from "./MessageNotifications";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user } = useAuth();
  const isAuthenticated = !!user;
  const [, navigate] = useLocation();
  const [isInstantCareModalOpen, setIsInstantCareModalOpen] = useState(false);
  const [isScheduledCareModalOpen, setIsScheduledCareModalOpen] = useState(false);
  const userId = user?.id;

  useEffect(() => {
    const handleOpenSitterRequest = () => {
      if (isAuthenticated) {
        setIsInstantCareModalOpen(true);
      } else {
        navigate("/auth");
      }
    };

    const handleOpenScheduledCare = () => {
      if (isAuthenticated) {
        setIsScheduledCareModalOpen(true);
      } else {
        navigate("/auth");
      }
    };

    window.addEventListener('open-sitter-request', handleOpenSitterRequest);
    window.addEventListener('open-scheduled-care', handleOpenScheduledCare);

    return () => {
      window.removeEventListener('open-sitter-request', handleOpenSitterRequest);
      window.removeEventListener('open-scheduled-care', handleOpenScheduledCare);
    };
  }, [isAuthenticated, navigate]);

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <MessageNotifications currentUserId={userId} />
      <main className="flex-1 relative z-0 overflow-y-auto bg-neutral-lighter pb-28 xxl:pb-0">
        {children}
      </main>
      <Footer />
      <MobileNav />

      {/* Modals */}
      <InstantCareModal 
        isOpen={isInstantCareModalOpen} 
        onClose={() => setIsInstantCareModalOpen(false)} 
      />
      
      <ScheduledCareModal 
        isOpen={isScheduledCareModalOpen} 
        onClose={() => setIsScheduledCareModalOpen(false)} 
      />
    </div>
  );
}
