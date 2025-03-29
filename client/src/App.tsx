import { useState, createContext } from "react";
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { AppContextType, User } from "./lib/types";

// Pages
import Home from "@/pages/Home";
import MyBookings from "@/pages/MyBookings";
import Messages from "@/pages/Messages";
import Profile from "@/pages/Profile";
import SitterProfile from "@/pages/SitterProfile";
import NotFound from "@/pages/NotFound";

// Create context
export const AppContext = createContext<AppContextType>({
  currentUser: null,
  setCurrentUser: () => {},
  isAuthenticated: false,
});

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const isAuthenticated = !!currentUser;

  return (
    <QueryClientProvider client={queryClient}>
      <AppContext.Provider value={{ currentUser, setCurrentUser, isAuthenticated }}>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/bookings" component={MyBookings} />
          <Route path="/messages" component={Messages} />
          <Route path="/profile" component={Profile} />
          <Route path="/sitter/:id" component={SitterProfile} />
          <Route component={NotFound} />
        </Switch>
        <Toaster />
      </AppContext.Provider>
    </QueryClientProvider>
  );
}

export default App;
