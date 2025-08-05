import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";

// Pages
import Home from "@/pages/Home";
import MyBookings from "@/pages/MyBookings";
import Messages from "@/pages/Messages";
import Profile from "@/pages/Profile";
import SitterProfile from "@/pages/SitterProfile";
import NotFound from "@/pages/NotFound";
import AuthPage from "@/pages/auth-page";
import ProfileCompletion from "@/pages/ProfileCompletion";
import AdminPage from "@/pages/AdminPage";
import MembershipPage from "@/pages/MembershipPage";
import MembershipSuccess from "@/pages/MembershipSuccess";
import ResetPasswordPage from "@/pages/ResetPasswordPage";
import { BrowserRouter } from "react-router-dom";
import ResumeOnboarding from "@/components/ResumeOnboarding";

// Wrapper to ensure components never return null
const EnsureRender = ({ Component }: { Component: () => React.ReactNode }) => {
  const content = Component();
  // This ensures we always return a valid React Element, never null
  return <>{content || <div></div>}</>;
};

function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/auth" component={AuthPage} />
            <Route path="/reset-password" component={ResetPasswordPage} />
            {/* <ProtectedRoute
              path="/profile-completion"
              component={ProfileCompletion}
            /> */}
            <Route path="/profile-completion" component={ProfileCompletion} />
            <ProtectedRoute path="/bookings" component={MyBookings} />
            <ProtectedRoute path="/messages" component={Messages} />
            <ProtectedRoute path="/profile" component={Profile} />
            <ProtectedRoute path="/sitter/:id" component={SitterProfile} />
            <Route path="/admin" component={AdminPage} />
            <Route path="/membership" component={MembershipPage} />
            <Route path="/resume-onboarding" component={ResumeOnboarding} />
            {/* <ProtectedRoute
              path="/membership-success"
              component={() => <EnsureRender Component={MembershipSuccess} />}
            /> */}
            <Route
              path="/membership-success"
              component={() => <EnsureRender Component={MembershipSuccess} />}
            />
            <Route component={NotFound} />
          </Switch>
          <Toaster />
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;
