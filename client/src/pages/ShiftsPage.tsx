import { useMemo, useState } from "react";
import {
	Alert,
	Box,
	Button,
	Card,
	CardActions,
	CardContent,
	Chip,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	Divider,
	InputAdornment,
	Snackbar,
	TextField,
	Typography,
} from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PersonIcon from "@mui/icons-material/Person";
import SearchIcon from "@mui/icons-material/Search";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";
import type { Worker, Shift } from "../types";

const fmt = (d: string) =>
	new Date(d).toLocaleString("en-US", {
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});

type StatusFilter = "all" | "open" | "claimed" | "cancelled";

function shiftStatus(cancelled: boolean, workerId: string | null) {
	if (cancelled) return { label: "Cancelled", color: "error" as const };
	if (workerId) return { label: "Claimed", color: "warning" as const };
	return { label: "Open", color: "success" as const };
}

function ShiftCardSkeleton() {
	return (
		<Box
			sx={{
				borderRadius: 2,
				border: "1px solid rgba(232,97,44,0.14)",
				p: 2,
				background: "rgba(18,7,3,0.78)",
			}}>
			<Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
				<Box
					sx={{
						width: 70,
						height: 22,
						borderRadius: 1,
						bgcolor: "rgba(232,97,44,0.12)",
						animation: "pulse 1.5s ease-in-out infinite",
					}}
				/>
				<Box
					sx={{
						width: 60,
						height: 22,
						borderRadius: 1,
						bgcolor: "rgba(232,97,44,0.12)",
						animation: "pulse 1.5s ease-in-out infinite",
					}}
				/>
			</Box>
			<Box
				sx={{
					width: "70%",
					height: 18,
					borderRadius: 1,
					bgcolor: "rgba(232,97,44,0.08)",
					mb: 1,
					animation: "pulse 1.5s ease-in-out infinite",
				}}
			/>
			<Box
				sx={{
					width: "90%",
					height: 14,
					borderRadius: 1,
					bgcolor: "rgba(232,97,44,0.08)",
					mb: 1.5,
					animation: "pulse 1.5s ease-in-out infinite",
				}}
			/>
			<Divider sx={{ my: 1 }} />
			<Box
				sx={{
					width: "50%",
					height: 14,
					borderRadius: 1,
					bgcolor: "rgba(232,97,44,0.08)",
					animation: "pulse 1.5s ease-in-out infinite",
				}}
			/>
		</Box>
	);
}

const containerVariants = {
	hidden: {},
	visible: { transition: { staggerChildren: 0.07 } },
};

const cardVariants = {
	hidden: { opacity: 0, y: 20 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
	},
};

interface WorkerPickerProps {
	shift: Shift;
	eligible: Worker[];
	onPick: (workerId: string) => void;
	isPending: boolean;
}

function WorkerPicker({
	shift,
	eligible,
	onPick,
	isPending,
}: WorkerPickerProps) {
	const [search, setSearch] = useState("");

	const filtered = useMemo(
		() =>
			eligible.filter((w) =>
				w.name.toLowerCase().includes(search.toLowerCase()),
			),
		[eligible, search],
	);

	if (eligible.length === 0) {
		return (
			<Typography
				variant="caption"
				color="text.secondary"
				sx={{ px: 1 }}>
				No eligible workers
			</Typography>
		);
	}

	return (
		<Box sx={{ width: "100%" }}>
			{eligible.length > 4 && (
				<TextField
					size="small"
					placeholder="Search workers…"
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					sx={{ mb: 1, width: "100%" }}
					InputProps={{
						startAdornment: (
							<InputAdornment position="start">
								<SearchIcon sx={{ fontSize: 16 }} />
							</InputAdornment>
						),
					}}
					inputProps={{ "aria-label": "Search eligible workers" }}
				/>
			)}
			<Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
				<AnimatePresence>
					{filtered.map((w) => (
						<motion.div
							key={w.id}
							initial={{ opacity: 0, scale: 0.9 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.9 }}
							transition={{ type: "spring", stiffness: 400, damping: 17 }}>
							<Button
								size="small"
								variant="outlined"
								onClick={() => onPick(w.id)}
								disabled={isPending}
								aria-label={`Assign ${w.name} to shift at ${shift.workplace?.name ?? "this workplace"}`}>
								{w.name}
							</Button>
						</motion.div>
					))}
				</AnimatePresence>
				{filtered.length === 0 && (
					<Typography
						variant="caption"
						color="text.secondary">
						No match
					</Typography>
				)}
			</Box>
		</Box>
	);
}

