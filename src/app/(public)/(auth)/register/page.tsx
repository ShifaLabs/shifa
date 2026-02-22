"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import GoogleLoginButton from "@/components/features/Auth/GoogleLoginButton";
import Logo from "@/components/Navigation/Shared/Logo/Logo";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          role: "patient",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message);
      }

      // After successful registration → redirect to login
      router.push("/login");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="relative flex flex-col md:flex-row items-center mt-20 shadow-2xl rounded-2xl bg-gray-100">
        {/* Back to Home Button */}
        <Link
          href="/"
          className="absolute top-6 left-6 text-sm text-gray-600 hover:text-black transition-colors"
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
              Your telemedicine platform. Connect with doctors anytime,
              anywhere.
            </p>
            <ul className="space-y-2 text-gray-600">
              <li>✔ Online consultations</li>
              <li>✔ Secure patient records</li>
              <li>✔ Easy appointment scheduling</li>
            </ul>
          </div>
        </div>

        {/* Right side - register form */}
        <div className="flex-1 items-center justify-center p-8 bg-white rounded-2xl hover:scale-102 transition ease-in">
          <div className="w-full max-w-md space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 text-center">
              Register to SHIFA
            </h2>
            <p className="text-center text-gray-600 text-sm">
              Create your account to access telemedicine services
            </p>

            <form className="space-y-4">
              {/* Full Name */}
              <div>
                <label
                  className="block text-gray-700 font-medium mb-1"
                  htmlFor="name"
                >
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  placeholder="John Doe"
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400"
                />
              </div>

              {/* Email */}
              <div>
                <label
                  className="block text-gray-700 font-medium mb-1"
                  htmlFor="email"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  placeholder="you@example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400"
                />
              </div>

              {/* Profile Photo */}
              <div>
                <label
                  className="block text-gray-700 font-medium mb-1"
                  htmlFor="file"
                >
                  Profile Photo
                </label>
                <input
                  type="file"
                  id="file"
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400"
                />
              </div>

              {/* Password */}
              <div>
                <label
                  className="block text-gray-700 font-medium mb-1"
                  htmlFor="password"
                >
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  placeholder="••••••••"
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium py-2 px-4 rounded transition-colors"
              >
                Register
              </button>
            </form>

            {/* Footer */}
            <div className="text-center text-gray-600 text-sm">
              Already have an account?{" "}
              <Link href="/login" className="underline">
                Login
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div>
        <form onSubmit={handleRegister} className=" flex flex-col">
          <input
            type="text"
            name="fullName"
            placeholder="Full Name"
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            required
          />

          {error && <p style={{ color: "red" }}>{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
        <GoogleLoginButton />
      </div>
    </>
  );
}
