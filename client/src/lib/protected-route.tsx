import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route, useLocation } from "wouter";
import { useEffect } from "react";

// Helper component to handle navigation after render
function RedirectComponent({ to }: { to: string }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = to;
    }, 500);
    
    return () => clearTimeout(timer);
  }, [to]);
  
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
  
  // console.log(`ProtectedRoute (${path}): User:`, user ? {
  //   id: user.id,
  //   username: user.username,
  //   userType: user.userType,
  //   membershipStatus: user.membershipStatus,
  //   profileCompleted: user.profileCompleted
  // } : "not authenticated");
  
  // console.log(`ProtectedRoute (${path}): Current location is ${location}`);

  // if (isLoading) {
  //   return (
  //     <Route path={path}>
  //       <div className="flex items-center justify-center min-h-screen">
  //         <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
  //       </div>
  //     </Route>
  //   );
  // }

  // if (!user) {
  //   return (
  //     // <Route path={path}>
  //     //   <Redirect to="/auth" />
  //     // </Route>
  //     <></>
  //   );
  // }

  // // Admin is exempt from profile completion check for all pages
  // if (user.username === "ecadmin") {
  //   return <Route path={path}>{() => <Component />}</Route>;
  // }

  // // For parent users, check if they need to complete membership first
  // if (user.userType === "parent" && 
  //     (user.membershipStatus === "none" || !user.membershipStatus) && 
  //     path !== "/membership" &&
  //     path !== "/membership-success") {
  //   console.log(`ProtectedRoute (${path}): Redirecting parent to membership page. Current membershipStatus: ${user.membershipStatus}`);
    
  //   // Handle the redirect in a simple way to avoid navigation issues
  //   return (
  //     <Route path={path}>
  //       <div className="container max-w-6xl py-10">
  //         <div className="flex items-center justify-center flex-col space-y-4">
  //           <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
  //           <p>Redirecting to membership page...</p>
  //           <RedirectComponent to="/membership" />
  //         </div>
  //       </div>
  //     </Route>
  //   );
  // }

  // // For all users, check if their profile is complete after membership (if applicable)
  // // Direct users to profile completion more broadly - not just from home page
  // // For parent users with active membership, ensure they complete their profile
  // if (!user.profileCompleted && 
  //     path !== "/profile-completion" && path !== "/membership-success" && 
  //     (user.userType === "babysitter" || 
  //      (user.userType === "parent" && 
  //       (user.membershipStatus === "active" || 
  //        user.membershipStatus === "installment_1" || 
  //        user.membershipStatus === "installment_2")))) {
  //   console.log(`ProtectedRoute (${path}): Redirecting to profile completion page from ${path}`);
  //   console.log(`User info - Type: ${user.userType}, Membership: ${user.membershipStatus}, Profile completed: ${user.profileCompleted}`);
  //   return (
  //     <Route path={path}>
  //       <div className="container max-w-6xl py-10">
  //         <div className="flex items-center justify-center flex-col space-y-4">
  //           <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
  //           <p>Redirecting to profile completion page...</p>
  //           <RedirectComponent to="/profile-completion" />
  //         </div>
  //       </div>
  //     </Route>
  //   );
  // }

  // Wrap the component in a function that always returns an Element
  return <Route path={path}>{() => <Component />}</Route>;
}