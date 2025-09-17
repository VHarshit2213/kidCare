import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import logo from "../assets/enchanted-logo.png";

const resetPasswordSchema = z
  .object({
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z
      .string()
      .min(6, "Password must be at least 6 characters"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const { resetPassword, resetLoading } = useAuth();
  const [, navigate] = useLocation();
  const [token, setToken] = useState<string>("");
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Extract token from URL parameters
  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const type = hashParams.get("type");
    const accessToken = hashParams.get("access_token");

    if (type !== "recovery" || !accessToken) {
      setStatus("error");
      setErrorMessage(
        "Invalid reset link. Please request a new password reset.",
      );
      return;
    }

    setToken(accessToken);
  }, []);

  async function onSubmit(values: ResetPasswordValues) {
    if (!token) {
      setErrorMessage("Invalid reset token");
      return;
    }
    const { error } = await resetPassword(values.newPassword);

    if (!error) {
      navigate("/auth");
    } else {
      setErrorMessage(error.message || "Password reset failed");
    }
  }

  if (status === "success") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-br from-blue-50 via-white to-pink-50">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <svg
                  className="h-8 w-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <CardTitle className="text-xl">
                Password Reset Successful
              </CardTitle>
              <CardDescription>
                Your password has been successfully updated. You can now log in
                with your new password.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => navigate("/auth")}
                className="w-full"
                style={{ backgroundColor: "#3c5679" }}
              >
                Continue to Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (status === "error" && !token) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-br from-blue-50 via-white to-pink-50">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <svg
                  className="h-8 w-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <CardTitle className="text-xl">Invalid Reset Link</CardTitle>
              <CardDescription>
                This password reset link is invalid or has expired. Please
                request a new password reset.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => navigate("/auth")}
                className="w-full"
                style={{ backgroundColor: "#3c5679" }}
              >
                Back to Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-br from-blue-50 via-white to-pink-50">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <img
            src={logo}
            alt="The Enchanted Co. Logo"
            className="h-20 w-auto mx-auto mb-2"
          />
          <p className="text-gray-600">Your trusted childcare partner</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create New Password</CardTitle>
            <CardDescription>
              Enter your new password below. Make sure it's at least 6
              characters long.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {errorMessage && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{errorMessage}</p>
              </div>
            )}

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        New Password <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showNewPassword ? "text" : "password"}
                            placeholder="Enter your new password"
                            {...field}
                            className="pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword((prev) => !prev)}
                            className="absolute top-1/2 -translate-y-1/2 right-3 text-[#6C7275] cursor-pointer"
                          >
                            {showNewPassword ? (
                              <FaRegEyeSlash size={16} />
                            ) : (
                              <FaRegEye size={16} />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Confirm New Password{" "}
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm your new password"
                            {...field}
                            className="pr-10"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowConfirmPassword((prev) => !prev)
                            }
                            className="absolute top-1/2 -translate-y-1/2 right-3 text-[#6C7275] cursor-pointer"
                          >
                            {showConfirmPassword ? (
                              <FaRegEyeSlash size={16} />
                            ) : (
                              <FaRegEye size={16} />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  style={{ backgroundColor: "#3c5679" }}
                  disabled={resetLoading}
                >
                  {resetLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Reset Password
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
