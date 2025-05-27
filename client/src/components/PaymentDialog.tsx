import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import StripeCheckout from './StripeCheckout';

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface PaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  clientSecret: string;
  amount: number;
  paymentType: string;
  userId: number;
  promoCode?: string;
  discount?: number;
  onSuccess: () => void;
}

export default function PaymentDialog({
  isOpen,
  onClose,
  clientSecret,
  amount,
  paymentType,
  userId,
  promoCode,
  discount,
  onSuccess
}: PaymentDialogProps) {
  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
    },
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Complete Your Payment</DialogTitle>
          <DialogDescription>
            Secure payment powered by Stripe. Your membership will be activated immediately after payment.
          </DialogDescription>
        </DialogHeader>
        
        <Elements stripe={stripePromise} options={options}>
          <StripeCheckout
            clientSecret={clientSecret}
            amount={amount}
            paymentType={paymentType}
            userId={userId}
            promoCode={promoCode}
            discount={discount}
            onSuccess={() => {
              onClose();
              onSuccess();
            }}
          />
        </Elements>
      </DialogContent>
    </Dialog>
  );
}