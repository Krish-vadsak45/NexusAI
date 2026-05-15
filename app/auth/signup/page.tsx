"use client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/error-utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Phone,
} from "lucide-react";

const SignUpPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const schema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters" }),
    email: z.string().email({ message: "Invalid email address" }),
    phonenumber: z
      .string()
      .min(7, { message: "Phone number must be at least 7 digits" }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" })
      .regex(/[A-Z]/, { message: "Must include one uppercase letter" })
      .regex(/[0-9]/, { message: "Must include one number" }),
  });

  type FormData = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    clearErrors,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  const handleGoogleSignUp = async () => {
    try {
      await authClient.signIn.social({ provider: "google" });
    } catch {
      toast.error("Failed to sign up with Google");
    }
  };

  const onSubmit = async (values: FormData) => {
    setError(null);
    clearErrors();
    try {
      setIsSubmitting(true);
      const { error: signUpError } = await authClient.signUp.email({
        email: values.email,
        password: values.password,
        name: values.name,
        phonenumber: values.phonenumber,
      });

      if (signUpError) {
        const message = signUpError.message ?? "Failed to create account";
        setError(message);
        toast.error(message);
      } else {
        toast.success("Account created! Please verify your email.");
        router.push(`/verify-email?email=${encodeURIComponent(values.email)}`);
      }
    } catch (err: unknown) {
      const message = getErrorMessage(err);
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 w-full h-full flex items-center justify-center bg-[#050b16] overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_rgba(59,130,246,0.15),_transparent_40%),radial-gradient(circle_at_70%_80%,_rgba(147,51,234,0.1),_transparent_40%)]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md px-4 z-10"
      >
        <Card className="rounded-3xl shadow-[0_0_50px_-12px_rgba(59,130,246,0.25)] border-white/5 bg-black/40 backdrop-blur-2xl text-white max-h-[95vh] flex flex-col overflow-hidden">
          <CardHeader className="pt-6 pb-2">
            <div className="flex justify-center mb-1">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <span className="text-lg font-black tracking-tighter">N</span>
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-center tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400">
              Create Account
            </CardTitle>
            <p className="text-center text-gray-400 text-xs font-medium mt-0.5">
              Join NexusAI and start creating
            </p>
          </CardHeader>

          <CardContent className="px-8 pb-6 flex-1 overflow-y-auto custom-scrollbar">
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-3"
              noValidate
            >
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-red-500/10 border border-red-500/20 text-red-200 rounded-2xl p-4 text-xs flex gap-3 items-center"
                  >
                    <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                    <p>{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-1.5">
                <Label className="text-gray-300 text-xs font-semibold uppercase tracking-wider ml-1">
                  Full Name
                </Label>
                <div className="relative group text-white">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 group-focus-within:text-blue-400 text-gray-500">
                    <User className="h-4.5 w-4.5" />
                  </div>
                  <Input
                    {...register("name")}
                    placeholder="John Doe"
                    className="bg-white/[0.03] text-white border-white/10 pl-11 py-6 rounded-2xl focus:border-blue-500/50 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-gray-300 text-xs font-semibold uppercase tracking-wider ml-1">
                  Email
                </Label>
                <div className="relative group text-white">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 group-focus-within:text-blue-400 text-gray-500">
                    <Mail className="h-4.5 w-4.5" />
                  </div>
                  <Input
                    {...register("email")}
                    placeholder="name@company.com"
                    className="bg-white/[0.03] text-white border-white/10 pl-11 py-5 rounded-2xl focus:border-blue-500/50 focus:ring-blue-500/20"
                  />
                  {isDirty && !errors.email && (
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-gray-300 text-xs font-semibold uppercase tracking-wider ml-1">
                  Phone Number
                </Label>
                <div className="relative group text-white">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 group-focus-within:text-blue-400 text-gray-500">
                    <Phone className="h-4.5 w-4.5" />
                  </div>
                  <Input
                    {...register("phonenumber")}
                    placeholder="+1 555 123 4567"
                    className="bg-white/[0.03] text-white border-white/10 pl-11 py-5 rounded-2xl focus:border-blue-500/50 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-gray-300 text-xs font-semibold uppercase tracking-wider ml-1">
                  Password
                </Label>
                <div className="relative group text-white">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 group-focus-within:text-blue-400 text-gray-500">
                    <Lock className="h-4.5 w-4.5" />
                  </div>
                  <Input
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                    placeholder="Minimum 8 characters"
                    className="bg-white/[0.03] text-white border-white/10 pl-11 py-5 rounded-2xl focus:border-blue-500/50 focus:ring-blue-500/20"
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-gray-400 hover:text-white"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || !isValid}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-5 rounded-2xl shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 group"
              >
                {isSubmitting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <div className="flex items-center gap-2">
                    Get Started{" "}
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1" />
                  </div>
                )}
              </Button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/5" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase">
                  <span className="bg-black px-3 text-gray-500 tracking-widest leading-none">
                    Or sign up with
                  </span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full bg-white/[0.03] text-white border-white/10 hover:bg-white/[0.08] py-5 rounded-2xl flex items-center justify-center gap-3"
                onClick={handleGoogleSignUp}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="font-semibold">Google Account</span>
              </Button>

              <div className="text-center pt-2">
                <span className="text-gray-500 text-sm">Already a member?</span>{" "}
                <Link
                  href="/auth/signin"
                  className="text-sm font-bold text-blue-400 hover:text-blue-300 ml-1"
                >
                  Sign in
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default SignUpPage;
