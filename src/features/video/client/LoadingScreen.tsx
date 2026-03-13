import { Shield } from "lucide-react";

export default function LoadingScreen() {
  return (
    <div className="flex h-dvh w-full flex-col items-center justify-center gap-6 bg-background text-foreground">
      {/* Animated logo mark */}
      <div className="relative h-20 w-20">
        <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-primary" />
        <div className="absolute inset-2.5 flex items-center justify-center rounded-full bg-primary/15">
          <Shield className="h-7 w-7 text-primary" />
        </div>
      </div>
      <div className="text-center">
        <p className="text-base font-semibold text-foreground">
          Joining consultation…
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Setting up secure connection
        </p>
      </div>
      {/* Animated dots */}
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary"
            style={{ animationDelay: `${i * 0.18}s` }}
          />
        ))}
      </div>
    </div>
  );
}
