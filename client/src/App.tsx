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

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/auth" component={AuthPage} />
          <ProtectedRoute path="/profile-completion" component={ProfileCompletion} />
          <ProtectedRoute path="/bookings" component={MyBookings} />
          <ProtectedRoute path="/messages" component={Messages} />
          <ProtectedRoute path="/profile" component={Profile} />
          <ProtectedRoute path="/sitter/:id" component={SitterProfile} />
          <Route component={NotFound} />
        </Switch>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
