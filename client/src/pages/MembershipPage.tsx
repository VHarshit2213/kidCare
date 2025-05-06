import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import Layout from "@/components/Layout";
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

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
      <PaymentElement />
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

  const createPaymentIntent = async () => {
    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/create-membership-intent", {
        paymentType,
        userId: user?.id,
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

            <div className="mb-8">
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
                      <p className="text-lg font-semibold mt-2">$500</p>
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
                      <p className="text-lg font-semibold mt-2">$250 now + $250 later</p>
                    </div>
                  </div>
                </div>
              </RadioGroup>
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
                      ? "You'll be charged $500 for your membership" 
                      : "You'll be charged $250 now, and $250 in 30 days"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
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
                <span className="inline-flex items-center justify-center rounded-full bg-white/20 p-1 mr-3 mt-1 text-lg">
                  👨‍👩‍👧‍👦
                </span>
                <span>Access to our network of verified, professional babysitters</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center rounded-full bg-white/20 p-1 mr-3 mt-1 text-lg">
                  ⚡
                </span>
                <span>Book last-minute care with our Instant Care feature</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center rounded-full bg-white/20 p-1 mr-3 mt-1 text-lg">
                  📅
                </span>
                <span>Schedule babysitting up to 7 days in advance</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center rounded-full bg-white/20 p-1 mr-3 mt-1 text-lg">
                  🤝
                </span>
                <span>"Play and Greet" meetings with potential babysitters</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center rounded-full bg-white/20 p-1 mr-3 mt-1 text-lg">
                  ⭐
                </span>
                <span>Priority booking with popular sitters</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center rounded-full bg-white/20 p-1 mr-3 mt-1 text-lg">
                  🔄
                </span>
                <span>24/7 customer support</span>
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