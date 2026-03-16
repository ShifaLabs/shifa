import { AlertCircle, RefreshCw } from "lucide-react";

export default function ErrorScreen({ message, onRetry }) {
  return (
    <div className="flex h-dvh w-full items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-2xl border border-destructive/25 bg-destructive/10 p-8 text-center shadow-2xl">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/15">
          <AlertCircle className="h-7 w-7 text-destructive" />
        </div>
        <h2 className="mb-2 text-lg font-semibold text-foreground">
          Unable to join
        </h2>
        <p className="mb-6 text-sm leading-relaxed text-destructive/90">
          {message}
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 active:scale-95"
        >
          <RefreshCw className="h-4 w-4" />
          Try again
        </button>
      </div>
    </div>
  );
}
