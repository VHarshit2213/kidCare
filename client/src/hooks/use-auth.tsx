import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { useToast } from "@/hooks/use-toast";
import { User } from "@/lib/types";
import supabase from "../config/supabaseClient";
import { useNavigate } from "react-router-dom";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: (credentials: LoginData) => Promise<void>;
  registerMutation: (userData: RegisterData) => Promise<void>;
  logoutMutation: () => Promise<void>;
  loginLoading: boolean;
  registerLoading: boolean;
};

type LoginData = {
  email: string;
  password: string;
};

type RegisterData = {
  userName: string;
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

  const logoutMutation = async () => {
    setLoginLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw new Error(error?.message || "Invalid credentials");
      }

      setUser(null);
      localStorage.removeItem("userData");
      toast({
        title: "logout successful",
      });
      navigate("/auth");
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

  const registerMutation = async (userData: RegisterData) => {
    setRegisterLoading(true);
    setError(null);
    try {
      const { fullName, userName, password, userType } = userData;

      const { data, error } = await supabase.auth.signUp({
        email: userName,
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
      setUser(response);
      toast({
        title: "Registration successful",
        description: `Welcome to The Enchanted Co., ${response?.fullName}!`,
      });

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

  useEffect(() => {
    fetchUser();
  }, [registerLoading, loginLoading]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading: loginLoading || registerLoading,
        error,
        loginMutation,
        registerMutation,
        logoutMutation,
        loginLoading: loginLoading,
        registerLoading: registerLoading,
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
