import Logo from "@/components/Navigation/Navbar/Logo/Logo";
import Link from "next/link";

import React from "react";

function Register() {
  return (
    <div className="flex flex-col-reverse md:flex-row items-center md:mt-5 shadow-2xl bg-gray-100 rounded-2xl">
      {/* Left side - registration form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white rounded-2xl hover:scale-101 transition ease-in">
        <div className="w-full max-w-md space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 text-center">
            Register to SHIFA
          </h2>
          <p className="text-center text-gray-600 text-sm">
            Create your account to access telemedicine services
          </p>

          <form className="space-y-4">
            {/* Name */}
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

            {/* File upload */}
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
            Already have an account?
            <Link href="/login" className="underline">
              Login
            </Link>
          </div>
        </div>
      </div>

      {/* Right side - content */}
      <div className="flex-1 flex items-center justify-center p-12 hover:scale-101 transition ease-in">
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
    </div>
  );
}

export default Register;
