"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Lock, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/ui/card";
import { useRouter } from "next/navigation";

const schema = z
  .object({
    password: z
      .string()
      .min(8, "Minimum 8 characters")
      .regex(/[0-9]/, "At least one number")
      .regex(/[^a-zA-Z0-9]/, "At least one special character"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

export const ResetPasswordForm = ({ token }: { token: string }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, newPassword: data.password }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);

      router.push("/login?reset=success");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-xl border-none ring-1 ring-border p-6">
      <CardHeader>
        <CardTitle className="text-2xl  gap-2 flex justify-center items-center">
          <ShieldCheck className="text-primary" /> Create New Password
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              {...register("password")}
              type={showPass ? "text" : "password"}
              placeholder="New Password"
              className="pl-10"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
            >
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-destructive">
              {errors.password.message}
            </p>
          )}

          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              {...register("confirmPassword")}
              type="password"
              placeholder="Confirm Password"
              className="pl-10"
              disabled={isLoading}
            />
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-destructive">
              {errors.confirmPassword.message}
            </p>
          )}

          {error && (
            <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md border border-destructive/20">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full h-11" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="animate-spin" />
            ) : (
              "Update Password"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
