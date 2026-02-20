import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import Layout from "@/components/Layout";
import { BadgeProvider } from "@/contexts/badge-context";
import BadgeCounts from "@/components/BadgeCounts";

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
import Reviews from "./pages/Reviews";
import BookingNotification from "@/pages/BookingNotification";
import PlayAndGreet from "./pages/PlayAndGreet";

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
          <BadgeProvider>
            <BadgeCounts />
            <Switch>
              <Route path="/auth" component={AuthPage} />
              <Route path="/reset-password" component={ResetPasswordPage} />
              <Route path="/profile-completion" component={ProfileCompletion} />
              <Route path="/admin" component={AdminPage} />
              <Route path="/resume-onboarding" component={ResumeOnboarding} />

              {/* Layout Routes */}
              <Route>
                <Layout>
                  <Switch>
                    <Route path="/" component={Home} />
                    <ProtectedRoute path="/bookings" component={MyBookings} />
                    <ProtectedRoute path="/messages" component={Messages} />
                    <ProtectedRoute path="/reviews" component={Reviews} />
                    <ProtectedRoute path="/booking-notification" component={BookingNotification} />
                    <ProtectedRoute path="/play-and-greet" component={PlayAndGreet} />
                    <ProtectedRoute path="/profile" component={Profile} />
                    <ProtectedRoute path="/sitter/:id" component={SitterProfile} />
                    <Route path="/membership" component={MembershipPage} />
                    <Route
                      path="/membership-success"
                      component={() => <EnsureRender Component={MembershipSuccess} />}
                    />
                    <Route component={NotFound} />
                  </Switch>
                </Layout>
              </Route>
            </Switch>
            <Toaster />
          </BadgeProvider>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;
