import React, { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import Layout from "@/components/Layout";
import { useToast } from "@/hooks/use-toast";

export default function MembershipPage() {
  console.log("MembershipPage: Component rendered");
  const [_, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [activating, setActivating] = useState(false);
  
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
      // Directly proceed to membership activation
      const response = await apiRequest("PATCH", "/api/users/membership", {
        userId: user.id,
        membershipStatus: "active",
        promoCode: "FAMILY24",
        discount: 100
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to activate membership");
      }
      
      toast({
        title: "Membership Activated!",
        description: "Your free membership has been activated. Welcome to The Enchanted Co.!",
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
        <div className="max-w-md mx-auto">
          <Card className="border-2">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Membership Activation</CardTitle>
              <CardDescription>
                Activate your membership to access premium babysitting services
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-muted rounded-lg p-4">
                <h3 className="font-medium mb-2">Special Offer</h3>
                <p className="text-sm mb-2">
                  Use promo code <span className="font-bold">FAMILY24</span> for a free membership!
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="line-through text-muted-foreground mr-2">$500</span>
                    <span className="text-lg font-bold">$0</span>
                  </div>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                    100% OFF
                  </span>
                </div>
              </div>
              
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