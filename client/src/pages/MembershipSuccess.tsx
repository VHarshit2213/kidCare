import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
    const status = user.membershipStatus || "none";
    if (
      status !== "active" &&
      status !== "installment_1" &&
      status !== "installment_2"
    ) {
      navigate("/membership");
      return;
    }

    // Automatically redirect to profile completion after a short delay
    // This ensures the user sees the success message before being redirected
    if (!user.profileCompleted) {
      // Make the delay longer so user can read the success message
      const timer = setTimeout(() => {
        navigate("/profile-completion");
      }, 5000); // Increased to 5 seconds

      return () => clearTimeout(timer);
    }
  }, [user, navigate]);

  if (!user) return null;

  const status = user.membershipStatus || "none";
  const isInstallment =
    status === "installment_1" || status === "installment_2";

  return (
    <>
      <div className="container max-w-4xl py-20">
        <Card className="border-0 shadow-lg">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 bg-green-100 w-20 h-20 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <CardTitle className="text-3xl font-bold text-green-700">
              Payment Successful!
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center pb-6 px-8">
            <p className="text-lg mb-6">
              {isInstallment
                ? "Thank you for your first installment payment of $250. Your membership is now active!"
                : "Thank you for your payment of $500. Your membership is now active!"}
            </p>

            {!user.profileCompleted && (
              <div className="bg-blue-50 border border-blue-100 p-5 rounded-lg mb-6">
                <h3 className="text-xl font-semibold text-blue-800 mb-2">
                  Next Step: Complete Your Profile
                </h3>
                <p className="mb-2">
                  We'll automatically redirect you to complete your parent
                  profile in a few seconds.
                </p>
                <div className="w-full bg-blue-100 rounded-full h-2.5 my-3">
                  <div className="bg-blue-500 h-2.5 rounded-full animate-[progress_5s_ease-in-out]"></div>
                </div>
              </div>
            )}

            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="text-xl font-semibold mb-4">What's Next?</h3>
              <ul className="text-left space-y-3">
                <li className="flex items-start">
                  <span>
                    Complete your <strong>parent profile</strong> with
                    information about your family and children
                  </span>
                  <span className="inline-flex items-center justify-center rounded-full bg-green-100 p-1 ml-3 text-lg">
                    📝
                  </span>
                </li>
                <li className="flex items-start">
                  <span>
                    Browse our <strong>verified babysitters</strong> to find the
                    perfect match for your family
                  </span>
                  <span className="inline-flex items-center justify-center rounded-full bg-green-100 p-1 ml-3 text-lg">
                    👨‍👩‍👧‍👦
                  </span>
                </li>
                <li className="flex items-start">
                  <span>
                    Request babysitting services using our{" "}
                    <strong>instant care</strong> or{" "}
                    <strong>scheduled care</strong> options
                  </span>
                  <span className="inline-flex items-center justify-center rounded-full bg-green-100 p-1 ml-3 text-lg">
                    🚀
                  </span>
                </li>
              </ul>
            </div>

            {isInstallment && (
              <div className="border border-amber-200 bg-amber-50 p-4 rounded-lg text-amber-800 mb-6">
                <h4 className="font-semibold">
                  Reminder about your installment plan:
                </h4>
                <p>
                  Your second payment of $200 will be automatically processed in
                  30 days. Please ensure your payment method remains valid.
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-center gap-4 pt-2 pb-8">
            <Button onClick={() => navigate("/profile-completion")} size="lg">
              Complete Your Profile
            </Button>
            <Button variant="outline" onClick={() => navigate("/")} size="lg">
              Go to Homepage
            </Button>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
