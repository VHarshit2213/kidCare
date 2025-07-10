import { createContext, ReactNode, useContext, useState } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { User } from "@/lib/types";
import supabase from "../config/supabaseClient";
import { useNavigate } from "react-router-dom";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<User, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<User, Error, RegisterData>;
  loginLoading: boolean;
  registerLoading: boolean;
};

type LoginData = {
  username: string;
  password: string;
};

type RegisterData = {
  username: string;
  password: string;
  email: string;
  fullName: string;
  userType: "parent" | "babysitter";
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [user, setUser] = useState<User | any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const navigate = useNavigate();

  // ---------- old code for reference ------------
  // const {
  //   data: user,
  //   error,
  //   isLoading,
  // } = useQuery<User | null, Error>({
  //   queryKey: ["/api/user"],
  //   queryFn: async () => {
  //     try {
  //       const res = await fetch("/api/user");
  //       if (res.status === 401) {
  //         return null;
  //       }
  //       if (!res.ok) {
  //         throw new Error("Failed to fetch user");
  //       }
  //       return res.json();
  //     } catch (error) {
  //       return null;
  //     }
  //   },
  // });
  // ---------- old code for reference ------------

  // ---------- new code ------------
  const fetchUser = async (): Promise<void> => {
    setIsLoading(true);
    try {
      supabase.auth.onAuthStateChange((event, session) => {
        localStorage.setItem("userData", JSON.stringify(session));
        setUser(session?.user);
      });
    } catch (err: any) {
      console.error("Fetch user error:", err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };
  // ---------- new code ------------

  // ---------- old code for reference ------------
  // const loginMutation = useMutation<User, Error, LoginData>({
  //   mutationFn: async (credentials) => {
  //     const res = await apiRequest("POST", "/api/login", credentials);
  //     if (!res.ok) {
  //       const errorData = await res
  //         .json()
  //         .catch(() => ({ message: "Invalid credentials" }));
  //       throw new Error(errorData.message || "Login failed");
  //     }
  //     return res.json();
  //   },
  //   onSuccess: (data) => {
  //     queryClient.setQueryData(["/api/user"], data);
  //     toast({
  //       title: "Login successful",
  //       description: `Welcome back, ${data.fullName}!`,
  //     });
  //   },
  //   onError: (error) => {
  //     toast({
  //       title: "Login failed",
  //       description: error.message,
  //       variant: "destructive",
  //     });
  //   },
  // });
  // ---------- old code for reference ------------

  //----------- new code ------------
  const loginMutation = async (credentials: LoginData) => {
    setLoginLoading(true);
    setError(null);
    try {
      const { error, data } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      let response = data?.session?.user?.user_metadata;

      if (error || !response) {
        throw new Error(error?.message || "Invalid credentials");
      }

      setUser(response);
      toast({
        title: "Login successful",
        description: `Welcome back, ${response?.fullName}!`,
      });
    } catch (err: any) {
      setError(err);
      toast({
        title: "Login failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoginLoading(false);
    }
  };
  // ----------- new code ------------

  const registerMutation = useMutation<User, Error, RegisterData>({
    mutationFn: async (userData) => {
      const res = await apiRequest("POST", "/api/register", userData);
      if (!res.ok) {
        const errorData = await res
          .json()
          .catch(() => ({ message: "Registration failed" }));
        throw new Error(errorData.message || "Registration failed");
      }
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/user"], data);

      // If the user is a parent, redirect to membership page
      if (data.userType === "parent") {
        // Use window.location to force a full page reload and avoid React state issues
        window.location.href = "/membership";
      }

      // Simple success message
      toast({
        title: "Registration successful",
        description: `Welcome to The Enchanted Co., ${data.fullName}!`,
      });
    },
    onError: (error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation<void, Error, void>({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/logout");
      if (!res.ok) {
        throw new Error("Logout failed");
      }
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      toast({
        title: "Logged out successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
