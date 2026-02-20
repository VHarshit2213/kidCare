import {
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface BabysitterStripeCheckoutProps {
  clientSecret: string;
  amount?: number;
  onSuccess: () => void;
  onClose: () => void;
  bookingType?: string;
  paymentType: "booking" | "playAndGreet";
  bookedSitter?: any;
  bookingDetails?: any;
  requestId?: string;
}

export const BabysitterStripeCheckout: React.FC<
  BabysitterStripeCheckoutProps
> = ({
  clientSecret,
  amount,
  onSuccess,
  onClose,
  bookingType,
  paymentType,
  bookedSitter,
  bookingDetails,
  requestId,
}) => {
    const stripe = useStripe();
    const elements = useElements();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const parentData = JSON.parse(
      localStorage.getItem("sb-pkmghxgahplhoyxglryf-auth-token") || "{}"
    );
    const parentId = parentData.user?.id;
    const parentName = parentData.user?.user_metadata?.fullName;

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!stripe || !elements) return;

      setLoading(true);

      try {
        // Confirm Stripe Payment
        const { error, paymentIntent } = await stripe.confirmPayment({
          elements,
          confirmParams: {
            // optional: add return_url if using redirects
          },
          redirect: "if_required", // prevent full page redirect
        });

        if (error) {
          toast({
            title: "Payment Failed",
            description: error.message,
            variant: "destructive",
          });
          return;
        }

        if (!paymentIntent?.id) {
          toast({
            title: "Payment Error",
            description: "Missing payment confirmation.",
            variant: "destructive",
          });
          return;
        }

        if (paymentType === "booking") {
          if (!bookedSitter || !bookingDetails) throw new Error("Missing booking data");

          const res = await apiRequest("POST", "/api/create-booking", {
            bookingType,
            bookedSitter,
            bookingDetails,
            parentName,
            parentId,
            paymentIntentId: paymentIntent.id,
          });

          const { booking } = await res.json();

          await apiRequest("POST", `/api/send-confirmation-sms`, {
            bookingId: booking.id,
            bookingType,
          });

          toast({
            title: "Payment Successful",
            description: "Your babysitter has been successfully booked!",
          });
        } else if (paymentType === "playAndGreet") {
          if (!requestId) throw new Error("Missing requestId for Play & Greet");

          const res = await apiRequest("POST", "/api/play-greet/complete-payment", {
            requestId,
            paymentIntentId: paymentIntent.id,
          });

          await res.json();

          toast({
            title: "Payment Successful",
            description: "Your Play & Greet session has been confirmed!",
          });
        }

        onSuccess();
      } catch (err: any) {
        toast({
          title: "Error",
          description: err.message || "Something went wrong",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm flex items-center justify-center">
        <div className="p-4 xs:p-6 sm:max-w-xl w-[95%] mx-auto bg-white rounded-2xl shadow-lg max-h-[90vh] overflow-y-auto">
          <h2 className="text-xl font-semibold mb-4">Pay for Babysitter</h2>
          {amount && (
            <p className="text-sm text-gray-500 mb-2">
              Total: ${amount.toFixed(2)}
            </p>
          )}
          <form onSubmit={handleSubmit}>
            <PaymentElement />
            <div className="flex justify-between mt-6">
              <Button
                type="submit"
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={!stripe || loading}>
                {loading ? (
                  <>
                    <Loader2 className="animate-spin w-4 h-4 mr-2" />
                    Processing Payment...
                  </>
                ) : (
                  `Pay $${amount?.toFixed(2)} Now`
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  };
