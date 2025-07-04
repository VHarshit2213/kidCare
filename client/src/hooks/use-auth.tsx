import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { User } from "@/lib/types";
import supabase from "../config/supabaseClient";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: (credentials: LoginData) => Promise<void>;
  registerMutation: (userData: RegisterData) => Promise<void>;
  loginLoading: boolean;
  registerLoading: boolean;
};

type LoginData = {
  userName: string;
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
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchUser = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from("users").select().single();
      if (error) throw new Error(error.message);
      setUser(data);
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
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("fullName", credentials.userName)
        .eq("password", credentials.password)
        .single();

      if (error || !data) {
        throw new Error(error?.message || "Invalid credentials");
      }

      setUser(data);
      toast({
        title: "Login successful",
        description: `Welcome back, ${data.fullName}!`,
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

  const registerMutation = async (userData: RegisterData) => {
    setRegisterLoading(true);
    setError(null);
    try {
      const { fullName, userName, password, userType } = userData;

      const { data, error } = await supabase
        .from("users")
        .insert([{ email: userName, password, userType, fullName }])
        .select();

      if (error || !data) {
        throw new Error(error?.message || "Registration failed");
      }

      const registeredUser = data[0];

      toast({
        title: "Registration successful",
        description: `Welcome to The Enchanted Co., ${registeredUser.fullName}!`,
      });

      if (registeredUser.userType === "parent") {
        window.location.href = "/membership";
      }
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
    fetchUser()
  }, [registerLoading,loginLoading ])

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading: loginLoading || registerLoading, 
        error,
        loginMutation,
        registerMutation,
        loginLoading: loginLoading,
        registerLoading : registerLoading,
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
