"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  AlertCircle,
  ChevronLeft,
  ShieldCheck,
  Stethoscope,
  Clock,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import Logo from "@/components/Navigation/Shared/Logo/Logo";
import GoogleLoginButton from "@/components/features/Auth/GoogleLoginButton";
import PageTransition from "@/components/ui/PageTransition";

const Login = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [lockTimeLeft, setLockTimeLeft] = useState(null);

  // Form Submission Logic
  const handleLogin = async (e) => {
    e.preventDefault();
    if (lockTimeLeft) return;
    setLoading(true);
    setAuthError(null);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      try {
        const parsed = JSON.parse(result.error);
        setAuthError(parsed);
        if (parsed.code === "ACCOUNT_LOCKED") {
          setLockTimeLeft(parsed.remainingMinutes * 60);
        }
      } catch {
        setAuthError({ code: "INVALID_CREDENTIALS" });
      }
      return;
    }
    router.push(callbackUrl);
  };

  // Countdown Effect
  useEffect(() => {
    if (!lockTimeLeft) return;
    const interval = setInterval(() => {
      setLockTimeLeft((prev) =>
        prev <= 1 ? (clearInterval(interval), null) : prev - 1,
      );
    }, 1000);
    return () => clearInterval(interval);
  }, [lockTimeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <PageTransition>
      <div className="min-h-screen w-full bg-slate-50/50 flex flex-col items-center justify-center p-0 sm:p-4 md:p-8 lg:p-6">
        {/* Container Card - Responsive Widths */}
        <Card className="w-full max-w-275 border-none shadow-xl sm:border sm:shadow-sm md:shadow-2xl rounded-none sm:rounded-3xl overflow-hidden bg-white">
          <CardContent className="p-0 flex flex-col md:flex-row min-h-150 lg:min-h-175">
            {/* Left Side: Professional Branding - Hidden on Mobile, Flex on Desktop */}
            <div className="hidden md:flex flex-1 flex-col justify-between p-8 lg:p-8 bg-primary text-primary-foreground relative">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent)] pointer-events-none" />

              <Link
                href="/"
                className="z-10 inline-flex items-center gap-2 opacity-70 hover:opacity-100 transition-all text-sm"
              >
                <ChevronLeft className="w-4 h-4" /> Back to SHIFA
              </Link>

              <div className="z-10 space-y-10">
                <div className="bg-white/10 backdrop-blur-md w-fit p-4 rounded-2xl border border-white/20">
                  <Logo
                    height={50}
                    width={50}
                    text="text-2xl text-white font-bold"
                  />
                </div>

                <div className="space-y-4">
                  <h1 className="text-4xl lg:text-5xl font-extrabold leading-[1.1] tracking-tight">
                    Healthcare <br />{" "}
                    <span className="text-blue-200">Simplified.</span>
                  </h1>
                  <p className="text-primary-foreground/80 text-lg font-light leading-relaxed max-w-sm">
                    Join a community of patients receiving world-class care from
                    home.
                  </p>
                </div>

                <div className="grid gap-4">
                  {[
                    { text: "HIPAA Compliant Security", icon: ShieldCheck },
                    { text: "Verified Specialist Network", icon: Stethoscope },
                    { text: "Real-time Support", icon: Clock },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 text-sm font-medium"
                    >
                      <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center border border-white/10">
                        <item.icon className="w-4 h-4" />
                      </div>
                      {item.text}
                    </div>
                  ))}
                </div>
              </div>

              <p className="z-10 text-primary-foreground/40 text-xs">
                © 2026 SHIFA Medical Group
              </p>
            </div>

            {/* Right Side: Form Content - Full width on mobile, centered */}
            <div className="flex-[1.2] flex flex-col justify-center px-6 py-12 sm:px-42 md:px-6 lg:px-8 bg-card">
              <div className="w-full max-w-100 mx-auto space-y-6">
                {/* Mobile Header (Only visible on small screens) */}
                <div className="md:hidden flex flex-col items-center space-y-4 text-center">
                  <Logo height={60} width={60} text="text-2xl font-bold" />
                  <div className="space-y-1">
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                      Sign In
                    </h2>
                    <p className="text-muted-foreground text-sm">
                      Welcome back to your portal
                    </p>
                  </div>
                </div>

                {/* Desktop Header */}
                <header className="hidden md:block space-y-2 text-center">
                  <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                    Sign In
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    Please enter your credentials to continue
                  </p>
                </header>

                <form onSubmit={handleLogin} className="space-y-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-slate-700 font-semibold"
                    >
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="h-12 rounded-xl text-base border-slate-200 focus-visible:ring-primary/20"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password text-slate-700 font-semibold">
                        Password
                      </Label>
                      <Link
                        href="/forgot-password"
                        size="sm"
                        className="text-xs font-bold text-primary hover:underline"
                      >
                        Forgot?
                      </Link>
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="h-12 rounded-xl text-base pr-12 border-slate-200 focus-visible:ring-primary/20"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 p-2"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                  {authError && (
                    <Alert
                      variant="destructive"
                      className="rounded-xl border-none bg-destructive/10 text-destructive animate-in fade-in slide-in-from-top-1 flex items-start"
                    >
                      {/* Notice: No extra wrapper div here, Alert handles the flex-row gap natively if styled correctly */}
                      <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
                      <AlertDescription className="ml-3 text-sm font-medium leading-relaxed">
                        {authError.code === "PASSWORD_INCORRECT" && (
                          <>
                            <p>
                              Incorrect password. {authError.remainingAttempts}{" "}
                              attempts left.
                            </p>
                            {authError.remainingAttempts <= 2 && (
                              <Link
                                href="/forgot-password"
                                className="inline-block mt-1 font-bold underline hover:opacity-80 transition-opacity"
                              >
                                Reset Password
                              </Link>
                            )}
                          </>
                        )}
                        {authError.code === "ACCOUNT_LOCKED" && (
                          <p>
                            Your account is temporarily locked for security.
                            Please try again later.
                          </p>
                        )}
                        {authError.code === "INVALID_CREDENTIALS" && (
                          <p>The email or password you entered is incorrect.</p>
                        )}
                        {authError.code === "OAUTH_ACCOUNT" && (
                          <p>
                            This email is linked to a Google account. Please use
                            the Google Sign-In button below.
                          </p>
                        )}
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    disabled={loading || !!lockTimeLeft}
                    className="w-full h-12 text-base font-bold rounded-xl transition-all shadow-lg shadow-primary/20"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                        Verifying
                      </>
                    ) : lockTimeLeft ? (
                      <>
                        <Clock className="mr-2 h-4 w-4" /> Locked (
                        {formatTime(lockTimeLeft)})
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-3 text-slate-400 font-bold tracking-widest">
                      Or
                    </span>
                  </div>
                </div>

                <GoogleLoginButton className="h-12 border-slate-200 hover:bg-slate-50 transition-colors" />

                <p className="text-center text-slate-500 text-sm">
                  New to SHIFA?{" "}
                  <Link
                    href="/register"
                    className="text-primary font-bold hover:underline underline-offset-4"
                  >
                    Register Account
                  </Link>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer for Mobile - only visible when not md */}
        <p className="md:hidden mt-8 text-slate-400 text-xs text-center font-medium">
          © 2026 SHIFA Medical Group • HIPAA Secure
        </p>
      </div>
    </PageTransition>
  );
};

export default Login;
