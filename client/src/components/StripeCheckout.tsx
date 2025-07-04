import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface StripeCheckoutProps {
  clientSecret: string;
  amount: number;
  paymentType: string;
  userId: number;
  promoCode?: string;
  discount?: number;
  onSuccess: () => void;
}

export default function StripeCheckout({
  clientSecret,
  amount,
  paymentType,
  userId,
  promoCode,
  discount,
  onSuccess
}: StripeCheckoutProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
      setIsProcessing(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      try {
        // Verify payment and activate membership
        await apiRequest("PATCH", "/api/users/membership", {
          userId,
          membershipStatus: paymentType === "full" ? "active" : "installment_1",
          promoCode: promoCode || undefined,
          discount: discount || 0,
          stripePaymentIntentId: paymentIntent.id
        });

        toast({
          title: "Payment Successful!",
          description: "Your membership has been activated",
        });

        onSuccess();
      } catch (error: any) {
        toast({
          title: "Payment Error",
          description: error.message || "Failed to activate membership",
          variant: "destructive",
        });
      } finally {
        setIsProcessing(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 border rounded-lg bg-muted/30">
        <h3 className="font-semibold mb-2">Payment Details</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Amount: ${amount.toFixed(2)} USD
        </p>
        <PaymentElement />
      </div>
      
      <Button 
        type="submit" 
        disabled={!stripe || isProcessing}
        className="w-full"
        size="lg"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing Payment...
          </>
        ) : (
          `Pay $${amount.toFixed(2)} Now`
        )}
      </Button>
      
      <p className="text-xs text-center text-muted-foreground">
        Your payment is secured by Stripe. We do not store your card information.
      </p>
    </form>
  );
}