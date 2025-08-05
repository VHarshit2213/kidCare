import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import supabase from "@/config/supabaseClient";

// Define form schemas
const loginSchema = z.object({
  // username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = z.object({
  userName: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  // We'll treat the username as the email, but keep basic validation
  email: z.string().email("Invalid email address"),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  userType: z.enum(["parent", "babysitter"], {
    required_error: "Please select a user type",
  }),
});

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;
type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export default function AuthPage() {
  const [location, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<string>("login");
  const [adminMode, setAdminMode] = useState(false);

  // const { user, loginMutation, registerMutation } = useAuth();
  const {
    user,
    loginLoading,
    registerLoading,
    loginMutation,
    registerMutation,
  } = useAuth();

  const [forgotPasswordStatus, setForgotPasswordStatus] = useState<
    "idle" | "sending" | "sent" | "error"
  >("idle");
  console.log("user===>", user);
  const isPaymentSuccess = user?.isPayment;

  // ----------- old code for reference ------------
  // Redirect based on user status
  // if (user) {
  //   console.log("Auth page: User detected", {
  //     id: user.id,
  //     userName: user.username,
  //     userType: user.userType,
  //     membershipStatus: user.membershipStatus,
  //     profileCompleted: user.profileCompleted,
  //   });

  //   // For parent users who need to complete their membership, redirect directly to membership page
  //   if (
  //     user.userType === "parent" &&
  //     (!user.membershipStatus || user.membershipStatus === "none")
  //   ) {
  //     console.log("Auth page: Redirecting parent directly to membership page");
  //     navigate("/membership");
  //     // } else if (!user.profileCompleted) {
  //     //   // Users without completed profiles go to profile completion
  //     //   console.log("Auth page: Redirecting to profile completion page");
  //     //   navigate("/profile-completion");
  //   } else {
  //     // Users with completed profiles go to home
  //     console.log("Auth page: Redirecting to home page");
  //     navigate("/");
  //   }
  //   return null;
  // }
  // ----------- old code for reference ------------

  // Login form
  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      // username: "",
      email: "",
      password: "",
    },
  });

  // Register form
  const registerForm = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      userName: "",
      password: "",
      email: "",
      // fullName: "",
      userType: "parent",
    },
  });

  // Handle login submission
  async function onLoginSubmit(values: LoginValues) {
    // loginMutation.mutate(values);
    await loginMutation(values);
  }

  // Handle registration submission
  async function onRegisterSubmit(values: RegisterValues) {
    // registerMutation.mutate(values);
    await registerMutation(values);
  }

  // Forgot password form
  const forgotPasswordForm = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  // Handle forgot password submission
  async function onForgotPasswordSubmit(values: ForgotPasswordValues) {
    try {
      setForgotPasswordStatus("sending");

      // Make API call to request password reset
      const response = await fetch("/api/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: values.email }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.message || "Failed to process password reset request",
        );
      }

      setForgotPasswordStatus("sent");
    } catch (error) {
      console.error("Password reset error:", error);
      setForgotPasswordStatus("error");
    }
  }

  /* ----------- new code ------------ */
  const fetchParentProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("parentprofile")
      .select("*")
      .eq("user_id", userId)
      .limit(1);

    if (error) {
      console.error("Fetch error:", error.message);
      return null;
    }

    return data;
  };

  const fetchBabysitterProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("babySitterProfile")
      .select("*")
      .eq("user_id", userId)
      .limit(1);

    if (error) {
      console.error("Fetch error:", error.message);
      return null;
    }

    return data;
  };

  const handleRedirection = async () => {
    console.log("Auth page: User detected", {
      id: user.id,
      userName: user.username,
      userType: user.userType,
    });    

    if (user?.userType === "parent") {
      const data = await fetchParentProfile(user?.sub);
      if (!data || data.length === 0) {
        console.log("No parent profile → redirect to /profile-completion");
        navigate("/profile-completion");
        return;
      }

      if (!isPaymentSuccess) {
        console.log("Payment incomplete → redirect to /membership");
        navigate("/membership");
        return;
      }

      console.log("Profile + Payment complete → redirect to /");
      navigate("/");
    } else if (user?.userType === "babysitter") {
      const data = await fetchBabysitterProfile(user?.sub);
      
      if (!data?.[0]?.isProfileCompleted) {
        console.log("No parent profile → redirect to /profile-completion");
        navigate("/profile-completion");
        return;
      }
      console.log("Profile + Payment complete → redirect to /");
      navigate("/");
    } else if (user?.userType === "admin") {
      console.log("Admin user → redirect to /admin");
      navigate("/admin");
    } else {
      // Non-parent users → go to home
      console.log("Non-parent user → redirect to /");
      navigate("/");
    }
  };

  useEffect(() => {
    if (user?.sub) {
      handleRedirection();
    }
  }, [user]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    const admin = params.get("admin");

    if (tab === "register" || tab === "login" || tab === "forgot-password") {
      setActiveTab(tab);
    }

    setAdminMode(admin === "true");
  }, []);
  /* ----------- new code ------------ */

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-gradient-to-br from-blue-50 via-white to-pink-50">
      {/* Left side: Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <img
              src="/src/assets/enchanted-logo.png"
              alt="The Enchanted Co. Logo"
              className="h-20 w-auto mx-auto mb-2"
            />
            <p className="text-gray-600">Your trusted childcare partner</p>
          </div>

          <Tabs
            defaultValue="login"
            className="w-full"
            value={activeTab}
            onValueChange={setActiveTab}
          >
            <TabsList
              className={`grid w-full  mb-6 ${!adminMode ? "grid-cols-3" : "grid-cols-1 justify-normal"} `}
            >
              <TabsTrigger value="login">Login</TabsTrigger>
              {!adminMode && (
                <>
                  <TabsTrigger value="register">Register</TabsTrigger>
                  <TabsTrigger value="forgot-password">
                    Forgot Password
                  </TabsTrigger>
                </>
              )}
              {/* <TabsTrigger value="register">Register</TabsTrigger>
              <TabsTrigger value="forgot-password">Forgot Password</TabsTrigger> */}
            </TabsList>

            {/* Login Form */}
            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle>Welcome back {adminMode ? "Admin" : ""}</CardTitle>
                  <CardDescription>
                    Sign in to access your account and manage your bookings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...loginForm}>
                    <form
                      onSubmit={loginForm.handleSubmit(onLoginSubmit)}
                      className="space-y-4"
                    >
                      {/* ----------- old code for reference ------------ */}
                      {/* <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter your username"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      /> */}
                      {/* ----------- old code for reference ------------ */}

                      {/* ----------- new code ------------ */}
                      <FormField
                        control={loginForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Choose a username (will also be your email)"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {/* ----------- new code ------------ */}

                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="Enter your password"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                            {/* <div className="text-right mt-1">
                              <Button
                                variant="link"
                                className="p-0 h-auto text-xs text-blue-600"
                                onClick={() => setActiveTab("forgot-password")}
                                type="button"
                              >
                                Forgot password?
                              </Button>
                            </div> */}
                            {!adminMode && (
                              <div className="text-right mt-1">
                                <Button
                                  variant="link"
                                  className="p-0 h-auto text-xs text-blue-600"
                                  onClick={() =>
                                    setActiveTab("forgot-password")
                                  }
                                  type="button"
                                >
                                  Forgot password?
                                </Button>
                              </div>
                            )}
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        className="w-full"
                        style={{ backgroundColor: "#3c5679" }}
                        /* disabled={loginMutation.isPending} */
                        disabled={loginLoading}
                      >
                        {/* {loginMutation.isPending ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null} */}
                        {loginLoading ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        Sign In
                      </Button>
                    </form>
                  </Form>
                </CardContent>
                {!adminMode && (
                  <CardFooter className="flex justify-center">
                    <Button
                      variant="link"
                      onClick={() => setActiveTab("register")}
                    >
                      Don't have an account? Register
                    </Button>
                  </CardFooter>
                )}
              </Card>
            </TabsContent>

            {/* Register Form */}
            <TabsContent value="register">
              <Card>
                <CardHeader>
                  <CardTitle>Create an account</CardTitle>
                  <CardDescription>
                    Join The Enchanted Co. community today
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...registerForm}>
                    <form
                      onSubmit={registerForm.handleSubmit(onRegisterSubmit)}
                      className="space-y-4"
                    >
                      <FormField
                        control={registerForm.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter your full name"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={registerForm.control}
                        name="userName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username/Email</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Choose a username (will also be your email)"
                                {...field}
                                onChange={(e) => {
                                  field.onChange(e);
                                  // Set email to the same value as username
                                  registerForm.setValue(
                                    "email",
                                    e.target.value,
                                  );
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Hidden email field that automatically syncs with username */}
                      <input
                        type="hidden"
                        {...registerForm.register("email")}
                      />

                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="Choose a password"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={registerForm.control}
                        name="userType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>I am a</FormLabel>
                            <div className="grid grid-cols-2 gap-3 pt-1">
                              <Button
                                type="button"
                                variant={
                                  field.value === "parent"
                                    ? "default"
                                    : "outline"
                                }
                                style={
                                  field.value === "parent"
                                    ? { backgroundColor: "#3c5679" }
                                    : {}
                                }
                                onClick={() =>
                                  registerForm.setValue("userType", "parent")
                                }
                                className="w-full"
                              >
                                Parent
                              </Button>
                              <Button
                                type="button"
                                variant={
                                  field.value === "babysitter"
                                    ? "default"
                                    : "outline"
                                }
                                style={
                                  field.value === "babysitter"
                                    ? { backgroundColor: "#3c5679" }
                                    : {}
                                }
                                onClick={() =>
                                  registerForm.setValue(
                                    "userType",
                                    "babysitter",
                                  )
                                }
                                className="w-full"
                              >
                                Babysitter
                              </Button>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Message for babysitters */}
                      {registerForm.watch("userType") === "babysitter" && (
                        <div className="p-4 bg-blue-50 rounded-md mt-4">
                          <p className="text-sm text-blue-700">
                            After registration, you'll be able to complete your
                            babysitter profile with your experience, skills, and
                            more.
                          </p>
                        </div>
                      )}

                      <Button
                        type="submit"
                        className="w-full"
                        style={{ backgroundColor: "#3c5679" }}
                        /* disabled={registerMutation.isPending} */
                        disabled={registerLoading}
                      >
                        {/* {registerMutation.isPending ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null} */}
                        {registerLoading ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        Create Account
                      </Button>
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className="flex justify-center">
                  <Button variant="link" onClick={() => setActiveTab("login")}>
                    Already have an account? Sign in
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Forgot Password Form */}
            <TabsContent value="forgot-password">
              <Card>
                <CardHeader>
                  <CardTitle>Reset your password</CardTitle>
                  <CardDescription>
                    Enter your email to receive a password reset link
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {forgotPasswordStatus === "sent" ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-green-50 rounded-md border border-green-200 text-green-700">
                        <div className="flex items-center space-x-2 mb-2">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          <span className="font-semibold">Email sent!</span>
                        </div>
                        <p className="text-sm">
                          If an account exists with that email, we've sent
                          instructions to reset your password. Please check your
                          inbox.
                        </p>
                      </div>
                      <Button
                        type="button"
                        className="w-full"
                        style={{ backgroundColor: "#3c5679" }}
                        onClick={() => {
                          setForgotPasswordStatus("idle");
                          setActiveTab("login");
                        }}
                      >
                        Return to Login
                      </Button>
                    </div>
                  ) : (
                    <Form {...forgotPasswordForm}>
                      <form
                        onSubmit={forgotPasswordForm.handleSubmit(
                          onForgotPasswordSubmit,
                        )}
                        className="space-y-4"
                      >
                        <FormField
                          control={forgotPasswordForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input
                                  type="email"
                                  placeholder="Enter your email address"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                We'll send you a link to reset your password.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Button
                          type="submit"
                          className="w-full"
                          style={{ backgroundColor: "#3c5679" }}
                          disabled={forgotPasswordStatus === "sending"}
                        >
                          {forgotPasswordStatus === "sending" ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : null}
                          Reset Password
                        </Button>
                      </form>
                    </Form>
                  )}
                </CardContent>
                <CardFooter className="flex justify-center">
                  <Button variant="link" onClick={() => setActiveTab("login")}>
                    Remember your password? Sign in
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Right side: Hero */}
      <div className="hidden md:flex flex-1 bg-brand-blue text-white p-10 items-center justify-center">
        <div className="max-w-md">
          <h2 className="text-4xl font-bold mb-6">
            Quality childcare at your fingertips
          </h2>
          <p className="text-xl mb-8">
            Whether you need immediate care or want to schedule in advance, The
            Enchanted Co. connects you with trusted, qualified babysitters in
            your area.
          </p>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="p-2 bg-white/10 rounded-md mr-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Background Checked</h3>
                <p className="text-white/80">
                  All our sitters undergo thorough background checks
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="p-2 bg-white/10 rounded-md mr-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">
                  Convenient Care Options
                </h3>
                <p className="text-white/80">
                  Find care with flexible scheduling options
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="p-2 bg-white/10 rounded-md mr-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Booking Flexibility</h3>
                <p className="text-white/80">
                  Schedule in advance or request same-day care
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
