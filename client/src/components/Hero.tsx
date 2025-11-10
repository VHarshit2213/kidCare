import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Clock } from "lucide-react";
import brandBackgroundImage from "../assets/IMG_1660.jpg";
import { useToast } from "@/hooks/use-toast";
import supabase from "@/config/supabaseClient";

export default function Hero() {
  const { user } = useAuth();
  const { toast } = useToast();
  const isAuthenticated = !!user;
  const [, navigate] = useLocation();
  const [profile, setProfile] = useState<any>(null);

  const isParent = user?.user_metadata?.userType === "parent";
  const isPaymentSuccess = user?.user_metadata?.isPayment;

  const handleInstantCareRequest = () => {
    if (!isAuthenticated) {
      navigate("/auth");
    } else if (!isPaymentSuccess) {
      navigate("/membership");
    } else if (!profile) {
      window.dispatchEvent(new CustomEvent("open-sitter-request"));
    } else if (!profile?.isApproved) {
      toast({
        title: "Access Denied",
        description:
          "Your profile is under review you can not book babysitter.",
        variant: "destructive",
      });
    } else {
      window.dispatchEvent(new CustomEvent("open-sitter-request"));
    }
  };

  const handleScheduledCareRequest = () => {
    if (!isAuthenticated) {
      navigate("/auth");
    } else if (!isPaymentSuccess) {
      navigate("/membership");
    } else if (!profile) {
      window.dispatchEvent(new CustomEvent("open-scheduled-care"));
    } else if (!profile?.isApproved) {
      toast({
        title: "Access Denied",
        description:
          "Your profile is under review you can not book babysitter.",
        variant: "destructive",
      });
    } else {
      window.dispatchEvent(new CustomEvent("open-scheduled-care"));
    }
  };

  const fetchParentProfile = async () => {
    if (!user?.id) return;

    const { data, error } = await supabase
      .from("parentprofile")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error) {
      console.error("Fetch error:", error.message);
      return null;
    }
    setProfile(data);
  };

  useEffect(() => {
    if (user?.id && user?.user_metadata?.userType === "parent") {
      fetchParentProfile();
    }
  }, [user]);
 
  return (
    <>
      <div className="relative h-full bg-[#f5f8fc]">
        {/* Background image with midcentury modern overlay */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-brand-blue/10 to-brand-blue/20"></div>
          <img
            className="w-full h-full object-cover object-center"
            src={brandBackgroundImage}
            alt="The Enchanted Co. background"
            style={{ opacity: 0.8 }}
          />
          <div className="absolute inset-0 bg-brand-blue/10"></div>
        </div>

        {/* Content overlay */}
        {isParent && (
          <div className="relative flex flex-col justify-center h-full max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
            {/* Main content card - midcentury modern style with cleaner lines */}
            <div className="bg-white/70 backdrop-blur-sm rounded-[4px] p-6 sm:p-10 md:p-14 shadow-lg max-w-2xl mx-auto border border-brand-blue/10">
              <div className="mb-6 md:mb-10 text-center">
                <h1 className="font-bold text-brand-blue text-2xl sm:text-3xl md:text-4xl lg:text-5xl tracking-tight leading-tight">
                  Find trusted childcare in minutes
                </h1>
                <p className="mt-4 md:mt-6 md:text-lg text-neutral-700 leading-relaxed">
                  The Enchanted Co. provides reliable, background-checked
                  babysitters for your peace of mind. Connect with local
                  babysitters for immediate help or schedule care in advance –
                  all from your phone.
                </p>
              </div>

              <div className="flex flex-wrap gap-4 justify-center">
                <Button
                  onClick={handleInstantCareRequest}
                  variant="blue"
                  size="md"
                >
                  <Clock className="mr-2 h-4 w-4" />
                  Request a Sitter Now
                </Button>

                <Button
                  onClick={handleScheduledCareRequest}
                  variant="outline_blue"
                  size="md"
                >
                  <CalendarIcon className="mr-2 h-5 w-5" />
                  Schedule Care
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
