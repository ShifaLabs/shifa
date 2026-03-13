"use client";

import { Shield } from "lucide-react";

export default function LoadingScreen() {
	return (
		<div className="relative flex h-dvh w-full flex-col items-center justify-center gap-6 overflow-hidden bg-background text-foreground">
			<div className="absolute -left-32 -top-32 h-64 w-64 animate-pulse rounded-full bg-primary/10 blur-3xl" />
			<div
				className="absolute -right-32 -bottom-32 h-64 w-64 animate-pulse rounded-full bg-accent/20 blur-3xl"
				style={{ animationDelay: "1s" }}
			/>

			<div className="relative z-10">
				<div className="mb-4 relative h-24 w-24">
					<div
						className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-primary border-r-primary/50"
						style={{ animationDuration: "3s" }}
					/>

					<div
						className="absolute inset-2 animate-spin rounded-full border-2 border-transparent border-b-primary/50"
						style={{ animationDuration: "2s", animationDirection: "reverse" }}
					/>

					<div className="absolute inset-0 flex items-center justify-center">
						<div className="relative">
							<div className="absolute inset-0 animate-pulse rounded-2xl bg-primary/20 blur-md" />
							<div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-primary to-primary/70">
								<Shield className="h-7 w-7 text-primary-foreground" />
							</div>
						</div>
					</div>
				</div>
			</div>

			<div className="relative z-10 text-center space-y-3">
				<h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
					Joining Consultation
				</h1>
				<p className="max-w-xs text-sm font-medium text-muted-foreground">
					Securing your connection and initializing video stream
				</p>
			</div>

			<div className="relative z-10 flex gap-2">
				{[0, 1, 2].map((i) => (
					<div
						key={i}
						className="h-2 w-2 animate-bounce rounded-full bg-primary"
						style={{
							animationDelay: `${i * 0.15}s`,
							animationDuration: "1.4s",
						}}
					/>
				))}
			</div>

			<div className="relative z-10 mt-6 text-xs font-medium text-muted-foreground">
				Setting up secure WebRTC connection...
			</div>
		</div>
	);
}
