import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import ParentProfileForm from "@/components/ParentProfileForm";
import BabysitterProfileForm from "@/components/BabysitterProfileForm";

export default function ProfileCompletion() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  const userData = JSON.parse(localStorage.getItem("userData") || "");

  // Redirect to home if profile is already completed
  useEffect(() => {
    if (!isLoading && user && user.profileCompleted) {
      setLocation("/");
    }
  }, [user, isLoading, setLocation]);

  // Redirect to auth page if not logged in
  useEffect(() => {
    if (!isLoading && !userData) {
      setLocation("/auth");
    }
  }, [isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || user.profileCompleted) {
    // If this component doesn't meet the criteria to be shown, render an empty div instead of null
    // This prevents type errors with the ProtectedRoute component
    return <div></div>;
  }

  return (
    <div className="container py-10 px-4 md:px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-2">
          Complete Your Profile
        </h1>
        <p className="text-center text-muted-foreground mb-8">
          {user.userType === "parent"
            ? "Help us personalize your experience by providing more information about you and your family."
            : "Share your experience and caregiving style to help parents find the perfect match for their family."}
        </p>

        {user?.user_metadata?.userType === "parent" ? (
          <ParentProfileForm />
        ) : (
          <BabysitterProfileForm />
        )}
      </div>
    </div>
  );
}
