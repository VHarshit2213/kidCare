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
  bookingId: string;
}

export const BabysitterStripeCheckout: React.FC<
  BabysitterStripeCheckoutProps
> = ({ clientSecret, amount, onSuccess, onClose, bookingType, bookingId }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // optional: add return_url if using redirects
      },
      redirect: "if_required", // prevent full page redirect
    });

    setLoading(false);

    if (result.error) {
      toast({
        title: "Payment Failed",
        description: result.error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Payment Successful",
        description: "Your babysitter has been successfully booked!",
      });
      
      await apiRequest("POST", `/api/send-confirmation-sms`, {
        bookingId,
        bookingType,
      });

      onSuccess();
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
