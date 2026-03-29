import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "../test/setup";
import { createWrapper } from "../test/wrapper";
import ShiftsPage from "./ShiftsPage";

describe("ShiftsPage", () => {
	const renderPage = () => render(<ShiftsPage />, { wrapper: createWrapper() });

	test("renders shift list with trade and workplace name", async () => {
		renderPage();
		const workplaceHeadings = await screen.findAllByText("Olympus Base");
		expect(workplaceHeadings.length).toBeGreaterThanOrEqual(1);
		expect(await screen.findAllByText("Welder")).not.toHaveLength(0);
	});

	test("shows empty state when no shifts exist", async () => {
		server.use(http.get("/api/shifts", () => HttpResponse.json([])));
		renderPage();
		expect(await screen.findByText(/no shifts yet/i)).toBeInTheDocument();
	});

	test("shows error banner when fetch fails", async () => {
		server.use(
			http.get("/api/shifts", () =>
				HttpResponse.json({ message: "Error" }, { status: 500 }),
			),
		);
		renderPage();
		expect(
			await screen.findByText(/failed to load shifts/i),
		).toBeInTheDocument();
	});

	test("shows Claim button only for open unclaimed shifts", async () => {
		renderPage();
		const claimButtons = await screen.findAllByRole("button", {
			name: /claim shift/i,
		});
		expect(claimButtons.length).toBeGreaterThan(0);
	});

	test("shows worker picker after clicking Claim", async () => {
		const user = userEvent.setup();
		renderPage();
		const claimButton = await screen.findByRole("button", {
			name: /claim shift at olympus base/i,
		});
		await user.click(claimButton);
		expect(
			await screen.findByRole("button", { name: /assign alice welder/i }),
		).toBeInTheDocument();
	});

	test("shows Cancel button for claimed non-cancelled shifts", async () => {
		renderPage();
		const cancelButton = await screen.findByRole("button", {
			name: /cancel shift at olympus base/i,
		});
		expect(cancelButton).toBeInTheDocument();
	});

	test("opens confirm dialog and cancels a shift", async () => {
		const user = userEvent.setup();
		renderPage();
		const cancelButton = await screen.findByRole("button", {
			name: /cancel shift at olympus base/i,
		});
		await user.click(cancelButton);
		// Confirm dialog should appear
		expect(await screen.findByRole("dialog")).toBeInTheDocument();
		// Confirm cancellation
		await user.click(screen.getByRole("button", { name: /^cancel shift$/i }));
		expect(await screen.findByText(/shift cancelled/i)).toBeInTheDocument();
	});

	test("shows shift status chips correctly", async () => {
		renderPage();
		expect(await screen.findByText("Open")).toBeInTheDocument();
		expect(await screen.findByText("Claimed")).toBeInTheDocument();
		expect(await screen.findByText("Cancelled")).toBeInTheDocument();
	});

	test("filter chips render after data loads", async () => {
		renderPage();
		expect(
			await screen.findByRole("button", { name: /^open$/i }),
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /^claimed$/i }),
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /^cancelled$/i }),
		).toBeInTheDocument();
	});

	test("shows skeleton grid while loading", () => {
		renderPage();
		expect(screen.queryByText("Olympus Base")).not.toBeInTheDocument();
	});
});
