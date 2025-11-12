import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Clock } from "lucide-react";
import brandBackgroundImage from "../assets/IMG_1660.jpg";
import { useToast } from "@/hooks/use-toast";
import supabase from "@/config/supabaseClient";
import { Dialog, DialogContent } from "./ui/dialog";
import { MdContentCopy, MdOutlineDiscount } from "react-icons/md";
import kidCare from "../assets/kidCare.png"
import { useZipRestriction } from "@/hooks/use-zip-restriction";

const BLACK_FRIDAY_PROMO_END = Date.UTC(2025, 10, 29, 21, 0, 0); // Nov 29, 2025 1:00 PM PST

export default function Hero() {
  const { user } = useAuth();
  const { toast } = useToast();
  const isAuthenticated = !!user;
  const [, navigate] = useLocation();
  const [profile, setProfile] = useState<any>(null);
  const [showDiscountDialog, setShowDiscountDialog] = useState(false);

  const discountCode = "BLKFDEAL25";
  const isParent = user?.user_metadata?.userType === "parent";
  const isPaymentSuccess = user?.user_metadata?.isPayment;

  const {
    guardNavigation
  } = useZipRestriction({ profile });

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(discountCode);
      toast({
        title: "Code copied!",
        description: `${discountCode} has been copied to your clipboard.`,
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleInstantCareRequest = (event?: React.MouseEvent) => {
    if (guardNavigation(event)) return;

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

  const handleScheduledCareRequest = (event?: React.MouseEvent) => {
    if (guardNavigation(event)) return;

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
  
  const handlePromoClaim = () => {
    setShowDiscountDialog(false);
    navigate("/auth?tab=register");
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

  useEffect(() => {
    const now = Date.now();

    // Show dialog if current time is **before the promo end**
    if (now <= BLACK_FRIDAY_PROMO_END) {
      setShowDiscountDialog(true);
    }
  }, []);
 
  return (
    <>
      <div className="relative h-full bg-[#f5f8fc]">

        {/* for black friday deal  */}
        <Dialog open={showDiscountDialog} onOpenChange={setShowDiscountDialog}>
          <DialogContent className="!max-w-3xl flex">
            <div className="w-1/2 flex flex-col justify-center items-center gap-3 text-brand-blue capitalize text-center">
              <MdOutlineDiscount className="text-3xl" />
              <p className="text-lg font-semibold uppercase tracking-wide">Black Friday Exclusive</p>
              <p className="text-2xl font-bold">
                It’s Here — Our Biggest Discount of the Year!
              </p>
              <div className="flex items-center gap-2 border-2 border-brand-blue rounded-lg px-3 py-2">
                <span className="font-semibold tracking-wider uppercase">{discountCode}</span>
                <button
                  onClick={handleCopyCode}
                  className="text-brand-blue hover:text-brand-blue/70 transition-colors"
                  aria-label="Copy code"
                >
                  <MdContentCopy className="text-xl" />
                </button>
              </div>
              <Button className="w-full mt-2" onClick={handlePromoClaim}>
                Claim Your 75% Off Before It’s Gone
              </Button>
              <p className="text-xs text-gray-500 mt-1">
                Offer valid until <strong>November 29, 2025 at 1 PM PST</strong>.
              </p>
            </div>
            <div className="w-1/2">
              <img
                className="w-full h-full object-cover object-center"
                src={kidCare}
                alt="kidCare"
              />
            </div>
          </DialogContent>
        </Dialog>

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
