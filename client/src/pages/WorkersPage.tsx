import { useState } from "react";
import {
	Alert,
	Avatar,
	Box,
	Button,
	Card,
	CardContent,
	Chip,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	Divider,
	Drawer,
	IconButton,
	Snackbar,
	TextField,
	Tooltip,
	Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { motion } from "framer-motion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";
import type { Worker } from "../types";

function initials(name: string) {
	return name
		.split(" ")
		.map((n) => n[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);
}

function WorkerCardSkeleton() {
	return (
		<Box
			sx={{
				borderRadius: 2,
				border: "1px solid rgba(232,97,44,0.14)",
				p: 3,
				background: "rgba(18,7,3,0.78)",
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				gap: 1.5,
			}}>
			<Box
				sx={{
					width: 56,
					height: 56,
					borderRadius: "50%",
					bgcolor: "rgba(232,97,44,0.15)",
					animation: "pulse 1.5s ease-in-out infinite",
				}}
			/>
			<Box
				sx={{
					width: "60%",
					height: 16,
					borderRadius: 1,
					bgcolor: "rgba(232,97,44,0.08)",
					animation: "pulse 1.5s ease-in-out infinite",
				}}
			/>
			<Box
				sx={{
					width: "40%",
					height: 20,
					borderRadius: 2,
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

export default function WorkersPage() {
	const qc = useQueryClient();
	const [open, setOpen] = useState(false);
	const [name, setName] = useState("");
	const [trade, setTrade] = useState("");

	// Edit state
	const [editWorker, setEditWorker] = useState<Worker | null>(null);
	const [editName, setEditName] = useState("");
	const [editTrade, setEditTrade] = useState("");

	// Delete state
	const [deleteWorker, setDeleteWorker] = useState<Worker | null>(null);

	// Claims drawer
	const [drawerWorker, setDrawerWorker] = useState<Worker | null>(null);

	const [toast, setToast] = useState<{
		open: boolean;
		message: string;
		severity: "success" | "error";
	}>({
		open: false,
		message: "",
		severity: "success",
	});

	const showToast = (msg: string, severity: "success" | "error") =>
		setToast({ open: true, message: msg, severity });

	const {
		data: workers,
		isLoading,
		isError,
	} = useQuery({
		queryKey: ["workers"],
		queryFn: () => api.workers.list(),
	});

	const { data: claims, isLoading: claimsLoading } = useQuery({
		queryKey: ["workerClaims", drawerWorker?.id],
		queryFn: () => api.workers.claims(drawerWorker!.id),
		enabled: !!drawerWorker,
	});

	const createWorker = useMutation({
		mutationFn: api.workers.create,
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["workers"] });
			setOpen(false);
			setName("");
			setTrade("");
			showToast("Worker added successfully!", "success");
		},
		onError: () => showToast("Failed to add worker.", "error"),
	});

	const updateWorker = useMutation({
		mutationFn: ({
			id,
			body,
		}: {
			id: string;
			body: { name?: string; trade?: string };
		}) => api.workers.update(id, body),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["workers"] });
			setEditWorker(null);
			showToast("Worker updated.", "success");
		},
		onError: () => showToast("Failed to update worker.", "error"),
	});

	const deleteWorkerMutation = useMutation({
		mutationFn: (id: string) => api.workers.remove(id),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["workers"] });
			setDeleteWorker(null);
			showToast("Worker removed.", "success");
		},
		onError: () => {
			setDeleteWorker(null);
			showToast("Failed to remove worker.", "error");
		},
	});

	const fmtShift = (d: string) =>
		new Date(d).toLocaleString("en-US", {
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});

	return (
		<Box>
			<Box
				sx={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					mb: 2,
				}}>
				<Typography
					component="h1"
					variant="h5"
					sx={{
						color: "text.primary",
						textShadow: "0 2px 12px rgba(0,0,0,0.8)",
					}}>
					Workers
				</Typography>
				<motion.div
					whileHover={{ scale: 1.02 }}
					whileTap={{ scale: 0.98 }}
					transition={{ type: "spring", stiffness: 400, damping: 17 }}>
					<Button
						variant="contained"
						size="small"
						onClick={() => setOpen(true)}>
						Add worker
					</Button>
				</motion.div>
			</Box>

			{isError && (
				<Alert
					severity="error"
					sx={{ mb: 2 }}>
					Failed to load workers. Please refresh and try again.
				</Alert>
			)}

			{isLoading ? (
				<Box
					sx={{
						display: "grid",
						gridTemplateColumns: {
							xs: "1fr 1fr",
							sm: "repeat(3, 1fr)",
							md: "repeat(auto-fill, minmax(180px, 1fr))",
						},
						gap: 2,
					}}>
					{[...Array(6)].map((_, i) => (
						<WorkerCardSkeleton key={i} />
					))}
				</Box>
			) : workers?.length === 0 ? (
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
						No workers yet
					</Typography>
					<Typography
						variant="body2"
						color="text.secondary">
						Add your first worker to start assigning shifts.
					</Typography>
					<Button
						variant="contained"
						onClick={() => setOpen(true)}>
						Add first worker
					</Button>
				</Box>
			) : (
				<Box
					component={motion.div}
					variants={containerVariants}
					initial="hidden"
					animate="visible"
					sx={{
						display: "grid",
						gridTemplateColumns: {
							xs: "1fr 1fr",
							sm: "repeat(3, 1fr)",
							md: "repeat(auto-fill, minmax(180px, 1fr))",
						},
						gap: 2,
					}}>
					{workers?.map((w) => (
						<motion.div
							key={w.id}
							variants={cardVariants}>
							<Card
								sx={{
									height: "100%",
									cursor: "pointer",
									"&:hover .worker-actions": { opacity: 1 },
								}}
								onClick={() => setDrawerWorker(w)}>
								<CardContent
									sx={{
										display: "flex",
										flexDirection: "column",
										alignItems: "center",
										gap: 1.5,
										py: 3,
										position: "relative",
									}}>
									{/* Edit / Delete icons */}
									<Box
										className="worker-actions"
										sx={{
											position: "absolute",
											top: 6,
											right: 6,
											display: "flex",
											gap: 0.5,
											opacity: 0,
											transition: "opacity 0.15s",
										}}
										onClick={(e) => e.stopPropagation()}>
										<Tooltip title="Edit">
											<IconButton
												size="small"
												aria-label={`Edit ${w.name}`}
												onClick={() => {
													setEditWorker(w);
													setEditName(w.name);
													setEditTrade(w.trade);
												}}>
												<EditOutlinedIcon sx={{ fontSize: 16 }} />
											</IconButton>
										</Tooltip>
										<Tooltip title="Delete">
											<IconButton
												size="small"
												color="error"
												aria-label={`Delete ${w.name}`}
												onClick={() => setDeleteWorker(w)}>
												<DeleteOutlineIcon sx={{ fontSize: 16 }} />
											</IconButton>
										</Tooltip>
									</Box>

									<Avatar
										sx={{
											bgcolor: "primary.main",
											width: 56,
											height: 56,
											fontSize: "1.1rem",
											fontWeight: 700,
										}}
										aria-hidden="true">
										{initials(w.name)}
									</Avatar>
									<Box sx={{ textAlign: "center" }}>
										<Typography variant="subtitle1">{w.name}</Typography>
										<Chip
											label={w.trade}
											size="small"
											variant="outlined"
											color="primary"
											sx={{ mt: 0.5 }}
										/>
									</Box>
								</CardContent>
							</Card>
						</motion.div>
					))}
				</Box>
			)}

			{/* Add worker dialog */}
			<Dialog
				open={open}
				onClose={() => setOpen(false)}
				fullWidth
				maxWidth="xs"
				aria-labelledby="add-worker-dialog-title">
				<DialogTitle id="add-worker-dialog-title">Add a worker</DialogTitle>
				<DialogContent
					sx={{
						display: "flex",
						flexDirection: "column",
						gap: 2,
						pt: "16px !important",
					}}>
					<TextField
						label="Name"
						value={name}
						onChange={(e) => setName(e.target.value)}
						size="small"
						inputProps={{ "aria-required": true }}
					/>
					<TextField
						label="Trade"
						value={trade}
						onChange={(e) => setTrade(e.target.value)}
						placeholder="e.g. Welder"
						size="small"
						inputProps={{ "aria-required": true }}
					/>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setOpen(false)}>Cancel</Button>
					<Button
						variant="contained"
						disabled={!name || !trade || createWorker.isPending}
						onClick={() => createWorker.mutate({ name, trade })}>
						{createWorker.isPending ? "Adding…" : "Add"}
					</Button>
				</DialogActions>
			</Dialog>

			{/* Edit worker dialog */}
			<Dialog
				open={!!editWorker}
				onClose={() => setEditWorker(null)}
				fullWidth
				maxWidth="xs"
				aria-labelledby="edit-worker-dialog-title">
				<DialogTitle id="edit-worker-dialog-title">Edit worker</DialogTitle>
				<DialogContent
					sx={{
						display: "flex",
						flexDirection: "column",
						gap: 2,
						pt: "16px !important",
					}}>
					<TextField
						label="Name"
						value={editName}
						onChange={(e) => setEditName(e.target.value)}
						size="small"
						inputProps={{ "aria-required": true }}
					/>
					<TextField
						label="Trade"
						value={editTrade}
						onChange={(e) => setEditTrade(e.target.value)}
						size="small"
						inputProps={{ "aria-required": true }}
					/>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setEditWorker(null)}>Cancel</Button>
					<Button
						variant="contained"
						disabled={!editName || !editTrade || updateWorker.isPending}
						onClick={() =>
							editWorker &&
							updateWorker.mutate({
								id: editWorker.id,
								body: { name: editName, trade: editTrade },
							})
						}>
						{updateWorker.isPending ? "Saving…" : "Save"}
					</Button>
				</DialogActions>
			</Dialog>

			{/* Delete confirmation dialog */}
			<Dialog
				open={!!deleteWorker}
				onClose={() => setDeleteWorker(null)}
				maxWidth="xs"
				fullWidth
				aria-labelledby="delete-worker-title">
				<DialogTitle id="delete-worker-title">
					Remove {deleteWorker?.name}?
				</DialogTitle>
				<DialogContent>
					<DialogContentText>
						This will permanently remove <strong>{deleteWorker?.name}</strong>{" "}
						and unassign them from any claimed shifts. This action cannot be
						undone.
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setDeleteWorker(null)}>Keep worker</Button>
					<Button
						color="error"
						variant="contained"
						disabled={deleteWorkerMutation.isPending}
						onClick={() =>
							deleteWorker && deleteWorkerMutation.mutate(deleteWorker.id)
						}>
						{deleteWorkerMutation.isPending ? "Removing…" : "Remove"}
					</Button>
				</DialogActions>
			</Dialog>

			{/* Claims history drawer */}
			<Drawer
				anchor="right"
				open={!!drawerWorker}
				onClose={() => setDrawerWorker(null)}
				PaperProps={{
					sx: {
						width: { xs: "100%", sm: 380 },
						background: "rgba(12,5,2,0.97)",
						backdropFilter: "blur(20px)",
						borderLeft: "1px solid rgba(232,97,44,0.18)",
						p: 3,
					},
				}}>
				<Box
					sx={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						mb: 3,
					}}>
					<Box>
						<Typography variant="h6">{drawerWorker?.name}</Typography>
						<Chip
							label={drawerWorker?.trade}
							size="small"
							color="primary"
							variant="outlined"
							sx={{ mt: 0.5 }}
						/>
					</Box>
					<IconButton
						onClick={() => setDrawerWorker(null)}
						aria-label="Close shift history">
						<CloseIcon />
					</IconButton>
				</Box>
				<Typography
					variant="subtitle2"
					color="text.secondary"
					sx={{
						mb: 2,
						textTransform: "uppercase",
						letterSpacing: "0.08em",
						fontSize: "0.7rem",
					}}>
					Claimed Shifts ({claims?.length ?? 0})
				</Typography>
				{claimsLoading ? (
					<Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
						{[...Array(3)].map((_, i) => (
							<Box
								key={i}
								sx={{
									height: 72,
									borderRadius: 2,
									bgcolor: "rgba(232,97,44,0.08)",
									animation: "pulse 1.5s ease-in-out infinite",
								}}
							/>
						))}
					</Box>
				) : claims?.length === 0 ? (
					<Typography
						color="text.secondary"
						variant="body2">
						No shifts claimed yet.
					</Typography>
				) : (
					<Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
						{claims?.map((shift) => (
							<Box
								key={shift.id}
								sx={{
									p: 1.5,
									borderRadius: 2,
									border: "1px solid rgba(232,97,44,0.14)",
									bgcolor: "rgba(18,7,3,0.6)",
								}}>
								<Box
									sx={{
										display: "flex",
										justifyContent: "space-between",
										mb: 0.5,
									}}>
									<Typography
										variant="body2"
										fontWeight={600}>
										{shift.workplace?.name ?? "—"}
									</Typography>
									<Chip
										label={shift.trade}
										size="small"
										variant="outlined"
										color="primary"
									/>
								</Box>
								<Divider sx={{ my: 0.75 }} />
								<Box
									sx={{
										display: "flex",
										alignItems: "center",
										gap: 0.5,
										color: "text.secondary",
									}}>
									<AccessTimeIcon
										sx={{ fontSize: 13 }}
										aria-hidden="true"
									/>
									<Typography variant="caption">
										{fmtShift(shift.start)} → {fmtShift(shift.end)}
									</Typography>
								</Box>
							</Box>
						))}
					</Box>
				)}
			</Drawer>

			<Snackbar
				open={toast.open}
				autoHideDuration={4000}
				onClose={() => setToast((t) => ({ ...t, open: false }))}
				anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
				aria-live="polite">
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
