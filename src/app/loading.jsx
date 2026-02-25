export default function Loading() {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-linear-to-br from-secondary/20 via-white to-secondary/10 overflow-hidden">
      {/* Background Blur Circle */}
      <div className="absolute w-72 h-72 bg-primary/20 rounded-full blur-3xl top-10 left-10"></div>
      <div className="absolute w-72 h-72 bg-secondary/30 rounded-full blur-3xl bottom-10 right-10"></div>

      <div className="relative bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl p-12 flex flex-col items-center space-y-6 border border-primary/20">
        {/* Animated Spinner */}
        <div className="relative">
          <div className="w-20 h-20 border-4 border-primary/30 rounded-full"></div>
          <div className="absolute top-0 left-0 w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>

        {/* Text */}
        <h2 className="text-2xl font-semibold text-primary">
          Shifa লোড হচ্ছে...
        </h2>

        <p className="text-gray-600 text-center max-w-xs">
          অনুগ্রহ করে অপেক্ষা করুন। আমরা আপনার জন্য সেরা স্বাস্থ্যসেবা প্রস্তুত
          করছি।
        </p>

        {/* Animated Dots */}
        <div className="flex space-x-2">
          <span className="w-3 h-3 bg-primary rounded-full animate-bounce"></span>
          <span className="w-3 h-3 bg-primary rounded-full animate-bounce delay-150"></span>
          <span className="w-3 h-3 bg-primary rounded-full animate-bounce delay-300"></span>
        </div>
      </div>
    </div>
  );
}
