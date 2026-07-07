"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

export default function AuthForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const [otp, setOtp] = useState("");
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: otp.trim(),
        type: 'email'
      });
      if (error) throw error;
      toast.success("Account verified successfully! You are now signed in.");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success("Signed in");
        router.refresh();
      } else {
        const { data: signUpCheck, error: signUpError } =
          await supabase.auth.signUp({
            email,
            password,
            options: { data: { full_name: fullName } },
          });
        if (signUpError) throw signUpError;

        if (
          signUpCheck.user &&
          signUpCheck.user.identities &&
          signUpCheck.user.identities.length === 0
        ) {
          throw new Error(
            "This email is already registered. Please sign in instead.",
          );
        }

        toast.success("Verification code sent to your Gmail.");
        setIsVerifyingOtp(true); // Switch to OTP verification form
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerifyingOtp) {
    return (
      <form onSubmit={handleVerifyOtp} className="space-y-5">
        <div>
          <label className="text-xs text-muted-foreground block mb-1.5 text-center">
            Enter the verification code sent to<br/> <strong className="text-foreground">{email}</strong>
          </label>
          <input
            required
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="w-full bg-card border border-border px-4 py-3 text-center tracking-widest text-lg text-foreground focus:outline-none focus:border-primary/50 transition-colors"
            placeholder="Enter Code"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-foreground text-background py-3 text-sm font-medium hover:bg-foreground/95 transition-colors duration-200 disabled:opacity-50"
        >
          {isLoading ? "Verifying..." : "Verify & Sign In"}
        </button>
        <div className="text-center">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors duration-200"
          >
            Cancel
          </button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {!isLogin && (
        <div>
          <label className="text-xs text-muted-foreground block mb-1.5">
            Full Name
          </label>
          <input
            required
            minLength={3}
            maxLength={50}
            pattern="^[a-zA-Z\s.-]+$"
            title="Name can only contain letters, spaces, periods, and hyphens"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full bg-card border border-border px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
            placeholder="Muhammad Saad Zia"
          />
        </div>
      )}

      <div>
        <label className="text-xs text-muted-foreground block mb-1.5">
          Email Address
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-card border border-border px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label className="text-xs text-muted-foreground block mb-1.5">
          Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            required
            minLength={6}
            maxLength={50}
            title="Password must be at least 6 characters long"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-card border border-border px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors pr-12"
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-foreground text-background py-3 text-sm font-medium hover:bg-foreground/95 transition-colors duration-200 disabled:opacity-50"
      >
        {isLoading ? "Processing..." : isLogin ? "Sign In" : "Send Verification Code"}
      </button>

      <div className="text-center">
        <button
          type="button"
          onClick={() => setIsLogin(!isLogin)}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors duration-200"
        >
          {isLogin
            ? "Don't have an account? Sign up"
            : "Already have an account? Sign in"}
        </button>
      </div>
    </form>
  );
}
