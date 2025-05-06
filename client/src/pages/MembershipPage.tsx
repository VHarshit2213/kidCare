import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Tag, Check } from "lucide-react";
import Layout from "@/components/Layout";
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

// Load stripe outside of component rendering to avoid recreating the Stripe object on every render
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const MembershipPaymentForm: React.FC<{
  clientSecret: string;
  onSuccess: () => void;
}> = ({ clientSecret, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      // Stripe.js hasn't loaded yet
      return;
    }
    
    setIsSubmitting(true);

    try {
      // Confirm the payment
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/membership-success`,
        },
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        // This point will only be reached if there is an immediate error when confirming the payment.
        // Otherwise, your customer will be redirected to your `return_url`
        onSuccess();
      }
    } catch (error: any) {
      toast({
        title: "Payment Error",
        description: error.message || "An error occurred processing your payment",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement options={{
        // Enable Apple Pay & Google Pay, disable Affirm & Klarna
        paymentMethodOrder: ['card', 'apple_pay', 'google_pay'],
        wallets: {
          applePay: 'auto',
          googlePay: 'auto'
        }
      }} />
      <Button 
        type="submit" 
        className="w-full" 
        disabled={isSubmitting || !stripe || !elements}
        size="lg"
      >
        {isSubmitting ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : null}
        Complete Payment
      </Button>
    </form>
  );
};

export default function MembershipPage() {
  const [_, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [paymentType, setPaymentType] = useState<"full" | "installment">("full");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [applyingPromo, setApplyingPromo] = useState(false);
  const [discount, setDiscount] = useState(0);

  useEffect(() => {
    if (!user) return;
    
    // If user already has active membership, redirect to home
    if (user.membershipStatus === "active") {
      navigate("/");
      return;
    }
    
    // If user is a babysitter, redirect to profile completion
    if (user.userType !== "parent") {
      navigate("/profile-completion");
    }
  }, [user, navigate]);

  const handleApplyPromoCode = async () => {
    if (!promoCode.trim()) {
      toast({
        title: "No Promo Code",
        description: "Please enter a promo code",
        variant: "destructive",
      });
      return;
    }

    setApplyingPromo(true);
    
    try {
      // In a real app, you would verify this with the backend
      // For this demo, we'll mock some promo codes
      const validPromoCodes = {
        "WELCOME10": 10,
        "FAMILY25": 25,
        "SUMMER15": 15
      };
      
      const code = promoCode.trim().toUpperCase();
      
      // Simulate API call with a delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      if (code in validPromoCodes) {
        setDiscount(validPromoCodes[code as keyof typeof validPromoCodes]);
        setPromoApplied(true);
        toast({
          title: "Promo Code Applied!",
          description: `You received a ${validPromoCodes[code as keyof typeof validPromoCodes]}% discount`,
        });
      } else {
        toast({
          title: "Invalid Promo Code",
          description: "This promo code is invalid or expired",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred applying the promo code",
        variant: "destructive",
      });
    } finally {
      setApplyingPromo(false);
    }
  };

  const createPaymentIntent = async () => {
    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/create-membership-intent", {
        paymentType,
        userId: user?.id,
        promoCode: promoApplied ? promoCode : undefined,
        discount: promoApplied ? discount : 0,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create payment intent");
      }

      const data = await response.json();
      setClientSecret(data.clientSecret);
      setPaymentIntentId(data.paymentIntentId);
    } catch (error: any) {
      toast({
        title: "Payment Setup Failed",
        description: error.message || "An error occurred setting up your payment",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentTypeChange = (value: string) => {
    setPaymentType(value as "full" | "installment");
    // Clear existing client secret when payment type changes
    setClientSecret(null);
    setPaymentIntentId(null);
  };

  const handlePaymentSuccess = async () => {
    if (!paymentIntentId || !user) return;
    
    try {
      const response = await apiRequest("POST", "/api/verify-membership-payment", {
        paymentIntentId,
        userId: user.id,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to verify payment");
      }

      toast({
        title: "Payment Successful",
        description: "Your membership has been activated. Welcome to The Enchanted Co.!",
      });

      // Redirect to success page
      navigate("/membership-success");
    } catch (error: any) {
      toast({
        title: "Verification Failed",
        description: error.message || "An error occurred verifying your payment",
        variant: "destructive",
      });
    }
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
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setPromoApplied(false);
                        setPromoCode("");
                        setDiscount(0);
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Enter promo code" 
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="flex-1"
                      disabled={applyingPromo}
                    />
                    <Button 
                      onClick={handleApplyPromoCode}
                      disabled={applyingPromo || !promoCode.trim()}
                    >
                      {applyingPromo ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {!clientSecret ? (
              <Button 
                onClick={createPaymentIntent} 
                disabled={isLoading}
                size="lg"
                className="w-full"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Continue to Payment
              </Button>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Complete Your Payment</CardTitle>
                  <CardDescription>
                    {paymentType === "full" 
                      ? promoApplied 
                        ? `You'll be charged $${(500 * (100 - discount) / 100).toFixed(0)} for your membership (${discount}% off)`
                        : "You'll be charged $500 for your membership"
                      : promoApplied
                        ? `You'll be charged $${(250 * (100 - discount) / 100).toFixed(0)} now (${discount}% off), and $250 in 30 days`
                        : "You'll be charged $250 now, and $250 in 30 days"
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <p className="text-sm text-gray-700 font-medium mb-2">Available Payment Methods:</p>
                    <div className="flex flex-wrap gap-3">
                      <div className="flex items-center border rounded-md px-3 py-1.5 gap-2">
                        <div className="w-8 h-5 flex items-center justify-center bg-neutral-100 rounded">
                          <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22 4H2c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h20c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H2V6h20v12z" fill="#888" />
                            <path d="M12 12m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" fill="#888" />
                          </svg>
                        </div>
                        <span className="text-sm">Credit Card</span>
                      </div>
                      <div className="flex items-center border rounded-md px-3 py-1.5 gap-2">
                        <div className="w-8 h-5 flex items-center justify-center bg-black rounded">
                          <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
                            <path d="M17.5 12.5c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm-11-4c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm5.5 6.5c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2z" fill="white" />
                          </svg>
                        </div>
                        <span className="text-sm">Apple Pay</span>
                      </div>
                      <div className="flex items-center border rounded-md px-3 py-1.5 gap-2">
                        <div className="w-8 h-5 flex items-center justify-center bg-gradient-to-r from-teal-400 to-blue-500 rounded">
                          <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20.5 11.5h-17c-.55 0-1 .45-1 1s.45 1 1 1h17c.55 0 1-.45 1-1s-.45-1-1-1z" fill="white" />
                          </svg>
                        </div>
                        <span className="text-sm">Google Pay</span>
                      </div>
                    </div>
                  </div>
                  <Elements stripe={stripePromise} options={{ clientSecret }}>
                    <MembershipPaymentForm 
                      clientSecret={clientSecret} 
                      onSuccess={handlePaymentSuccess} 
                    />
                  </Elements>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={() => setClientSecret(null)}>
                    Back
                  </Button>
                </CardFooter>
              </Card>
            )}
          </div>

          {/* Right side: Membership benefits */}
          <div className="bg-brand-blue text-white p-8 rounded-lg">
            <h2 className="text-2xl font-bold mb-6">Membership Benefits</h2>
            <ul className="space-y-4">
              <li className="flex items-start">
                <span>Access to our network of verified, professional babysitters</span>
                <span className="inline-flex items-center justify-center rounded-full bg-white/20 p-1 ml-3 text-lg">
                  👨‍👩‍👧‍👦
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
    </Layout>
  );
}