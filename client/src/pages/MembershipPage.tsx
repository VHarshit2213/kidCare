import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Tag, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import PaymentDialog from "@/components/PaymentDialog";
import supabase from "@/config/supabaseClient";

const BLACK_FRIDAY_PROMO_CODE = "BLKFDEAL25";
const BLACK_FRIDAY_DISCOUNT = 75;
const BLACK_FRIDAY_PROMO_START = Date.UTC(2025, 10, 28, 8, 0, 0); // Nov 28, 2025 12:00 AM PST
const BLACK_FRIDAY_PROMO_END = Date.UTC(2025, 10, 29, 21, 0, 0); // Nov 29, 2025 1:00 PM PST
const FULL_MEMBERSHIP_AMOUNT = 800;
const INSTALLMENT_PAYMENT_AMOUNT = FULL_MEMBERSHIP_AMOUNT / 2;

export default function MembershipPage() {
  console.log("MembershipPage: Component rendered");
  const [_, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [activating, setActivating] = useState(false);
  const [paymentType, setPaymentType] = useState<"full" | "installment">(
    "full",
  );
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [applyingPromo, setApplyingPromo] = useState(false);
  const [paymentDialog, setPaymentDialog] = useState<{
    isOpen: boolean;
    clientSecret: string;
    amount: number;
  }>({
    isOpen: false,
    clientSecret: "",
    amount: 0,
  });

  const isPaymentSuccess = user?.user_metadata?.isPayment;
  const hasCompletedProfile = user?.user_metadata?.profileCompleted;
  const baseUrl = window.location.origin;
  const selectedPaymentAmount =
    paymentType === "full"
      ? FULL_MEMBERSHIP_AMOUNT
      : INSTALLMENT_PAYMENT_AMOUNT;

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
      // Verify the promo code (simplified for demo)
      const code = promoCode.trim().toUpperCase();

      // Simulate API validation with a small delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (code === BLACK_FRIDAY_PROMO_CODE) {
        const nowUtc = Date.now();

        if (nowUtc < BLACK_FRIDAY_PROMO_START) {
          setPromoApplied(false);
          setDiscount(0);
          toast({
            title: "Promo Not Active Yet",
            description:
              "This Black Friday deal starts on November 28, 2025 (PST). Please try again then.",
            variant: "destructive",
          });
          return;
        }

        if (nowUtc > BLACK_FRIDAY_PROMO_END) {
          setPromoApplied(false);
          setDiscount(0);
          toast({
            title: "Promo Code Expired",
            description:
              "This Black Friday deal ended on November 29, 2025 at 1:00 PM PST.",
            variant: "destructive",
          });
          return;
        }

        setDiscount(BLACK_FRIDAY_DISCOUNT);
        setPromoApplied(true);
        toast({
          title: "Promo Code Applied!",
          description: "Black Friday deal unlocked 75% off your membership!",
        });
      } else if (code === "FAMILY24") {
        setDiscount(100);
        setPromoApplied(true);
        toast({
          title: "Promo Code Applied!",
          description:
            "You received a 100% discount - Your membership is FREE!",
        });
      } else if (code === "ECO125") {
        setDiscount(80);
        setPromoApplied(true);
        toast({
          title: "Promo Code Applied!",
          description: "You received 99% off your membership!",
        });
      } else if (code === "LACO1") {
        setDiscount(25);
        setPromoApplied(true);
        toast({
          title: "Promo Code Applied!",
          description: "You received 25% off your membership!",
        });
      } else {
        setPromoApplied(false);
        setDiscount(0);
        toast({
          title: "Invalid Promo Code",
          description: "This promo code is invalid or expired",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.message || "An error occurred applying the promo code",
        variant: "destructive",
      });
    } finally {
      setApplyingPromo(false);
    }
  };

  const activateMembership = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "Please sign in to activate your membership",
        variant: "destructive",
      });
      return;
    }

    setActivating(true);
    try {
      // Calculate the final amount based on discounts
      const baseAmount =
        paymentType === "full"
          ? FULL_MEMBERSHIP_AMOUNT
          : INSTALLMENT_PAYMENT_AMOUNT;
      const finalAmount = promoApplied
        ? (baseAmount * (100 - discount)) / 100
        : baseAmount;

      // If not free, require payment regardless of promo code
      if (finalAmount > 0) {
        toast({
          title: "Payment Required",
          description: `Please complete payment of $${finalAmount.toFixed(2)} to activate your membership`,
          variant: "destructive",
        });
        setActivating(false);
        return;
      }

      // Show immediate feedback to user first
      toast({
        title: "Activating membership...",
        description: "Please wait a moment while we process your request",
      });

      // Proceed to membership activation using a more efficient approach
      try {
        const response = await apiRequest("PATCH", "/api/users/membership", {
          userId: user.id,
          membershipStatus: paymentType === "full" ? "active" : "installment_1",
          promoCode: promoApplied ? promoCode : undefined,
          discount: promoApplied ? discount : 0,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to activate membership");
        }

        await supabase.auth.updateUser({
          data: {
            isPayment: true,
          },
        });

        // Update the client-side user data immediately to reflect changes
        queryClient.invalidateQueries({ queryKey: ["/api/user"] });

        // Success message
        toast({
          title: "Membership Activated!",
          description: promoApplied
            ? "Your membership has been activated for FREE. Welcome to The Enchanted Co.!"
            : "Your membership has been activated. Welcome to The Enchanted Co.!",
        });

        // Redirect to home page right away without waiting
        // window.location.href = "/";
        window.location.href = `${baseUrl}/profile-completion`;
        return;
      } catch (error) {
        // Error already handled in catch block below, this just prevents proceeding on error
        throw error;
      }
    } catch (error: any) {
      console.error("MembershipPage: Error activating membership", error);
      toast({
        title: "Membership Activation Failed",
        description:
          error.message || "An error occurred activating your membership",
        variant: "destructive",
      });
    } finally {
      setActivating(false);
    }
  };

  // ----------------- new code ------------

  if (isPaymentSuccess && !hasCompletedProfile) {
    navigate("/profile-completion");
  }

  // ----------------- new code ------------

  return (
    <>
        <div className="container w-[95%] max-w-3xl py-10 px-2 md:px-1 mx-auto">
          <Card className="border-2">
            <CardHeader className="text-center">
              <CardTitle>
                Membership Registration
              </CardTitle>
              <CardDescription>
                Join our community of parents and get access to premium
                babysitting services
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Payment options */}
              <div className="space-y-4">
                <h3 className="font-medium">Select Payment Option</h3>
                <RadioGroup
                  defaultValue="full"
                  value={paymentType}
                  onValueChange={(v) =>
                    setPaymentType(v as "full" | "installment")
                  }
                >
                  <div className="flex items-center space-x-2 border rounded-lg p-4 hover:border-brand-blue">
                    <RadioGroupItem value="full" id="full-payment" />
                    <div>
                      <Label
                        htmlFor="full-payment"
                        className="text-base"
                      >
                        One-time Payment
                      </Label>
                      <p className="text-sm text-gray-500">
                        {`Pay the full membership fee of $${FULL_MEMBERSHIP_AMOUNT} at once and get immediate access to all our services.`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 border rounded-lg p-4 hover:border-brand-blue">
                    <RadioGroupItem
                      value="installment"
                      id="installment-payment"
                    />
                    <div>
                      <Label
                        htmlFor="installment-payment"
                        className="text-base"
                      >
                        Installment Plan
                      </Label>
                      <p className="text-sm text-gray-500">
                        {`Pay $${INSTALLMENT_PAYMENT_AMOUNT} now and $${INSTALLMENT_PAYMENT_AMOUNT} in 30 days. You'll get immediate access to our services.`}
                      </p>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              {/* Promo code section */}
              <div className="border rounded-lg p-4">
                <h3 className="text-md font-medium flex items-center gap-2 mb-1">
                  <Tag className="h-4 w-4" />
                  Promo Code
                </h3>
                <p className="text-xs text-muted-foreground mb-3">
                  Have a special promotional code? Enter it here for a discount.
                </p>

                {promoApplied ? (
                  <div className="bg-green-50 text-green-800 rounded-md px-3 py-2 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="text-sm font-medium">
                          {promoCode.toUpperCase()}
                        </p>
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
                      placeholder="Enter your promo code"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="flex-1"
                      disabled={applyingPromo}
                    />
                    <Button
                      onClick={handleApplyPromoCode}
                      disabled={applyingPromo || !promoCode.trim()}
                    >
                      {applyingPromo ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Apply"
                      )}
                    </Button>
                  </div>
                )}
              </div>

              {/* Summary of charges */}
              <div className="bg-muted rounded-lg p-4">
                <h3 className="font-medium mb-2">Payment Summary</h3>
                {promoApplied ? (
                  <div className="flex flex-col space-y-2">
                    <div className="flex justify-between">
                      <span>Membership Fee:</span>
                      <span className="line-through text-muted-foreground">
                        ${selectedPaymentAmount}
                      </span>
                    </div>
                    <div className="flex justify-between text-green-600">
                      <span>Discount ({discount}%):</span>
                      <span>
                        -$
                        {(
                          (selectedPaymentAmount * discount) /
                          100
                        ).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between font-bold border-t pt-2 mt-2">
                      <span>Total Due Now:</span>
                      <span>
                        $
                        {(
                          (selectedPaymentAmount * (100 - discount)) /
                          100
                        ).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-2">
                    <div className="flex justify-between">
                      <span>Membership Fee:</span>
                      <span>${selectedPaymentAmount}</span>
                    </div>
                    <div className="flex justify-between font-bold border-t pt-2 mt-2">
                      <span>Total Due Now:</span>
                      <span>${selectedPaymentAmount}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Membership benefits */}
              <div className="rounded-lg border p-4">
                <h3 className="font-medium mb-2">Membership Benefits</h3>
                <ul className="text-sm space-y-1">
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span> Access to verified
                    babysitters
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span> Instant care
                    service
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span> Schedule up to 7
                    days in advance
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span> Priority booking
                    with popular sitters
                  </li>
                </ul>
              </div>

              {/* Action button */}
              {promoApplied && discount === 100 ? (
                <Button
                  onClick={activateMembership}
                  className="w-full"
                  size="lg"
                  disabled={activating}
                >
                  {activating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Activating...
                    </>
                  ) : (
                    "Activate Free Membership"
                  )}
                </Button>
              ) : (
                <Button
                  onClick={async () => {
                    if (!user) {
                      toast({
                        title: "Error",
                        description: "Please sign in to proceed with payment",
                        variant: "destructive",
                      });
                      return;
                    }

                    setActivating(true);
                    try {
                      const baseAmount =
                        paymentType === "full"
                          ? FULL_MEMBERSHIP_AMOUNT
                          : INSTALLMENT_PAYMENT_AMOUNT;
                      const finalAmount = promoApplied
                        ? (baseAmount * (100 - discount)) / 100
                        : baseAmount;

                      // Create payment intent
                      const response = await apiRequest(
                        "POST",
                        "/api/create-membership-intent",
                        {
                          paymentType,
                          userId: user.id,
                          promoCode: promoApplied ? promoCode : undefined,
                          discount: promoApplied ? discount : 0,
                        },
                      );

                      const data = await response.json();

                      // Open the real Stripe payment dialog
                      setPaymentDialog({
                        isOpen: true,
                        clientSecret: data.clientSecret,
                        amount: finalAmount,
                      });
                    } catch (error: any) {
                      toast({
                        title: "Payment Error",
                        description:
                          error.message || "Failed to initiate payment",
                        variant: "destructive",
                      });
                    } finally {
                      setActivating(false);
                    }
                  }}
                  className="w-full"
                  size="lg"
                  disabled={activating}
                >
                  {activating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading Payment...
                    </>
                  ) : (
                    `Pay $${promoApplied ? ((selectedPaymentAmount * (100 - discount)) / 100).toFixed(2) : selectedPaymentAmount} Now`
                  )}
                </Button>
              )}

              <p className="text-xs text-center text-muted-foreground">
                By activating, you agree to our Terms of Service and Privacy
                Policy
              </p>
            </CardContent>
          </Card>
        </div>

      {/* Payment Dialog */}
      <PaymentDialog
        isOpen={paymentDialog.isOpen}
        onClose={() => setPaymentDialog({ ...paymentDialog, isOpen: false })}
        clientSecret={paymentDialog.clientSecret}
        amount={paymentDialog.amount}
        paymentType={paymentType}
        userId={user?.id || 0}
        promoCode={promoApplied ? promoCode : undefined}
        discount={promoApplied ? discount : undefined}
        onSuccess={async () => {
          // await supabase.auth.updateUser({
          //   data: {
          //     isPayment: true,
          //   },
          // });
          toast({
            title: "Payment Successful!",
            description: "Your membership has been activated.",
          });
          navigate("/profile-completion");
        }}
      />
    </>
  );
}
