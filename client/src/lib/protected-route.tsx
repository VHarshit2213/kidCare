import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route, useLocation } from "wouter";

export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  const { user, isLoading } = useAuth();
  const [location] = useLocation();

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

  // For the admin user, always allow access to the admin page regardless of profile completion
  if (user.username === "admin" && path === "/admin") {
    return <Route path={path}>{() => <Component />}</Route>;
  }

  // If the user's profile is not complete and they're not trying to complete it
  // and they're not the admin trying to access the admin page, redirect them
  if (!user.profileCompleted && 
      path !== "/profile-completion" && 
      !(user.username === "admin" && path === "/admin")) {
    return (
      <Route path={path}>
        <Redirect to="/profile-completion" />
      </Route>
    );
  }

  // Wrap the component in a function that always returns an Element
  return <Route path={path}>{() => <Component />}</Route>;
}