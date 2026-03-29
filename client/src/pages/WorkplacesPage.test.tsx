import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "../test/setup";
import { createWrapper } from "../test/wrapper";
import WorkplacesPage from "./WorkplacesPage";

describe("WorkplacesPage", () => {
	const renderPage = () =>
		render(<WorkplacesPage />, { wrapper: createWrapper() });

	test("renders list of workplaces with name and address", async () => {
		renderPage();
		expect(await screen.findByText("Olympus Base")).toBeInTheDocument();
		expect(await screen.findByText("1 Olympus Mons, Mars")).toBeInTheDocument();
		expect(await screen.findByText("Valles Depot")).toBeInTheDocument();
	});

	test("shows empty state when no workplaces exist", async () => {
		server.use(http.get("/api/workplaces", () => HttpResponse.json([])));
		renderPage();
		expect(await screen.findByText(/no workplaces yet/i)).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /add first workplace/i }),
		).toBeInTheDocument();
	});

	test("shows error banner when fetch fails", async () => {
		server.use(
			http.get("/api/workplaces", () =>
				HttpResponse.json({ message: "Error" }, { status: 500 }),
			),
		);
		renderPage();
		expect(
			await screen.findByText(/failed to load workplaces/i),
		).toBeInTheDocument();
	});

	test("each workplace has a Post shift button", async () => {
		renderPage();
		const postButtons = await screen.findAllByRole("button", {
			name: /post shift at/i,
		});
		expect(postButtons).toHaveLength(2);
	});

	test("opens Add workplace dialog", async () => {
		const user = userEvent.setup();
		renderPage();
		await user.click(screen.getByRole("button", { name: /add workplace/i }));
		expect(await screen.findByRole("dialog")).toBeInTheDocument();
		expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/address/i)).toBeInTheDocument();
	});

	test("Add button is disabled when fields are empty", async () => {
		const user = userEvent.setup();
		renderPage();
		await user.click(screen.getByRole("button", { name: /add workplace/i }));
		const addBtn = await screen.findByRole("button", { name: /^add$/i });
		expect(addBtn).toBeDisabled();
	});

	test("submits add workplace form and shows success toast", async () => {
		const user = userEvent.setup();
		renderPage();
		await user.click(screen.getByRole("button", { name: /add workplace/i }));
		await user.type(await screen.findByLabelText(/name/i), "Hellas Base");
		await user.type(
			screen.getByLabelText(/address/i),
			"3 Hellas Planitia, Mars",
		);
		await user.click(screen.getByRole("button", { name: /^add$/i }));
		expect(
			await screen.findByText(/workplace added successfully/i),
		).toBeInTheDocument();
	});

	test("opens Post shift dialog with correct workplace in title", async () => {
		const user = userEvent.setup();
		renderPage();
		const postBtn = await screen.findByRole("button", {
			name: /post shift at olympus base/i,
		});
		await user.click(postBtn);
		expect(
			await screen.findByText(/post a shift at olympus base/i),
		).toBeInTheDocument();
	});

	test("Post button is disabled when shift fields are empty", async () => {
		const user = userEvent.setup();
		renderPage();
		const postBtn = await screen.findByRole("button", {
			name: /post shift at olympus base/i,
		});
		await user.click(postBtn);
		const submitBtn = await screen.findByRole("button", { name: /^post$/i });
		expect(submitBtn).toBeDisabled();
	});

	test("opens edit dialog and saves changes", async () => {
		const user = userEvent.setup();
		renderPage();
		const editBtn = await screen.findByRole("button", {
			name: /edit olympus base/i,
		});
		await user.click(editBtn);
		expect(
			await screen.findByRole("dialog", { name: /edit workplace/i }),
		).toBeInTheDocument();
		const nameField = screen.getByLabelText(/name/i);
		await user.clear(nameField);
		await user.type(nameField, "Olympus HQ");
		await user.click(screen.getByRole("button", { name: /save/i }));
		expect(await screen.findByText(/workplace updated/i)).toBeInTheDocument();
	});

	test("opens delete dialog and removes a workplace", async () => {
		const user = userEvent.setup();
		renderPage();
		const deleteBtn = await screen.findByRole("button", {
			name: /delete olympus base/i,
		});
		await user.click(deleteBtn);
		expect(
			await screen.findByRole("dialog", { name: /remove olympus base/i }),
		).toBeInTheDocument();
		await user.click(screen.getByRole("button", { name: /^remove$/i }));
		expect(await screen.findByText(/workplace removed/i)).toBeInTheDocument();
	});

	test("shows error toast when delete fails (e.g. 409)", async () => {
		server.use(
			http.delete("/api/workplaces/:id", () =>
				HttpResponse.json({ message: "Conflict" }, { status: 409 }),
			),
		);
		const user = userEvent.setup();
		renderPage();
		await user.click(
			await screen.findByRole("button", { name: /delete olympus base/i }),
		);
		await user.click(screen.getByRole("button", { name: /^remove$/i }));
		expect(
			await screen.findByText(/cannot delete a workplace that has shifts/i),
		).toBeInTheDocument();
	});
});
