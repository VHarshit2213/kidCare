import React, { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Tag, Check } from "lucide-react";
import Layout from "@/components/Layout";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export default function MembershipPage() {
  console.log("MembershipPage: Component rendered");
  const [_, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [activating, setActivating] = useState(false);
  const [paymentType, setPaymentType] = useState<"full" | "installment">("full");
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [applyingPromo, setApplyingPromo] = useState(false);
  
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
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (code === "FAMILY24") {
        setDiscount(100);
        setPromoApplied(true);
        toast({
          title: "Promo Code Applied!",
          description: "You received a 100% discount - Your membership is FREE!",
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
      const finalAmount = promoApplied && discount === 100 ? 0 : 
                         paymentType === "full" ? 500 : 250;
                         
      // If not free, we would normally redirect to payment
      if (finalAmount > 0 && !promoApplied) {
        toast({
          title: "Payment Required",
          description: "Please enter a valid promo code or complete payment to activate your membership",
          variant: "destructive",
        });
        setActivating(false);
        return;
      }
      
      // Proceed to membership activation
      const response = await apiRequest("PATCH", "/api/users/membership", {
        userId: user.id,
        membershipStatus: paymentType === "full" ? "active" : "installment_1",
        promoCode: promoApplied ? promoCode : undefined,
        discount: promoApplied ? discount : 0
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to activate membership");
      }
      
      toast({
        title: "Membership Activated!",
        description: promoApplied 
          ? "Your membership has been activated for FREE. Welcome to The Enchanted Co.!"
          : "Your membership has been activated. Welcome to The Enchanted Co.!",
      });
      
      // Redirect to success page
      navigate("/membership-success");
      return;
    } catch (error: any) {
      console.error("MembershipPage: Error activating membership", error);
      toast({
        title: "Membership Activation Failed",
        description: error.message || "An error occurred activating your membership",
        variant: "destructive",
      });
    } finally {
      setActivating(false);
    }
  };

  return (
    <Layout>
      <div className="container max-w-6xl py-10 mx-auto">
        <div className="max-w-3xl mx-auto">
          <Card className="border-2">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Membership Registration</CardTitle>
              <CardDescription>
                Join our community of parents and get access to premium babysitting services
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Payment options */}
              <div className="space-y-4">
                <h3 className="font-medium">Select Payment Option</h3>
                <RadioGroup defaultValue="full" value={paymentType} onValueChange={(v) => setPaymentType(v as "full" | "installment")}>
                  <div className="flex items-start space-x-2 border rounded-lg p-4 hover:border-brand-blue">
                    <RadioGroupItem value="full" id="full-payment" />
                    <div>
                      <Label htmlFor="full-payment" className="text-base font-medium">One-time Payment</Label>
                      <p className="text-sm text-gray-500">
                        Pay the full membership fee of $500 at once and get immediate access to all our services.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2 border rounded-lg p-4 hover:border-brand-blue">
                    <RadioGroupItem value="installment" id="installment-payment" />
                    <div>
                      <Label htmlFor="installment-payment" className="text-base font-medium">Installment Plan</Label>
                      <p className="text-sm text-gray-500">
                        Pay $250 now and $250 in 30 days. You'll get immediate access to our services.
                      </p>
                    </div>
                  </div>
                </RadioGroup>
              </div>
              
              {/* Promo code section */}
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
                      placeholder="Enter promo code (try FAMILY24)" 
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
              
              {/* Summary of charges */}
              <div className="bg-muted rounded-lg p-4">
                <h3 className="font-medium mb-2">Payment Summary</h3>
                {promoApplied ? (
                  <div className="flex flex-col space-y-2">
                    <div className="flex justify-between">
                      <span>Membership Fee:</span>
                      <span className="line-through text-muted-foreground">
                        ${paymentType === "full" ? 500 : 250}
                      </span>
                    </div>
                    <div className="flex justify-between text-green-600">
                      <span>Discount ({discount}%):</span>
                      <span>-${paymentType === "full" ? 500 : 250}</span>
                    </div>
                    <div className="flex justify-between font-bold border-t pt-2 mt-2">
                      <span>Total Due Now:</span>
                      <span>$0</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-2">
                    <div className="flex justify-between">
                      <span>Membership Fee:</span>
                      <span>${paymentType === "full" ? 500 : 250}</span>
                    </div>
                    <div className="flex justify-between font-bold border-t pt-2 mt-2">
                      <span>Total Due Now:</span>
                      <span>${paymentType === "full" ? 500 : 250}</span>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Membership benefits */}
              <div className="rounded-lg border p-4">
                <h3 className="font-medium mb-2">Membership Benefits</h3>
                <ul className="text-sm space-y-1">
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span> Access to verified babysitters
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span> Instant care service
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span> Schedule up to 7 days in advance
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span> Priority booking with popular sitters
                  </li>
                </ul>
              </div>
              
              {/* Action button */}
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
                  promoApplied ? "Activate Free Membership" : "Complete Membership Registration"
                )}
              </Button>
              
              <p className="text-xs text-center text-muted-foreground">
                By activating, you agree to our Terms of Service and Privacy Policy
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}