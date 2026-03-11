import { AlertCircle, RefreshCw } from "lucide-react";

export default function ErrorScreen({ message, onRetry }) {
  return (
    <div className="h-dvh w-full bg-[#0A0A0B] flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-red-400/20 bg-red-500/8 p-8 text-center shadow-2xl">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/15">
          <AlertCircle className="h-7 w-7 text-red-400" />
        </div>
        <h2 className="mb-2 text-lg font-semibold text-white">
          Unable to join
        </h2>
        <p className="mb-6 text-sm leading-relaxed text-red-200/80">
          {message}
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 rounded-xl bg-[#1F6F68] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#1a5e58] active:scale-95"
        >
          <RefreshCw className="h-4 w-4" />
          Try again
        </button>
      </div>
    </div>
  );
}
