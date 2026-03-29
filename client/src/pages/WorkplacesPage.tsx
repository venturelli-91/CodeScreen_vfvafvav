import { useState } from "react";
import {
	Alert,
	Box,
	Button,
	Card,
	CardActions,
	CardContent,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	IconButton,
	Snackbar,
	TextField,
	Tooltip,
	Typography,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { motion } from "framer-motion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";
import type { Workplace } from "../types";

function WorkplaceCardSkeleton() {
	return (
		<Box
			sx={{
				borderRadius: 2,
				border: "1px solid rgba(232,97,44,0.14)",
				p: 2,
				background: "rgba(18,7,3,0.78)",
			}}>
			<Box
				sx={{
					width: "65%",
					height: 18,
					borderRadius: 1,
					bgcolor: "rgba(232,97,44,0.12)",
					mb: 1,
					animation: "pulse 1.5s ease-in-out infinite",
				}}
			/>
			<Box
				sx={{
					width: "85%",
					height: 14,
					borderRadius: 1,
					bgcolor: "rgba(232,97,44,0.08)",
					mb: 2,
					animation: "pulse 1.5s ease-in-out infinite",
				}}
			/>
			<Box
				sx={{
					width: 80,
					height: 30,
					borderRadius: 1,
					bgcolor: "rgba(232,97,44,0.12)",
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

export default function WorkplacesPage() {
	const qc = useQueryClient();

	const [shiftOpen, setShiftOpen] = useState(false);
	const [selectedWorkplaceId, setSelectedWorkplaceId] = useState("");
	const [selectedWorkplaceName, setSelectedWorkplaceName] = useState("");
	const [start, setStart] = useState("");
	const [end, setEnd] = useState("");
	const [trade, setTrade] = useState("");

	const [wpOpen, setWpOpen] = useState(false);
	const [wpName, setWpName] = useState("");
	const [wpAddress, setWpAddress] = useState("");

	// Edit state
	const [editWp, setEditWp] = useState<Workplace | null>(null);
	const [editName, setEditName] = useState("");
	const [editAddress, setEditAddress] = useState("");

	// Delete state
	const [deleteWp, setDeleteWp] = useState<Workplace | null>(null);

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

	const { data: workplaces, isLoading } = useQuery({
		queryKey: ["workplaces"],
		queryFn: () => api.workplaces.list(),
	});

	const createShift = useMutation({
		mutationFn: api.shifts.create,
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["shifts"] });
			setShiftOpen(false);
			setStart("");
			setEnd("");
			setTrade("");
			showToast("Shift posted successfully!", "success");
		},
		onError: () => showToast("Failed to post shift.", "error"),
	});

	const createWorkplace = useMutation({
		mutationFn: api.workplaces.create,
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["workplaces"] });
			setWpOpen(false);
			setWpName("");
			setWpAddress("");
			showToast("Workplace added successfully!", "success");
		},
		onError: () => showToast("Failed to add workplace.", "error"),
	});

	const updateWorkplace = useMutation({
		mutationFn: ({
			id,
			body,
		}: {
			id: string;
			body: { name?: string; address?: string };
		}) => api.workplaces.update(id, body),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["workplaces"] });
			setEditWp(null);
			showToast("Workplace updated.", "success");
		},
		onError: () => showToast("Failed to update workplace.", "error"),
	});

	const deleteWorkplace = useMutation({
		mutationFn: (id: string) => api.workplaces.remove(id),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["workplaces"] });
			setDeleteWp(null);
			showToast("Workplace removed.", "success");
		},
		onError: (err: Error) => {
			setDeleteWp(null);
			const msg = err.message.includes("409")
				? "Cannot delete a workplace that has shifts."
				: "Failed to remove workplace.";
			showToast(msg, "error");
		},
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
					variant="h5"
					sx={{
						color: "text.primary",
						textShadow: "0 2px 12px rgba(0,0,0,0.8)",
					}}>
					Workplaces
				</Typography>
				<motion.div
					whileHover={{ scale: 1.02 }}
					whileTap={{ scale: 0.98 }}
					transition={{ type: "spring", stiffness: 400, damping: 17 }}>
					<Button
						variant="contained"
						size="small"
						onClick={() => setWpOpen(true)}>
						Add workplace
					</Button>
				</motion.div>
			</Box>

			{isLoading ? (
				<Box
					sx={{
						display: "grid",
						gridTemplateColumns: {
							xs: "1fr",
							sm: "1fr 1fr",
							md: "repeat(auto-fill, minmax(240px, 1fr))",
						},
						gap: 2,
					}}>
					{[...Array(4)].map((_, i) => (
						<WorkplaceCardSkeleton key={i} />
					))}
				</Box>
			) : workplaces?.length === 0 ? (
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
						No workplaces yet
					</Typography>
					<Typography
						variant="body2"
						color="text.secondary">
						Add your first workplace to start posting shifts.
					</Typography>
					<Button
						variant="contained"
						onClick={() => setWpOpen(true)}>
						Add first workplace
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
							xs: "1fr",
							sm: "1fr 1fr",
							md: "repeat(auto-fill, minmax(240px, 1fr))",
						},
						gap: 2,
					}}>
					{workplaces?.map((wp) => (
						<motion.div
							key={wp.id}
							variants={cardVariants}>
							<Card
								sx={{ height: "100%", "&:hover .wp-actions": { opacity: 1 } }}>
								<CardContent sx={{ pb: 1, position: "relative" }}>
									{/* Edit / Delete icons */}
									<Box
										className="wp-actions"
										sx={{
											position: "absolute",
											top: 6,
											right: 6,
											display: "flex",
											gap: 0.5,
											opacity: 0,
											transition: "opacity 0.15s",
										}}>
										<Tooltip title="Edit">
											<IconButton
												size="small"
												aria-label={`Edit ${wp.name}`}
												onClick={() => {
													setEditWp(wp);
													setEditName(wp.name);
													setEditAddress(wp.address);
												}}>
												<EditOutlinedIcon sx={{ fontSize: 16 }} />
											</IconButton>
										</Tooltip>
										<Tooltip title="Delete">
											<IconButton
												size="small"
												color="error"
												aria-label={`Delete ${wp.name}`}
												onClick={() => setDeleteWp(wp)}>
												<DeleteOutlineIcon sx={{ fontSize: 16 }} />
											</IconButton>
										</Tooltip>
									</Box>

									<Typography
										variant="subtitle1"
										sx={{ pr: 6 }}>
										{wp.name}
									</Typography>
									<Box
										sx={{
											display: "flex",
											alignItems: "center",
											gap: 0.5,
											mt: 0.5,
											color: "text.secondary",
										}}>
										<LocationOnIcon
											sx={{ fontSize: 15 }}
											aria-hidden="true"
										/>
										<Typography variant="body2">{wp.address}</Typography>
									</Box>
								</CardContent>
								<CardActions>
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
											aria-label={`Post shift at ${wp.name}`}
											onClick={() => {
												setSelectedWorkplaceId(wp.id);
												setSelectedWorkplaceName(wp.name);
												setShiftOpen(true);
											}}>
											Post shift
										</Button>
									</motion.div>
								</CardActions>
							</Card>
						</motion.div>
					))}
				</Box>
			)}

			{/* Add workplace dialog */}
			<Dialog
				open={wpOpen}
				onClose={() => setWpOpen(false)}
				fullWidth
				maxWidth="xs"
				aria-labelledby="add-workplace-dialog-title">
				<DialogTitle id="add-workplace-dialog-title">
					Add a workplace
				</DialogTitle>
				<DialogContent
					sx={{
						display: "flex",
						flexDirection: "column",
						gap: 2,
						pt: "16px !important",
					}}>
					<TextField
						label="Name"
						value={wpName}
						onChange={(e) => setWpName(e.target.value)}
						size="small"
						inputProps={{ "aria-required": true }}
					/>
					<TextField
						label="Address"
						value={wpAddress}
						onChange={(e) => setWpAddress(e.target.value)}
						placeholder="e.g. 1 Olympus Mons, Mars"
						size="small"
						inputProps={{ "aria-required": true }}
					/>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setWpOpen(false)}>Cancel</Button>
					<Button
						variant="contained"
						disabled={!wpName || !wpAddress || createWorkplace.isPending}
						onClick={() =>
							createWorkplace.mutate({ name: wpName, address: wpAddress })
						}>
						{createWorkplace.isPending ? "Adding…" : "Add"}
					</Button>
				</DialogActions>
			</Dialog>

			{/* Edit workplace dialog */}
			<Dialog
				open={!!editWp}
				onClose={() => setEditWp(null)}
				fullWidth
				maxWidth="xs"
				aria-labelledby="edit-workplace-dialog-title">
				<DialogTitle id="edit-workplace-dialog-title">
					Edit workplace
				</DialogTitle>
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
						label="Address"
						value={editAddress}
						onChange={(e) => setEditAddress(e.target.value)}
						size="small"
						inputProps={{ "aria-required": true }}
					/>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setEditWp(null)}>Cancel</Button>
					<Button
						variant="contained"
						disabled={!editName || !editAddress || updateWorkplace.isPending}
						onClick={() =>
							editWp &&
							updateWorkplace.mutate({
								id: editWp.id,
								body: { name: editName, address: editAddress },
							})
						}>
						{updateWorkplace.isPending ? "Saving…" : "Save"}
					</Button>
				</DialogActions>
			</Dialog>

			{/* Delete confirmation dialog */}
			<Dialog
				open={!!deleteWp}
				onClose={() => setDeleteWp(null)}
				maxWidth="xs"
				fullWidth
				aria-labelledby="delete-workplace-title">
				<DialogTitle id="delete-workplace-title">
					Remove {deleteWp?.name}?
				</DialogTitle>
				<DialogContent>
					<DialogContentText>
						This will permanently remove <strong>{deleteWp?.name}</strong>.
						Workplaces with existing shifts cannot be deleted.
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setDeleteWp(null)}>Keep it</Button>
					<Button
						color="error"
						variant="contained"
						disabled={deleteWorkplace.isPending}
						onClick={() => deleteWp && deleteWorkplace.mutate(deleteWp.id)}>
						{deleteWorkplace.isPending ? "Removing…" : "Remove"}
					</Button>
				</DialogActions>
			</Dialog>

			{/* Post shift dialog */}
			<Dialog
				open={shiftOpen}
				onClose={() => setShiftOpen(false)}
				fullWidth
				maxWidth="xs"
				aria-labelledby="post-shift-dialog-title">
				<DialogTitle id="post-shift-dialog-title">
					Post a shift
					{selectedWorkplaceName ? ` at ${selectedWorkplaceName}` : ""}
				</DialogTitle>
				<DialogContent
					sx={{
						display: "flex",
						flexDirection: "column",
						gap: 2,
						pt: "16px !important",
					}}>
					<TextField
						label="Trade"
						value={trade}
						onChange={(e) => setTrade(e.target.value)}
						placeholder="e.g. Welder"
						size="small"
						inputProps={{ "aria-required": true }}
					/>
					<TextField
						label="Start time"
						type="datetime-local"
						value={start}
						onChange={(e) => setStart(e.target.value)}
						InputLabelProps={{ shrink: true }}
						size="small"
						inputProps={{ "aria-required": true }}
					/>
					<TextField
						label="End time"
						type="datetime-local"
						value={end}
						onChange={(e) => setEnd(e.target.value)}
						InputLabelProps={{ shrink: true }}
						size="small"
						inputProps={{ "aria-required": true }}
					/>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setShiftOpen(false)}>Cancel</Button>
					<Button
						variant="contained"
						disabled={!start || !end || !trade || createShift.isPending}
						onClick={() =>
							createShift.mutate({
								workplaceId: selectedWorkplaceId,
								start: new Date(start).toISOString(),
								end: new Date(end).toISOString(),
								trade,
							})
						}>
						{createShift.isPending ? "Posting…" : "Post"}
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
