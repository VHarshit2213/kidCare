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
  bookingType: string;
  bookedSitter: any;
  bookingDetails: any;
}

export const BabysitterStripeCheckout: React.FC<
  BabysitterStripeCheckoutProps
> = ({
  clientSecret,
  amount,
  onSuccess,
  onClose,
  bookingType,
  bookedSitter,
  bookingDetails,
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
    if (!stripe || !elements || !bookedSitter) return;

    setLoading(true);

    try {
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
      <div className="p-6 max-w-xl w-full mx-auto bg-white rounded-2xl shadow-lg max-h-[90vh] overflow-y-auto">
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
