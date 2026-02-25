"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import GoogleLoginButton from "@/components/features/Auth/GoogleLoginButton";
import Logo from "@/components/Navigation/Shared/Logo/Logo";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { imageUpload } from "@/lib/imageUpload";
import PageTransition from "@/components/ui/PageTransition";

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    photoURL: "",
  });

  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Handle Input Change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle File Change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  // Handle Register
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let uploadedImageURL = "";

      // 1️⃣ Upload Image First (if exists)
      if (file) {
        uploadedImageURL = await imageUpload(file);
      }

      // 2️⃣ Send Data to API
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: form.fullName,
          email: form.email,
          password: form.password,
          photoURL: uploadedImageURL,
          role: "patient",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Registration failed");
      }

      // 3️⃣ Redirect
      router.push(`/verify-email?email=${encodeURIComponent(form.email)}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen relative flex flex-col md:flex-row items-center shadow-2xl rounded-2xl bg-gray-100">
        <Link
          href="/"
          className="absolute top-6 left-6 text-sm text-gray-600 hover:text-black transition-colors"
        >
          ← Back to Home
        </Link>

        {/* Left Section */}
        <div className="flex-1 p-12">
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

        {/* Right Section */}
        <div className="flex-1 p-8 bg-white rounded-2xl">
          <div className="w-full max-w-md mx-auto space-y-6">
            <h2 className="text-2xl font-bold text-center">
              Register to SHIFA
            </h2>

            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            <form className="space-y-4" onSubmit={handleRegister}>
              {/* Full Name */}
              <input
                type="text"
                name="fullName"
                placeholder="Full Name"
                value={form.fullName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded"
              />

              {/* Email */}
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded"
              />

              {/* Profile Photo */}
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full px-4 py-2 border rounded"
              />

              {/* Password */}
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded"
              />

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gray-900 text-white py-2 rounded hover:bg-gray-700 transition"
              >
                {loading ? "Registering..." : "Register"}
              </button>
            </form>

            <Separator />
            <GoogleLoginButton />

            <p className="text-center text-sm">
              Already have an account?{" "}
              <Link href="/login" className="underline">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
