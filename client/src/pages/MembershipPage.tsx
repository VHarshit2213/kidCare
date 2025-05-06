import { useState } from "react";
import { useLocation, useRoute } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const MembershipForm = ({ paymentOption }: { paymentOption: "full" | "installment" }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + "/membership-success",
        },
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        // Payment succeeded - this part won't execute due to the page redirect
        toast({
          title: "Payment Successful",
          description: "Your membership is active!",
        });

        // Update user's membership status in our database
        await apiRequest("PATCH", "/api/users/membership", {
          userId: user?.id,
          membershipStatus: paymentOption === "full" ? "active" : "installment_1",
        });

        navigate("/");
      }
    } catch (error: any) {
      toast({
        title: "Payment Error",
        description: error.message || "Something went wrong with your payment",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <Button 
        type="submit" 
        className="w-full" 
        style={{ backgroundColor: "#3c5679" }}
        disabled={!stripe || !elements || isProcessing}
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          `Pay $${paymentOption === "full" ? "500" : "250"} Now`
        )}
      </Button>
    </form>
  );
};

export default function MembershipPage() {
  const [match, params] = useRoute("/membership/:userId");
  const { user } = useAuth();
  const [clientSecret, setClientSecret] = useState("");
  const [selectedTab, setSelectedTab] = useState("full");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [, navigate] = useLocation();

  // Redirect if no user is logged in
  if (!user) {
    navigate("/auth");
    return null;
  }

  // Request payment intent on component mount
  useState(() => {
    const fetchPaymentIntent = async () => {
      setIsLoading(true);
      try {
        const response = await apiRequest("POST", "/api/create-membership-intent", {
          paymentType: selectedTab as "full" | "installment",
          userId: user.id,
        });
        
        const data = await response.json();
        setClientSecret(data.clientSecret);
      } catch (error: any) {
        toast({
          title: "Error",
          description: "Could not initialize payment. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchPaymentIntent();
    }
  }, [selectedTab, user?.id]);

  // Handle tab change
  const handleTabChange = async (value: string) => {
    setSelectedTab(value);
    
    // Request new payment intent when tab changes
    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/create-membership-intent", {
        paymentType: value as "full" | "installment",
        userId: user?.id,
      });
      
      const data = await response.json();
      setClientSecret(data.clientSecret);
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not initialize payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const stripeOptions = {
    clientSecret,
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#3c5679',
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#3c5679]">Membership Registration</h1>
          <p className="mt-2 text-gray-600">
            Complete your membership registration to access our trusted babysitting services
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Select Membership Option</CardTitle>
            <CardDescription>
              Choose how you'd like to pay for your non-refundable membership
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="full" value={selectedTab} onValueChange={handleTabChange}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="full">One-time Payment</TabsTrigger>
                <TabsTrigger value="installment">Installment Plan</TabsTrigger>
              </TabsList>
              <TabsContent value="full" className="space-y-4">
                <div className="p-4 border rounded-md bg-blue-50 mt-4">
                  <h3 className="font-semibold text-lg text-[#3c5679]">$500 Single Payment</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Pay your entire membership fee in one payment and get immediate access to all services.
                  </p>
                  <div className="mt-4 bg-white p-3 rounded-md shadow-sm">
                    <span className="font-bold text-2xl text-[#3c5679]">$500</span>
                    <span className="text-gray-500 ml-2">one-time payment</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 italic">
                    This is a non-refundable membership fee.
                  </p>
                </div>

                {isLoading ? (
                  <div className="flex justify-center p-6">
                    <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
                  </div>
                ) : clientSecret ? (
                  <Elements stripe={stripePromise} options={stripeOptions}>
                    <MembershipForm paymentOption="full" />
                  </Elements>
                ) : (
                  <div className="p-4 text-center text-red-500">
                    Could not load payment form. Please try again.
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="installment" className="space-y-4">
                <div className="p-4 border rounded-md bg-blue-50 mt-4">
                  <h3 className="font-semibold text-lg text-[#3c5679]">Two $250 Payments</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Split your membership fee into two equal payments. Pay the first installment now and the second one later.
                  </p>
                  <div className="mt-4 bg-white p-3 rounded-md shadow-sm">
                    <span className="font-bold text-2xl text-[#3c5679]">$250</span>
                    <span className="text-gray-500 ml-2">first payment</span>
                  </div>
                  <div className="mt-2 bg-white p-3 rounded-md shadow-sm opacity-70">
                    <span className="font-bold text-xl text-[#3c5679]">$250</span>
                    <span className="text-gray-500 ml-2">second payment (due later)</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 italic">
                    This is a non-refundable membership fee.
                  </p>
                </div>

                {isLoading ? (
                  <div className="flex justify-center p-6">
                    <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
                  </div>
                ) : clientSecret ? (
                  <Elements stripe={stripePromise} options={stripeOptions}>
                    <MembershipForm paymentOption="installment" />
                  </Elements>
                ) : (
                  <div className="p-4 text-center text-red-500">
                    Could not load payment form. Please try again.
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-center border-t pt-6">
            <p className="text-sm text-gray-500 text-center">
              By proceeding with payment, you agree to our Terms of Service and acknowledge that membership fees are non-refundable.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}