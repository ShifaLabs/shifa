import GoogleLoginButton from "@/components/features/Auth/GoogleLoginButton";
import Logo from "@/components/Navigation/Shared/Logo/Logo";
import Link from "next/link";

const page = () => {
  return (
    <div className="flex flex-col md:flex-row items-center mt-20 shadow-2xl rounded-2xl bg-gray-100">
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

      {/* Right side - login form */}
      <div className="flex-1 items-center justify-center p-8 bg-white rounded-2xl hover:scale-102 transition ease-in">
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
            <Link href="/register" className="underline">
              Register
            </Link>
          </div>
        </div>
        <GoogleLoginButton />
      </div>
    </div>
  );
};

export default page;
