"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import GoogleLoginButton from "@/components/features/Auth/GoogleLoginButton";
import Logo from "@/components/Navigation/Shared/Logo/Logo";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

const Login = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password");
      return;
    }

    router.push(callbackUrl);
  };

  return (
    <div className=" relative flex flex-col md:flex-row items-center mt-0 md:mt-20 shadow-2xl rounded-2xl bg-gray-100">
      {/* Back to Home Button */}
      <Link
        href="/"
        className=" cursor-pointer absolute top-6 left-6 text-sm text-gray-600 hover:text-black transition-colors"
      >
        ← Back to Home
      </Link>
      {/* Left side - content */}
      <div className="flex-1 items-center justify-center p-12 hover:scale-102 transition ease-in">
        <div className="space-y-6">
          <div className="flex justify-center items-center">
            <Logo height={100} width={100} text={"text-4xl"} />
          </div>
          <p className="text-gray-600 text-lg">
            Your telemedicine platform. Connect with doctors anytime, anywhere.
          </p>
          <ul className="space-y-2 text-gray-600">
            <li>✔ Online consultations</li>
            <li>✔ Secure patient records</li>
            <li>✔ Easy appointment scheduling</li>
          </ul>
        </div>
      </div>

      {/* Right side */}
      <div className="flex-1 items-center justify-center p-8 bg-white rounded-2xl">
        <div className="w-full max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 text-center">
            Login to SHIFA
          </h2>

          <form onSubmit={handleLogin} className="space-y-4 mt-4">
            {/* Email */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-gray-400"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-gray-400"
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-200 hover:bg-gray-300 py-2 rounded disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <Separator className="my-4" />
          <GoogleLoginButton />

          <div className="text-center text-gray-600 text-sm mt-2">
            Don’t have an account?{" "}
            <Link href="/register" className="underline">
              Register
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
