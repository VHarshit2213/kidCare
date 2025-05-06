import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Layout from "@/components/Layout";
import { CheckCircle2 } from "lucide-react";

export default function MembershipSuccess() {
  const [_, navigate] = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    // If user is not logged in, redirect to login
    if (!user) {
      navigate("/auth");
      return;
    }
    
    // If user is a babysitter, redirect to profile completion
    if (user.userType !== "parent") {
      navigate("/profile-completion");
      return;
    }
    
    // If user doesn't have active membership, redirect to membership page
    const status = user.membershipStatus || 'none';
    if (status !== "active" && 
        status !== "installment_1" && 
        status !== "installment_2") {
      navigate("/membership");
    }
  }, [user, navigate]);

  if (!user) return null;

  const status = user.membershipStatus || 'none';
  const isInstallment = status === "installment_1" || status === "installment_2";

  return (
    <Layout>
      <div className="container max-w-4xl py-20">
        <Card className="border-0 shadow-lg">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 bg-green-100 w-20 h-20 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <CardTitle className="text-3xl font-bold text-green-700">Payment Successful!</CardTitle>
          </CardHeader>
          <CardContent className="text-center pb-6 px-8">
            <p className="text-lg mb-6">
              {isInstallment 
                ? "Thank you for your first installment payment of $250. Your membership is now active!" 
                : "Thank you for your payment of $500. Your membership is now active!"}
            </p>
            
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="text-xl font-semibold mb-4">What's Next?</h3>
              <ul className="text-left space-y-3">
                <li className="flex items-start">
                  <span className="inline-flex items-center justify-center rounded-full bg-green-100 p-1 mr-3 mt-1 text-lg">
                    📝
                  </span>
                  <span>Complete your <strong>parent profile</strong> with information about your family and children</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-flex items-center justify-center rounded-full bg-green-100 p-1 mr-3 mt-1 text-lg">
                    👨‍👩‍👧‍👦
                  </span>
                  <span>Browse our <strong>verified babysitters</strong> to find the perfect match for your family</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-flex items-center justify-center rounded-full bg-green-100 p-1 mr-3 mt-1 text-lg">
                    🚀
                  </span>
                  <span>Request babysitting services using our <strong>instant care</strong> or <strong>scheduled care</strong> options</span>
                </li>
              </ul>
            </div>
            
            {isInstallment && (
              <div className="border border-amber-200 bg-amber-50 p-4 rounded-lg text-amber-800 mb-6">
                <h4 className="font-semibold">Reminder about your installment plan:</h4>
                <p>Your second payment of $250 will be automatically processed in 30 days. Please ensure your payment method remains valid.</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-center gap-4 pt-2 pb-8">
            <Button 
              onClick={() => navigate("/profile-completion")}
              size="lg"
            >
              Complete Your Profile
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate("/")}
              size="lg"
            >
              Go to Homepage
            </Button>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
}