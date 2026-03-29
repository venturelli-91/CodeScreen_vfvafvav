import { Component } from "react";
import type { ReactNode, ErrorInfo } from "react";
import { Box, Button, Typography } from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

interface Props {
	children: ReactNode;
}

interface State {
	hasError: boolean;
	message: string;
}

export class ErrorBoundary extends Component<Props, State> {
	state: State = { hasError: false, message: "" };

	static getDerivedStateFromError(error: Error): State {
		return { hasError: true, message: error.message };
	}

	componentDidCatch(error: Error, info: ErrorInfo) {
		console.error("[ErrorBoundary]", error, info.componentStack);
	}

	reset = () => this.setState({ hasError: false, message: "" });

	render() {
		if (!this.state.hasError) return this.props.children;

		return (
			<Box
				role="alert"
				sx={{
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					gap: 2,
					py: 10,
					textAlign: "center",
				}}>
				<WarningAmberIcon sx={{ fontSize: 48, color: "error.main" }} />
				<Typography
					variant="h6"
					color="error">
					Something went wrong
				</Typography>
				<Typography
					variant="body2"
					color="text.secondary"
					sx={{ maxWidth: 320 }}>
					{this.state.message || "An unexpected error occurred."}
				</Typography>
				<Button
					variant="outlined"
					color="error"
					onClick={this.reset}>
					Try again
				</Button>
			</Box>
		);
	}
}
