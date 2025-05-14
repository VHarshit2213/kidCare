import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Tag, Check } from "lucide-react";
import Layout from "@/components/Layout";
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function MembershipPage() {
  console.log("MembershipPage: Component rendered");
  const [_, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  
  console.log("MembershipPage: User data:", user ? {
    id: user.id,
    username: user.username,
    userType: user.userType,
    membershipStatus: user.membershipStatus
  } : "not authenticated");
  
  const [paymentType, setPaymentType] = useState<"full" | "installment">("full");
  const [isLoading, setIsLoading] = useState(false);
  const [promoCode, setPromoCode] = useState("FAMILY24"); // Auto-set the promo code
  const [promoApplied, setPromoApplied] = useState(true); // Auto-apply
  const [discount, setDiscount] = useState(100); // 100% discount

  useEffect(() => {
    if (!user) return;
    
    console.log("MembershipPage: Checking user status");
    
    // If user already has active membership, redirect to home
    if (user.membershipStatus === "active") {
      console.log("MembershipPage: User already has active membership, redirecting to home");
      navigate("/");
      return;
    }
    
    // If user is a babysitter, redirect to profile completion
    if (user.userType !== "parent") {
      console.log("MembershipPage: User is a babysitter, redirecting to profile completion");
      navigate("/profile-completion");
    }
  }, [user, navigate]);

  const activateMembership = async () => {
    setIsLoading(true);
    try {
      console.log("MembershipPage: Activating membership for user", user?.id);
      
      // Directly proceed to membership activation
      const response = await apiRequest("PATCH", "/api/users/membership", {
        userId: user?.id,
        membershipStatus: paymentType === "full" ? "active" : "installment_1",
        promoCode: "FAMILY24",
        discount: 100
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to activate membership");
      }
      
      toast({
        title: "Membership Activated!",
        description: "Your free membership has been activated. Welcome to The Enchanted Co.!",
      });
      
      // Redirect to success page
      navigate("/membership-success");
      return;
    } catch (error: any) {
      console.error("MembershipPage: Error activating membership", error);
      toast({
        title: "Membership Activation Failed",
        description: error.message || "An error occurred activating your membership",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentTypeChange = (value: string) => {
    setPaymentType(value as "full" | "installment");
  };

  if (!user) {
    return (
      <Layout>
        <div className="container max-w-6xl py-10">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-6xl py-10 mx-auto">
        <div className="grid gap-8 md:grid-cols-2 max-w-5xl mx-auto">
          {/* Left side: Membership options */}
          <div>
            <h1 className="text-3xl font-bold mb-6 text-center md:text-left">Membership Registration</h1>
            <p className="mb-8 text-gray-700">
              Welcome to The Enchanted Co.! To access our premium babysitting services, 
              please complete your membership registration. We offer two payment options 
              for your convenience.
            </p>

            <div className="mb-6">
              <RadioGroup value={paymentType} onValueChange={handlePaymentTypeChange} className="space-y-4">
                <div className="border rounded-lg p-4 hover:border-brand-blue">
                  <div className="flex items-start space-x-3">
                    <RadioGroupItem value="full" id="full-payment" />
                    <div className="flex-1">
                      <Label htmlFor="full-payment" className="text-lg font-medium">
                        One-time Payment
                      </Label>
                      <p className="text-sm text-gray-500 mt-1">
                        Pay the full membership fee of $500 at once and get immediate access to all our services.
                      </p>
                      <p className="text-lg font-semibold mt-2">
                        {promoApplied ? (
                          <span>
                            <span className="line-through text-gray-500 text-base mr-2">$500</span>
                            ${(500 * (100 - discount) / 100).toFixed(0)}
                          </span>
                        ) : (
                          "$500"
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-4 hover:border-brand-blue">
                  <div className="flex items-start space-x-3">
                    <RadioGroupItem value="installment" id="installment-payment" />
                    <div className="flex-1">
                      <Label htmlFor="installment-payment" className="text-lg font-medium">
                        Installment Plan
                      </Label>
                      <p className="text-sm text-gray-500 mt-1">
                        Pay $250 now and $250 in 30 days. You'll get immediate access to our services.
                      </p>
                      <p className="text-lg font-semibold mt-2">
                        {promoApplied ? (
                          <span>
                            <span className="line-through text-gray-500 text-base mr-2">$250</span>
                            ${(250 * (100 - discount) / 100).toFixed(0)} now + $250 later
                          </span>
                        ) : (
                          "$250 now + $250 later"
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </RadioGroup>
            </div>

            <div className="mb-6">
              <div className="border rounded-lg p-4">
                <h3 className="text-md font-medium flex items-center gap-2 mb-2">
                  <Tag className="h-4 w-4" />
                  Promo Code
                </h3>
                
                {promoApplied ? (
                  <div className="bg-green-50 text-green-800 rounded-md px-3 py-2 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="text-sm font-medium">{promoCode.toUpperCase()}</p>
                        <p className="text-xs">{discount}% discount applied</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Enter promo code" 
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="flex-1"
                    />
                    <Button>Apply</Button>
                  </div>
                )}
              </div>
            </div>

            <Button 
              onClick={activateMembership} 
              disabled={isLoading}
              size="lg"
              className="w-full"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {promoApplied && discount === 100 
                ? "Activate Free Membership" 
                : "Continue to Membership Activation"}
            </Button>
          </div>
          
          {/* Right side: Membership benefits */}
          <div className="relative overflow-hidden rounded-xl p-8 bg-gradient-to-br from-brand-blue to-brand-blue-dark text-white hidden md:block">
            <div className="absolute inset-0 opacity-5"></div>
            
            <div className="relative">
              <h2 className="text-2xl font-bold mb-4">Membership Benefits</h2>
              <p className="mb-6 text-white/80">
                Join our community of parents and get access to our trusted network of background-checked 
                babysitters. Your membership includes:
              </p>
              
              <ul className="space-y-4">
                <li className="flex items-start">
                  <span>Unlimited access to our full network of verified sitters</span>
                  <span className="inline-flex items-center justify-center rounded-full bg-white/20 p-1 ml-3 text-lg">
                    🔍
                  </span>
                </li>
                <li className="flex items-start">
                  <span>Book last-minute care with our Instant Care feature</span>
                  <span className="inline-flex items-center justify-center rounded-full bg-white/20 p-1 ml-3 text-lg">
                    ⚡
                  </span>
                </li>
                <li className="flex items-start">
                  <span>Schedule babysitting up to 7 days in advance</span>
                  <span className="inline-flex items-center justify-center rounded-full bg-white/20 p-1 ml-3 text-lg">
                    📅
                  </span>
                </li>
                <li className="flex items-start">
                  <span>"Play and Greet" meetings with potential babysitters</span>
                  <span className="inline-flex items-center justify-center rounded-full bg-white/20 p-1 ml-3 text-lg">
                    🤝
                  </span>
                </li>
                <li className="flex items-start">
                  <span>Priority booking with popular sitters</span>
                  <span className="inline-flex items-center justify-center rounded-full bg-white/20 p-1 ml-3 text-lg">
                    ⭐
                  </span>
                </li>
                <li className="flex items-start">
                  <span>24/7 customer support</span>
                  <span className="inline-flex items-center justify-center rounded-full bg-white/20 p-1 ml-3 text-lg">
                    🔄
                  </span>
                </li>
              </ul>

              <div className="border-t border-white/20 mt-8 pt-8">
                <p className="text-sm mb-4">
                  <strong>Important:</strong> All memberships are non-refundable and require a one-time 
                  $500 fee, which can be paid in full or in two $250 installments.
                </p>
                <p className="text-sm">
                  By proceeding with payment, you agree to our Terms of Service and Privacy Policy.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}