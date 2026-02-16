import Link from "next/link";
import React from "react";

const page = () => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row py-10  shadow-2xl">
      {/* Left side - content */}
      <div className="flex bg-gray-100 items-center justify-center p-12">
        <div className="space-y-6">
          <h1 className="text-4xl font-bold text-gray-900">SHIFA</h1>
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

      {/* Right side - login form */}
      <div className="flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 text-center">
            Login to SHIFA
          </h2>
          <p className="text-center text-gray-600 text-sm">
            Enter your credentials to access your account
          </p>

          <form className="space-y-4">
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
              Login
            </button>
          </form>

          {/* Footer */}
          <div className="text-center text-gray-600 text-sm">
            Don’t have an account?{" "}
            <a href="/register" className="underline">
              Register
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
