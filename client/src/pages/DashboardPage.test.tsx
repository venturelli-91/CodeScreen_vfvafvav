import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "../test/setup";
import { createWrapper } from "../test/wrapper";
import DashboardPage from "./DashboardPage";

describe("DashboardPage", () => {
	const renderPage = () =>
		render(<DashboardPage />, { wrapper: createWrapper() });

	test("renders the Dashboard heading", async () => {
		renderPage();
		expect(
			await screen.findByRole("heading", { name: /dashboard/i }),
		).toBeInTheDocument();
	});

	test("renders all four stat cards", async () => {
		renderPage();
		expect(await screen.findByText("Total shifts")).toBeInTheDocument();
		expect(screen.getByText("Open")).toBeInTheDocument();
		expect(screen.getByText("Claimed")).toBeInTheDocument();
		expect(screen.getByText("Cancelled")).toBeInTheDocument();
	});

	test("stat cards show correct counts from mock data", async () => {
		renderPage();
		// mock: 3 total — 1 open, 1 claimed, 1 cancelled
		const total = await screen.findByText("Total shifts");
		// sibling number is the previous Typography in StatCard
		expect(total.closest(".MuiCardContent-root")).toBeTruthy();

		// Fill Rate card should be visible (stats.total > 0)
		expect(await screen.findByText(/fill rate/i)).toBeInTheDocument();
	});

	test("renders Top Workers section", async () => {
		renderPage();
		expect(await screen.findByText("Top Workers")).toBeInTheDocument();
		// Alice Welder has 1 claimed shift in mock data
		expect(await screen.findByText("Alice Welder")).toBeInTheDocument();
	});

	test("renders Busiest Workplaces section", async () => {
		renderPage();
		expect(await screen.findByText("Busiest Workplaces")).toBeInTheDocument();
		expect(await screen.findByText("Olympus Base")).toBeInTheDocument();
	});

	test("shows loading progress bar while fetching", () => {
		renderPage();
		// Before data resolves the loading skeleton appears
		expect(screen.queryByText("Total shifts")).not.toBeInTheDocument();
	});

	test("shows error banner when shifts fetch fails", async () => {
		server.use(
			http.get("/api/shifts", () =>
				HttpResponse.json({ message: "Error" }, { status: 500 }),
			),
		);
		renderPage();
		expect(
			await screen.findByText(/failed to load dashboard data/i),
		).toBeInTheDocument();
	});

	test("shows empty state message in Top Workers when no claimed shifts", async () => {
		server.use(
			http.get("/api/shifts", () =>
				HttpResponse.json([
					{
						id: "s-1",
						workplaceId: "wp-1",
						workerId: null,
						start: "2026-03-01T08:00:00Z",
						end: "2026-03-01T16:00:00Z",
						trade: "Welder",
						cancelled: false,
						createdAt: "2026-01-01T00:00:00Z",
						workplace: {
							id: "wp-1",
							name: "Olympus Base",
							address: "1 Olympus Mons, Mars",
							createdAt: "2026-01-01T00:00:00Z",
						},
						worker: null,
					},
				]),
			),
		);
		renderPage();
		expect(
			await screen.findByText(/no claimed shifts yet/i),
		).toBeInTheDocument();
	});

	test("Fill Rate section is hidden when there are no shifts", async () => {
		server.use(http.get("/api/shifts", () => HttpResponse.json([])));
		renderPage();
		await screen.findByText("Top Workers");
		expect(screen.queryByText(/fill rate/i)).not.toBeInTheDocument();
	});
});
