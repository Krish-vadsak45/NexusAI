"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

export default function SignupPage() {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Zod schema for validation
  const schema = z.object({
    username: z
      .string()
      .min(3, { message: "Username must be at least 3 characters" })
      .max(20, { message: "Username must be at most 20 characters" }),
    email: z.string().email({ message: "Invalid email address" }),
    phonenumber: z
      .string()
      .min(10, { message: "Phone number must be at least 10 digits" })
      .max(10, { message: "Phone number must be at most 10 digits" }),
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
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    await authClient.signIn.social({
      provider: "google",
    });
  };

  const onSubmit = async (values: FormData) => {
    setError(null);
    clearErrors();
    setIsSubmitting(true);
    try {
      const { data, error } = await authClient.signUp.email(
        {
          email: values.email,
          name: values.username,
          password: values.password,
          phonenumber: values.phonenumber,
        } as any,
        {
          onRequest: (ctx) => setIsSubmitting(true),
          // Inside onSubmit in your SignupPage
          onSuccess: (ctx) => {
            toast.success(
              "Account created! Check your email for the verification code."
            );
            router.push(
              `/verify-email?email=${encodeURIComponent(values.email)}`
            );
          },

          onError: (ctx) => {
            setError(ctx.error.message || "Something went wrong");
            toast.error(ctx.error.message || "Something went wrong");
          },
        }
      );
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      toast.error(err.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white">
      <Card className="w-full max-w-md rounded-2xl shadow-2xl border border-gray-800 bg-black/90 text-white backdrop-blur-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-4xl font-extrabold text-center text-white drop-shadow-lg tracking-tight">
            Create Account
          </CardTitle>
          <div className="mt-2 text-center text-gray-400 text-sm font-medium">
            Sign up to get started
          </div>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6"
            noValidate
          >
            {error && (
              <div className="bg-red-600/90 text-white rounded px-3 py-2 text-sm border border-red-400 shadow">
                {error}
              </div>
            )}
            <div className="space-y-1">
              <Label htmlFor="username" className="text-white font-semibold">
                Username
              </Label>
              <Input
                id="username"
                placeholder="yourusername"
                autoComplete="username"
                required
                className="bg-black/80 text-white border-gray-700 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
                {...register("username")}
                aria-invalid={!!errors.username}
              />
              {errors.username && (
                <div className="text-red-400 text-xs mt-1">
                  {errors.username.message}
                </div>
              )}
            </div>
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
              <Label htmlFor="phonenumber" className="text-white font-semibold">
                Phone Number
              </Label>
              <Input
                id="phonenumber"
                type="text"
                placeholder="Phone Number"
                autoComplete="tel"
                required
                className="bg-black/80 text-white border-gray-700 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
                {...register("phonenumber")}
                aria-invalid={!!errors.phonenumber}
              />
              {errors.phonenumber && (
                <div className="text-red-400 text-xs mt-1">
                  {errors.phonenumber.message}
                </div>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="password" className="text-white font-semibold">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                required
                className="bg-black/80 text-white border-gray-700 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
                {...register("password")}
                aria-invalid={!!errors.password}
              />
              {errors.password && (
                <div className="text-red-400 text-xs mt-1">
                  {errors.password.message}
                </div>
              )}
            </div>
            <Button
              type="submit"
              className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg shadow hover:bg-blue-700 transition-all duration-150"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Sign Up"}
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
              <span className="font-semibold">Sign up with Google</span>
            </Button>
            <div className="text-center text-sm mt-6">
              <span className="text-gray-400">Already have an account?</span>{" "}
              <Link
                href="/auth/signin"
                className="underline font-semibold text-blue-400 hover:text-blue-600 transition-all"
              >
                Login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