export default function ShiftsPage() {
	const qc = useQueryClient();
	const navigate = useNavigate();
	const [claimingId, setClaimingId] = useState<string | null>(null);
	const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);
	const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
	const [tradeFilter, setTradeFilter] = useState<string>("all");
	const [toast, setToast] = useState<{
		open: boolean;
		message: string;
		severity: "success" | "error";
	}>({
		open: false,
		message: "",
		severity: "success",
	});

	const showToast = (message: string, severity: "success" | "error") =>
		setToast({ open: true, message, severity });

	const { data: shifts, isLoading } = useQuery({
		queryKey: ["shifts"],
		queryFn: () => api.shifts.list(),
	});

	const { data: workers } = useQuery({
		queryKey: ["workers"],
		queryFn: () => api.workers.list(),
	});

	const workersByTrade = useMemo(() => {
		const map = new Map<string, Worker[]>();
		for (const w of workers ?? []) {
			const list = map.get(w.trade) ?? [];
			list.push(w);
			map.set(w.trade, list);
		}
		return map;
	}, [workers]);

	const allTrades = useMemo(() => {
		const trades = new Set((shifts ?? []).map((s) => s.trade));
		return Array.from(trades).sort();
	}, [shifts]);

	const filteredShifts = useMemo(() => {
		return (shifts ?? []).filter((s) => {
			const matchStatus =
				statusFilter === "all" ||
				(statusFilter === "cancelled" && s.cancelled) ||
				(statusFilter === "claimed" && !s.cancelled && !!s.workerId) ||
				(statusFilter === "open" && !s.cancelled && !s.workerId);
			const matchTrade = tradeFilter === "all" || s.trade === tradeFilter;
			return matchStatus && matchTrade;
		});
	}, [shifts, statusFilter, tradeFilter]);

	const claim = useMutation({
		mutationFn: ({
			shiftId,
			workerId,
		}: {
			shiftId: string;
			workerId: string;
		}) => api.shifts.claim(shiftId, workerId),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["shifts"] });
			setClaimingId(null);
			showToast("Shift claimed successfully!", "success");
		},
		onError: () => showToast("Failed to claim shift.", "error"),
	});

	const cancel = useMutation({
		mutationFn: (shiftId: string) => api.shifts.cancel(shiftId),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["shifts"] });
			setConfirmCancelId(null);
			showToast("Shift cancelled.", "success");
		},
		onError: () => {
			setConfirmCancelId(null);
			showToast("Failed to cancel shift.", "error");
		},
	});

	const confirmingShift = shifts?.find((s) => s.id === confirmCancelId);

	return (
		<Box>
			<Typography
				variant="h5"
				gutterBottom
				sx={{
					color: "text.primary",
					textShadow: "0 2px 12px rgba(0,0,0,0.8)",
				}}>
				Shifts
			</Typography>

			{/* Filter bar */}
			{!isLoading && (shifts?.length ?? 0) > 0 && (
				<Box sx={{ mb: 2, display: "flex", flexDirection: "column", gap: 1 }}>
					<Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap" }}>
						{(["all", "open", "claimed", "cancelled"] as StatusFilter[]).map(
							(s) => (
								<Chip
									key={s}
									label={s.charAt(0).toUpperCase() + s.slice(1)}
									size="small"
									clickable
									onClick={() => setStatusFilter(s)}
									color={statusFilter === s ? "primary" : "default"}
									variant={statusFilter === s ? "filled" : "outlined"}
								/>
							),
						)}
					</Box>
					{allTrades.length > 1 && (
						<Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap" }}>
							<Chip
								label="All trades"
								size="small"
								clickable
								onClick={() => setTradeFilter("all")}
								color={tradeFilter === "all" ? "secondary" : "default"}
								variant={tradeFilter === "all" ? "filled" : "outlined"}
							/>
							{allTrades.map((t) => (
								<Chip
									key={t}
									label={t}
									size="small"
									clickable
									onClick={() => setTradeFilter(t)}
									color={tradeFilter === t ? "secondary" : "default"}
									variant={tradeFilter === t ? "filled" : "outlined"}
								/>
							))}
						</Box>
					)}
				</Box>
			)}

			{isLoading ? (
				<Box
					sx={{
						display: "grid",
						gridTemplateColumns: {
							xs: "1fr",
							sm: "1fr 1fr",
							md: "repeat(auto-fill, minmax(280px, 1fr))",
						},
						gap: 2,
					}}>
					{[...Array(6)].map((_, i) => (
						<ShiftCardSkeleton key={i} />
					))}
				</Box>
			) : shifts?.length === 0 ? (
				<Box
					sx={{
						textAlign: "center",
						py: 8,
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						gap: 2,
					}}>
					<Typography
						variant="h6"
						color="text.secondary">
						No shifts yet
					</Typography>
					<Typography
						variant="body2"
						color="text.secondary">
						Head to Workplaces to post your first shift.
					</Typography>
					<Button
						variant="contained"
						onClick={() => navigate("/workplaces")}>
						Go to Workplaces →
					</Button>
				</Box>
			) : (
				<>
					{filteredShifts.length === 0 ? (
						<Typography
							color="text.secondary"
							sx={{ py: 4, textAlign: "center" }}>
							No shifts match the selected filters.
						</Typography>
					) : (
						<Box
							component={motion.div}
							variants={containerVariants}
							initial="hidden"
							animate="visible"
							sx={{
								display: "grid",
								gridTemplateColumns: {
									xs: "1fr",
									sm: "1fr 1fr",
									md: "repeat(auto-fill, minmax(280px, 1fr))",
								},
								gap: 2,
							}}>
							{filteredShifts.map((shift) => {
								const status = shiftStatus(shift.cancelled, shift.workerId);
								const eligible = workersByTrade.get(shift.trade) ?? [];
								return (
									<motion.div
										key={shift.id}
										variants={cardVariants}>
										<Card sx={{ height: "100%" }}>
											<CardContent sx={{ pb: 1 }}>
												<Box
													sx={{
														display: "flex",
														justifyContent: "space-between",
														alignItems: "center",
														mb: 1.5,
													}}>
													<Chip
														label={shift.trade}
														size="small"
														variant="outlined"
														color="primary"
													/>
													<Chip
														label={status.label}
														size="small"
														color={status.color}
													/>
												</Box>
												<Typography
													variant="subtitle1"
													noWrap>
													{shift.workplace?.name ?? "—"}
												</Typography>
												<Box
													sx={{
														display: "flex",
														alignItems: "center",
														gap: 0.5,
														mt: 1,
														color: "text.secondary",
													}}>
													<AccessTimeIcon
														sx={{ fontSize: 15 }}
														aria-hidden="true"
													/>
													<Typography variant="body2">
														{fmt(shift.start)} → {fmt(shift.end)}
													</Typography>
												</Box>
												<Divider sx={{ my: 1.5 }} />
												<Box
													sx={{
														display: "flex",
														alignItems: "center",
														gap: 0.5,
														color: "text.secondary",
													}}>
													<PersonIcon
														sx={{ fontSize: 15 }}
														aria-hidden="true"
													/>
													<Typography variant="body2">
														{shift.worker?.name ?? "Unassigned"}
													</Typography>
												</Box>
											</CardContent>

											{shift.cancelled ? null : (
												<CardActions sx={{ pt: 0, flexWrap: "wrap", gap: 0.5 }}>
													{!shift.workerId ? (
														claimingId === shift.id ? (
															<WorkerPicker
																shift={shift}
																eligible={eligible}
																onPick={(workerId) =>
																	claim.mutate({ shiftId: shift.id, workerId })
																}
																isPending={claim.isPending}
															/>
														) : (
															<motion.div
																whileHover={{ scale: 1.02 }}
																whileTap={{ scale: 0.98 }}
																transition={{
																	type: "spring",
																	stiffness: 400,
																	damping: 17,
																}}>
																<Button
																	size="small"
																	variant="contained"
																	onClick={() => setClaimingId(shift.id)}
																	aria-label={`Claim shift at ${shift.workplace?.name ?? "this workplace"}`}>
																	Claim
																</Button>
															</motion.div>
														)
													) : (
														<motion.div
															whileHover={{ scale: 1.02 }}
															whileTap={{ scale: 0.98 }}
															transition={{
																type: "spring",
																stiffness: 400,
																damping: 17,
															}}>
															<Button
																size="small"
																color="error"
																variant="outlined"
																onClick={() => setConfirmCancelId(shift.id)}
																aria-label={`Cancel shift at ${shift.workplace?.name ?? "this workplace"}`}>
																Cancel
															</Button>
														</motion.div>
													)}
												</CardActions>
											)}
										</Card>
									</motion.div>
								);
							})}
						</Box>
					)}
				</>
			)}

			{/* Confirm cancel dialog */}
			<Dialog
				open={!!confirmCancelId}
				onClose={() => setConfirmCancelId(null)}
				maxWidth="xs"
				fullWidth
				aria-labelledby="confirm-cancel-title">
				<DialogTitle id="confirm-cancel-title">Cancel this shift?</DialogTitle>
				<DialogContent>
					<DialogContentText>
						This will unassign{" "}
						<strong>{confirmingShift?.worker?.name ?? "the worker"}</strong> and
						mark the shift at{" "}
						<strong>
							{confirmingShift?.workplace?.name ?? "this workplace"}
						</strong>{" "}
						as cancelled. This action cannot be undone.
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setConfirmCancelId(null)}>Keep shift</Button>
					<Button
						color="error"
						variant="contained"
						disabled={cancel.isPending}
						onClick={() => confirmCancelId && cancel.mutate(confirmCancelId)}>
						{cancel.isPending ? "Cancelling…" : "Yes, cancel"}
					</Button>
				</DialogActions>
			</Dialog>

			<Snackbar
				open={toast.open}
				autoHideDuration={4000}
				onClose={() => setToast((t) => ({ ...t, open: false }))}
				anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
				<Alert
					severity={toast.severity}
					onClose={() => setToast((t) => ({ ...t, open: false }))}
					sx={{ width: "100%" }}>
					{toast.message}
				</Alert>
			</Snackbar>
		</Box>
	);
}
