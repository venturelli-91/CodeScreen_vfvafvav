import {
	render,
	screen,
	within,
	waitForElementToBeRemoved,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "../test/setup";
import { createWrapper } from "../test/wrapper";
import WorkersPage from "./WorkersPage";

describe("WorkersPage", () => {
	const renderPage = () =>
		render(<WorkersPage />, { wrapper: createWrapper() });

	test("renders list of workers with name and trade", async () => {
		renderPage();
		expect(await screen.findByText("Alice Welder")).toBeInTheDocument();
		expect(await screen.findByText("Bob Driller")).toBeInTheDocument();
	});

	test("renders worker trade chips", async () => {
		renderPage();
		expect(await screen.findByText("Welder")).toBeInTheDocument();
		expect(await screen.findByText("Driller")).toBeInTheDocument();
	});

	test("shows empty state when no workers exist", async () => {
		server.use(http.get("/api/workers", () => HttpResponse.json([])));
		renderPage();
		expect(await screen.findByText(/no workers yet/i)).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /add first worker/i }),
		).toBeInTheDocument();
	});

	test("shows error banner when fetch fails", async () => {
		server.use(
			http.get("/api/workers", () =>
				HttpResponse.json({ message: "Server error" }, { status: 500 }),
			),
		);
		renderPage();
		expect(
			await screen.findByText(/failed to load workers/i),
		).toBeInTheDocument();
	});

	test("opens add worker dialog when clicking Add worker", async () => {
		const user = userEvent.setup();
		renderPage();
		await user.click(screen.getByRole("button", { name: /add worker/i }));
		expect(await screen.findByRole("dialog")).toBeInTheDocument();
		expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/trade/i)).toBeInTheDocument();
	});

	test("Add button is disabled when fields are empty", async () => {
		const user = userEvent.setup();
		renderPage();
		await user.click(screen.getByRole("button", { name: /add worker/i }));
		const addBtn = await screen.findByRole("button", { name: /^add$/i });
		expect(addBtn).toBeDisabled();
	});

	test("submits form and shows success toast", async () => {
		const user = userEvent.setup();
		renderPage();
		await user.click(screen.getByRole("button", { name: /add worker/i }));
		await user.type(await screen.findByLabelText(/name/i), "Carol Driller");
		await user.type(screen.getByLabelText(/trade/i), "Driller");
		await user.click(screen.getByRole("button", { name: /^add$/i }));
		expect(
			await screen.findByText(/worker added successfully/i),
		).toBeInTheDocument();
	});

	test("closes dialog on Cancel click", async () => {
		const user = userEvent.setup();
		renderPage();
		await user.click(screen.getByRole("button", { name: /add worker/i }));
		const dialog = await screen.findByRole("dialog");
		const cancelBtn = within(dialog).getByRole("button", { name: /cancel/i });
		await user.click(cancelBtn);
		await waitForElementToBeRemoved(() => screen.queryByRole("dialog"));
		expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
	});

	test("opens edit dialog and saves changes", async () => {
		const user = userEvent.setup();
		renderPage();
		const editBtn = await screen.findByRole("button", {
			name: /edit alice welder/i,
		});
		await user.click(editBtn);
		expect(
			await screen.findByRole("dialog", { name: /edit worker/i }),
		).toBeInTheDocument();
		const nameField = screen.getByLabelText(/name/i);
		await user.clear(nameField);
		await user.type(nameField, "Alice Smith");
		await user.click(screen.getByRole("button", { name: /save/i }));
		expect(await screen.findByText(/worker updated/i)).toBeInTheDocument();
	});

	test("opens delete dialog and removes a worker", async () => {
		const user = userEvent.setup();
		renderPage();
		const deleteBtn = await screen.findByRole("button", {
			name: /delete alice welder/i,
		});
		await user.click(deleteBtn);
		expect(
			await screen.findByRole("dialog", { name: /remove alice welder/i }),
		).toBeInTheDocument();
		await user.click(screen.getByRole("button", { name: /^remove$/i }));
		expect(await screen.findByText(/worker removed/i)).toBeInTheDocument();
	});

	test("shows error toast when delete API fails", async () => {
		server.use(
			http.delete("/api/workers/:id", () =>
				HttpResponse.json({ message: "Error" }, { status: 500 }),
			),
		);
		const user = userEvent.setup();
		renderPage();
		await user.click(
			await screen.findByRole("button", { name: /delete alice welder/i }),
		);
		await user.click(screen.getByRole("button", { name: /^remove$/i }));
		expect(
			await screen.findByText(/failed to remove worker/i),
		).toBeInTheDocument();
	});

	test("opens claims drawer when clicking a worker card", async () => {
		const user = userEvent.setup();
		renderPage();
		const card = await screen.findByText("Alice Welder");
		await user.click(card);
		expect(await screen.findByText(/claimed shifts/i)).toBeInTheDocument();
	});
});
