"use client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {  z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { toast } from "sonner";

type SendOtpOptions = {
  trustDevice?: boolean;
  query?: Record<string, any>;
};

const SignInPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailNotVerified, setEmailNotVerified] = useState(false);
  const router = useRouter();

  // Zod schema for validation
  const schema = z.object({
    email: z.string().email({ message: "Invalid email address" }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" }),
    // .regex(
    //   /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=\[\]{};:'"\\|,.<>\/?`~])/,
    //   {
    //     message:
    //       "Password must include at least one uppercase letter, one lowercase letter, one number, and one special character",
    //   }
    // ),
  });

  type FormData = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError: setFormError,
    clearErrors,
    getValues,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const handleGoogleSignIn = async () => {
    const data = await authClient.signIn.social({
      provider: "google",
    });
    console.log("social", data);
  };

  const onSubmit = async (values: FormData) => {
    setError(null);
    clearErrors();
    setEmailNotVerified(false);
    try {
      setIsSubmitting(true);
      const { data: credentioaldata, error: credentioalerror } =
        await authClient.signIn.email(
          {
            email: values.email,
            password: values.password,
            callbackURL: undefined,
          },
          {
            onRequest: () => setIsSubmitting(true),
            onSuccess: async (ctx) => {
              // Sign in successful, no 2FA required

              toast.success("Logged in successfully!");
              router.push("/");
            },
            onError: (ctx: any) => {
              const message = ctx?.error?.message ?? "Something went wrong";
              toast.error(message);
              setError(message);
              setFormError("email", { message });
              if (
                typeof message === "string" &&
                message.toLowerCase().includes("email not verified")
              ) {
                setEmailNotVerified(true);
              }
            },
          }
        );

      if (credentioalerror) {
        toast.error(credentioalerror.message);
        if (
          typeof credentioalerror.message === "string" &&
          credentioalerror.message.toLowerCase().includes("email not verified")
        ) {
          setEmailNotVerified(true);
        }
      } else if (
        "twoFactorRedirect" in credentioaldata &&
        credentioaldata.twoFactorRedirect
      ) {
        // redirect to 2FA page
        await authClient.twoFactor.sendOtp();
        toast.success("2FA code sent to your email.");
        router.push("/two-factor/verify");
        return;
      } else {
        // regular login success
        console.log("login success", credentioaldata);
        toast.success("Logged in successfully");
        router.push("/");
      }
      // const { data, error } = await authClient.signIn.magicLink({
      //   email: values.email,
      //   callbackURL: "http://localhost:3000",
      // });
    } catch (err: any) {
      const message = err?.message ?? "Something went wrong";
      setError(message);
      toast.error(message);
      setFormError("email", { message });
      if (
        typeof message === "string" &&
        message.toLowerCase().includes("email not verified")
      ) {
        setEmailNotVerified(true);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartEmailVerification = async () => {
    const email = getValues("email");
    if (!email) {
      toast.error("Please enter your email first.");
      return;
    }
    try {
      setIsSubmitting(true);
      await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "email-verification",
      });
      toast.success("Verification code sent to your email.");
      router.push(`/verify-email?email=${encodeURIComponent(email)}`);
    } catch (e: any) {
      toast.error(e?.message || "Failed to start verification");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white">
      <Card className="w-full max-w-md rounded-2xl shadow-2xl border border-gray-800 bg-black/90 text-white backdrop-blur-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-4xl font-extrabold text-center text-white drop-shadow-lg tracking-tight">
            Login
          </CardTitle>
          <div className="mt-2 text-center text-gray-400 text-sm font-medium">
            Sign in to your account
          </div>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6"
            noValidate
          >
            {error && (
              <div className="bg-red-600/90 text-white rounded px-3 py-2 text-sm border border-red-400 shadow mb-2">
                {error}
                {emailNotVerified && (
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <span className="text-xs text-gray-100">
                      Your email is not verified.
                    </span>
                    <Button
                      type="button"
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={handleStartEmailVerification}
                      disabled={isSubmitting}
                    >
                      Email Verify
                    </Button>
                  </div>
                )}
              </div>
            )}
            <div className="space-y-1">
              <Label htmlFor="email" className="text-white font-semibold">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                required
                className="bg-black/80 text-white border-gray-700 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
                {...register("email")}
                aria-invalid={!!errors.email}
              />
              {errors.email && (
                <div className="text-red-400 text-xs mt-1">
                  {errors.email.message}
                </div>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="password" className="text-white font-semibold">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  required
                  className="bg-black/80 text-white border-gray-700 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
                  {...register("password")}
                  aria-invalid={!!errors.password}
                />
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-2 text-white"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </Button>
              </div>
              {errors.password && (
                <div className="text-red-400 text-xs mt-1">
                  {errors.password.message}
                </div>
              )}
              <div className="text-right mt-1">
                <Button
                  type="button"
                  variant="link"
                  className="text-blue-400 hover:text-blue-500 p-0 h-auto text-sm font-semibold cursor-pointer"
                  onClick={() => router.push("/forgot-password")}
                >
                  Forgot password?
                </Button>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg shadow hover:bg-blue-700 transition-all duration-150"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Logging in…" : "Login"}
            </Button>
            <div className="flex items-center gap-2 my-4">
              <div className="flex-1 h-px bg-gray-700" />
              <span className="text-xs text-gray-400">or</span>
              <div className="flex-1 h-px bg-gray-700" />
            </div>
            <Button
              type="button"
              variant="outline"
              className="w-full bg-black text-white border border-gray-700 hover:bg-gray-900 hover:border-blue-600 flex items-center justify-center gap-2"
              onClick={handleGoogleSignIn}
            >
              <svg
                className="w-5 h-5 mr-2"
                viewBox="0 0 48 48"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g>
                  <path
                    fill="#fff"
                    d="M44.5 20H24v8.5h11.7C34.7 33.7 29.8 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 6 .9 8.3 2.7l6.2-6.2C34.2 4.5 29.4 2.5 24 2.5 12.7 2.5 3.5 11.7 3.5 23S12.7 43.5 24 43.5c10.5 0 19.5-8.5 19.5-19.5 0-1.3-.1-2.5-.3-3.5z"
                  />
                </g>
              </svg>
              <span className="font-semibold">Continue with Google</span>
            </Button>
            <div className="text-center text-sm mt-6">
              <span className="text-gray-400">Don't have an account?</span>{" "}
              <Link
                href="/auth/signup"
                className="underline font-semibold text-blue-400 hover:text-blue-600 transition-all"
              >
                Sign Up
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignInPage;
