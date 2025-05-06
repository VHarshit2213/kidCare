import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function MembershipSuccess() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [paymentType, setPaymentType] = useState<"full" | "installment" | null>(null);

  useEffect(() => {
    // Get URL parameters
    const query = new URLSearchParams(window.location.search);
    const paymentIntentId = query.get('payment_intent');
    const paymentIntentClientSecret = query.get('payment_intent_client_secret');

    const verifyPayment = async () => {
      if (!paymentIntentId || !paymentIntentClientSecret || !user) {
        setIsProcessing(false);
        setPaymentStatus("error");
        return;
      }

      try {
        const response = await apiRequest("POST", "/api/verify-membership-payment", {
          paymentIntentId,
          userId: user.id,
        });

        const data = await response.json();
        setPaymentStatus("success");
        setPaymentType(data.paymentType);

        // Update user's membership status
        await apiRequest("PATCH", "/api/users/membership", {
          userId: user.id,
          membershipStatus: data.paymentType === "full" ? "active" : "installment_1",
        });

        toast({
          title: "Payment Successful",
          description: "Your membership is now active!",
        });
      } catch (error) {
        setPaymentStatus("error");
        toast({
          title: "Payment Verification Failed",
          description: "There was an issue verifying your payment. Please contact support.",
          variant: "destructive",
        });
      } finally {
        setIsProcessing(false);
      }
    };

    verifyPayment();
  }, [user]);

  if (isProcessing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <Loader2 className="h-12 w-12 animate-spin text-[#3c5679] mb-4" />
        <h1 className="text-2xl font-semibold text-[#3c5679]">Verifying your payment...</h1>
        <p className="text-gray-600 mt-2">Please wait while we confirm your membership.</p>
      </div>
    );
  }

  if (paymentStatus === "error") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="bg-red-100 rounded-full p-3 mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-semibold text-gray-800">Payment Verification Failed</h1>
        <p className="text-gray-600 mt-2 text-center max-w-md">
          There was an issue verifying your payment. Please contact our support team for assistance.
        </p>
        <div className="mt-6 space-x-4">
          <Button
            onClick={() => navigate("/membership")}
            style={{ backgroundColor: "#3c5679" }}
          >
            Try Again
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/")}
          >
            Return Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="bg-green-100 rounded-full p-3 mb-4">
        <CheckCircle className="h-12 w-12 text-green-600" />
      </div>
      <h1 className="text-3xl font-bold text-[#3c5679]">Welcome to The Enchanted Co.!</h1>
      <p className="text-xl text-gray-700 mt-2">Your membership is now active.</p>
      
      <div className="max-w-md bg-white p-6 rounded-lg shadow-lg mt-8">
        <h2 className="text-xl font-semibold text-[#3c5679] mb-4">Membership Details</h2>
        {paymentType === "full" ? (
          <div className="space-y-2">
            <p className="text-gray-700">You've completed your full membership payment.</p>
            <div className="bg-blue-50 p-3 rounded">
              <p className="font-medium">$500 membership fee - Paid in full</p>
              <p className="text-sm text-gray-600">You now have complete access to all our childcare services.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-gray-700">You've completed your first installment payment.</p>
            <div className="bg-blue-50 p-3 rounded mb-3">
              <p className="font-medium">$250 First installment - Paid</p>
              <p className="text-sm text-gray-600">You now have access to our childcare services.</p>
            </div>
            <div className="bg-gray-100 p-3 rounded">
              <p className="font-medium">$250 Second installment - Due later</p>
              <p className="text-sm text-gray-600">We'll remind you when your next payment is due.</p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8">
        <Button
          onClick={() => navigate("/")}
          style={{ backgroundColor: "#3c5679" }}
          size="lg"
          className="px-6"
        >
          Start Using Your Membership
        </Button>
      </div>
    </div>
  );
}