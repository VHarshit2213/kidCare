import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route, useLocation } from "wouter";
import { useEffect } from "react";

// Helper component to handle navigation after render
function RedirectEffect({ to }: { to: string }) {
  const [_, navigate] = useLocation();
  
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate(to);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [to, navigate]);
  
  return null;
}

export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  const { user, isLoading } = useAuth();
  const [location, navigate] = useLocation();
  
  console.log(`ProtectedRoute (${path}): User:`, user ? {
    id: user.id,
    username: user.username,
    userType: user.userType,
    membershipStatus: user.membershipStatus,
    profileCompleted: user.profileCompleted
  } : "not authenticated");
  
  console.log(`ProtectedRoute (${path}): Current location is ${location}`);

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
        </div>
      </Route>
    );
  }

  if (!user) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  // Admin is exempt from profile completion check for all pages
  if (user.username === "admin") {
    return <Route path={path}>{() => <Component />}</Route>;
  }

  // For parent users, check if they need to complete membership first
  if (user.userType === "parent" && 
      (user.membershipStatus === "none" || !user.membershipStatus) && 
      path !== "/membership" &&
      path !== "/membership-success") {
    console.log(`ProtectedRoute (${path}): Redirecting parent to membership page. Current membershipStatus: ${user.membershipStatus}`);
    
    // Handle the redirect in a simple way to avoid navigation issues
    return (
      <Route path={path}>
        <div className="container max-w-6xl py-10">
          <div className="flex items-center justify-center flex-col space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
            <p>Redirecting to membership page...</p>
            <RedirectEffect to="/membership" />
          </div>
        </div>
      </Route>
    );
  }

  // For all users, check if their profile is complete after membership (if applicable)
  if (!user.profileCompleted && path !== "/profile-completion") {
    console.log(`ProtectedRoute (${path}): Redirecting to profile completion page`);
    return (
      <Route path={path}>
        <Redirect to="/profile-completion" />
      </Route>
    );
  }

  // Wrap the component in a function that always returns an Element
  return <Route path={path}>{() => <Component />}</Route>;
}