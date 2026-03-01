import { CheckCircle2, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const EmailVerifiedToast = () => {
  return (
    <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="flex w-full max-w-sm items-start gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-xl dark:border-slate-800 dark:bg-slate-950">
        {/* Icon Section */}
        <div className="mt-0.5 rounded-full bg-green-100 p-1 dark:bg-green-900/30">
          <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
        </div>

        {/* Content Section */}
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
              Email Verified
            </p>
            <button className="text-slate-400 hover:text-slate-600 transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Your account is now active. Welcome to the platform!
          </p>

          <div className="pt-2">
            <Link href={"dashboard"}>
              <Button
                size="sm"
                variant="outline"
                className="h-8 px-3 text-xs font-medium"
              >
                Go to Dashboard
                <ArrowRight className="ml-2 h-3 w-3" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerifiedToast;
