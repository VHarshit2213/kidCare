import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
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
  // loginMutation: UseMutationResult<User, Error, LoginData>;
  loginMutation: (credentials: LoginData) => Promise<void>;
  // logoutMutation: UseMutationResult<void, Error, void>;
  logoutMutation: () => Promise<void>;
  // registerMutation: UseMutationResult<User, Error, RegisterData>;
  registerMutation: (userData: RegisterData) => Promise<void>;
  loginLoading: boolean;
  registerLoading: boolean;
  forgotLoading: boolean;
  resetLoading: boolean;
  forgetPassword: (email: string) => Promise<{ error: any }>;
  resetPassword: (newPassword: string) => Promise<{ error: any }>;
};

type LoginData = {
  // username: string;
  email: string;
  password: string;
};

type RegisterData = {
  // userName: string;
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
  const [forgotLoading, setForgotLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
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
  // const fetchUser = async (): Promise<void> => {
  //   setIsLoading(true);
  //   try {
  //     supabase.auth.onAuthStateChange((event, session) => {
  //       setUser(session?.user);
  //     });
  //   } catch (err: any) {
  //     console.error("Fetch user error:", err);
  //     setError(err);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const fetchUser = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) throw error;

      setUser(user);
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

      if (response?.userType === "babysitter") {
        await supabase
          .from("babySitterProfile")
          .update({ isAvailable: true })
          .eq("user_id", data.session?.user.id);
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

  // ---------- old code for reference ------------
  // const registerMutation = useMutation<User, Error, RegisterData>({
  //   mutationFn: async (userData) => {
  //     const res = await apiRequest("POST", "/api/register", userData);
  //     if (!res.ok) {
  //       const errorData = await res
  //         .json()
  //         .catch(() => ({ message: "Registration failed" }));
  //       throw new Error(errorData.message || "Registration failed");
  //     }
  //     return res.json();
  //   },
  //   onSuccess: (data) => {
  //     queryClient.setQueryData(["/api/user"], data);

  //     // If the user is a parent, redirect to membership page
  //     if (data.userType === "parent") {
  //       // Use window.location to force a full page reload and avoid React state issues
  //       window.location.href = "/membership";
  //     }

  //     // Simple success message
  //     toast({
  //       title: "Registration successful",
  //       description: `Welcome to The Enchanted Co., ${data.fullName}!`,
  //     });
  //   },
  //   onError: (error) => {
  //     toast({
  //       title: "Registration failed",
  //       description: error.message,
  //       variant: "destructive",
  //     });
  //   },
  // });
  // ---------- old code for reference ------------

  // ----------- new code ------------
  const registerMutation = async (userData: RegisterData) => {
    setRegisterLoading(true);
    setError(null);
    try {
      const { fullName, email, password, userType } = userData;

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            userType: userType,
            fullName,
          },
        },
      });

      if (error || !data) {
        throw new Error(error?.message || "Registration failed");
      }

      let response = data?.session?.user?.user_metadata;

      if (response?.userType === "babysitter") {
        await supabase
          .from("babySitterProfile")
          .upsert({ isAvailable: true })
          .eq("user_id", data.session?.user.id);
      }

      setUser(response);
      toast({
        title: "Registration successful",
        description: `Welcome to The Enchanted Co., ${response?.fullName}!`,
      });      
      
      // ✅ Stripe Connect Onboarding for babysitters
      if (response?.userType === "babysitter") {
        const res = await fetch("/api/create-onboarding-link", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email,
            user_id: data.session?.user.id,
            refresh_url: `${window.location.origin}/resume-onboarding`,
            return_url: `${window.location.origin}/profile-completion`,
          }),
        });

        const { url } = await res.json();
        window.location.href = url; // redirect to Stripe onboarding
        return;
      }

      // if (registeredUser?.userType === "parent") {
      //   window.location.href = "/membership";
      // }
    } catch (err: any) {
      setError(err);
      toast({
        title: "Registration failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setRegisterLoading(false);
    }
  };
  // ----------- new code ------------

  // ----------- old code for reference ------------
  // const logoutMutation = useMutation<void, Error, void>({
  //   mutationFn: async () => {
  //     const res = await apiRequest("POST", "/api/logout");
  //     if (!res.ok) {
  //       throw new Error("Logout failed");
  //     }
  //   },
  //   onSuccess: () => {
  //     queryClient.setQueryData(["/api/user"], null);
  //     toast({
  //       title: "Logged out successfully",
  //     });
  //   },
  //   onError: (error) => {
  //     toast({
  //       title: "Logout failed",
  //       description: error.message,
  //       variant: "destructive",
  //     });
  //   },
  // });
  // ----------- old code for reference ------------

  // ----------- new code ------------
  const logoutMutation = async () => {
    setLoginLoading(true);
    setError(null);

    try {
      if (user?.id && user?.user_metadata?.userType === "babysitter") {
        const { error: updateError } = await supabase
          .from("babySitterProfile")
          .update({ isAvailable: false })
          .eq("user_id", user?.id);

        if (updateError) {
          throw new Error(updateError.message);
        }
      }

      const { error } = await supabase.auth.signOut();

      if (error) {
        throw new Error(error?.message || "Invalid credentials");
      }

      setUser(null);
      toast({
        title: "logout successful",
      });
      navigate("/auth");
    } catch (err: any) {
      setError(err);
      toast({
        title: "Logout failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoginLoading(false);
    }
  };

  const forgetPassword = async (email: string) => {
    setForgotLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw new Error(error.message);
      }

      toast({
        title: "Password reset link sent",
        description: "Please check your email to reset your password.",
      });

      return { error: null };
    } catch (error: any) {
      console.error("forget Password Catch Error:", error);

      toast({
        title: "Reset Password Failed",
        description: error.message || 'Something went wrong.',
        variant: "destructive",
      });

      return { error };
    } finally {
      setForgotLoading(false);
    }
  };

  const resetPassword = async (newPassword: string) => {
    setResetLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw new Error(error.message);
      }

      toast({
        title: "Password updated successfully",
        description: "You can now log in with your new password.",
      });

      return { error: null };
    } catch (error: any) {
      console.error("Reset Password Error:", error);

      toast({
        title: "Update Password Failed",
        description: error.message || 'Something went wrong.',
        variant: "destructive",
      });

      return { error };
    } finally {
      setResetLoading(false);
    }
  };

  // ----------- new code ------------

  // ----------- new code ------------
  useEffect(() => {
    fetchUser();
  }, [registerLoading, loginLoading]);
  // ----------- new code ------------

  const value: AuthContextType = {
    user,
    isLoading: loginLoading || registerLoading,
    error,
    loginMutation,
    registerMutation,
    logoutMutation,
    forgetPassword,
    resetPassword,
    loginLoading: loginLoading,
    registerLoading: registerLoading,
    forgotLoading: forgotLoading,
    resetLoading: resetLoading,
  };

  return (
    <AuthContext.Provider
      /* --------- old code for reference ------------ */
      /* value={{
        user: user || null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
      }} */
      /* --------- old code for reference ------------ */

      value={value}
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
