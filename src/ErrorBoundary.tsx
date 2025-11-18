import React from "react";

const DISCORD_INVITE = "https://discord.gg/QGkKzNapXZ";

type State = {
	hasError: boolean;
	error?: Error | null;
	info?: React.ErrorInfo | null;
};

export default class ErrorBoundary extends React.Component<React.PropsWithChildren<{}>, State> {
	constructor(props: any) {
		super(props);
		this.state = { hasError: false, error: null, info: null };
	}

	static getDerivedStateFromError(error: Error) {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, info: React.ErrorInfo) {
		// Save stack info for showing/copying and basic logging
		this.setState({ error, info });
		// Also log to console so devs can see it in logs
		// In future this could POST to a backend or a webhook
		// but currently there's no webhook configured in the repo.
		// Keep this synchronous and safe.
		try {
			console.error("Uncaught error:", error, info);
		} catch (e) {
			// ignore
		}
	}

	reload = () => {
		try {
			window.location.reload();
		} catch (e) {
			// fallback
			window.location.href = window.location.href;
		}
	};

	openDiscord = () => {
		try {
			window.open(DISCORD_INVITE, "_blank");
		} catch (e) {
			// ignore
		}
	};

	copyDetails = async () => {
		const { error, info } = this.state;
		const payload = {
			message: error?.message || "No error message",
			stack: (error && (error.stack || "")) || "",
			componentStack: (info && info.componentStack) || "",
			userAgent: navigator.userAgent,
			time: new Date().toISOString(),
		};
		const text = JSON.stringify(payload, null, 2);
		try {
			await navigator.clipboard.writeText(text);
			// provide a small visual hint by temporarily changing title? keep simple
			// We don't show toast here to avoid adding new dependencies.
		} catch (e) {
			// ignore
		}
	};

	render() {
		if (!this.state.hasError) return this.props.children as React.ReactElement;

		const { error, info } = this.state;

		return (
			<div className="w-full h-full flex items-center justify-center bg-background game-font">
				<div className="max-w-2xl p-6 rounded-lg border border-muted-foreground/10 bg-card text-accent">
					<div className="text-2xl font-bold mb-2">Oops — we crashed</div>
					<div className="text-sm text-muted-foreground mb-4">Something went wrong and the app cannot continue.</div>

					{error && (
						<div className="mb-4 text-sm text-destructive break-words">
							<div className="font-medium">Error:</div>
							<pre className="whitespace-pre-wrap">{error.message}</pre>
						</div>
					)}

					<div className="flex gap-2 mb-4">
						<button
							className="bg-accent text-background px-3 py-1 rounded"
							onClick={this.reload}
							aria-label="Reload application"
						>
							Reload
						</button>

						<button
							className="border border-accent text-accent px-3 py-1 rounded"
							onClick={this.openDiscord}
							aria-label="Open Discord report link"
						>
							Open Discord (report)
						</button>

						<button
							className="border border-muted-foreground text-muted-foreground px-3 py-1 rounded"
							onClick={this.copyDetails}
							aria-label="Copy error details"
						>
							Copy details
						</button>
					</div>

					{info?.componentStack && (
						<details className="text-xs text-muted-foreground">
							<summary className="cursor-pointer">Component stack (expand)</summary>
							<pre className="whitespace-pre-wrap">{info.componentStack}</pre>
						</details>
					)}
				</div>
			</div>
		);
	}
}
