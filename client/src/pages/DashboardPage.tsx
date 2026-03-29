import { useMemo } from "react";
import {
	Alert,
	Avatar,
	Box,
	Card,
	CardContent,
	Chip,
	Divider,
	LinearProgress,
	Typography,
} from "@mui/material";
import WorkIcon from "@mui/icons-material/Work";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api";

const cardVariants = {
	hidden: { opacity: 0, y: 16 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
	},
};
const containerVariants = {
	hidden: {},
	visible: { transition: { staggerChildren: 0.06 } },
};

function initials(name: string) {
	return name
		.split(" ")
		.map((n) => n[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);
}

function StatCard({
	icon,
	label,
	value,
	color,
}: {
	icon: React.ReactNode;
	label: string;
	value: number;
	color: string;
}) {
	return (
		<motion.div variants={cardVariants}>
			<Card>
				<CardContent
					sx={{ display: "flex", alignItems: "center", gap: 2, py: 2.5 }}>
					<Box
						sx={{
							width: 44,
							height: 44,
							borderRadius: 2,
							bgcolor: color,
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							flexShrink: 0,
						}}>
						{icon}
					</Box>
					<Box>
						<Typography
							variant="h5"
							fontWeight={700}
							lineHeight={1}>
							{value}
						</Typography>
						<Typography
							variant="caption"
							color="text.secondary"
							sx={{ mt: 0.25, display: "block" }}>
							{label}
						</Typography>
					</Box>
				</CardContent>
			</Card>
		</motion.div>
	);
}

export default function DashboardPage() {
	const {
		data: shifts,
		isLoading: shiftsLoading,
		isError: shiftsError,
	} = useQuery({
		queryKey: ["shifts"],
		queryFn: () => api.shifts.list(),
	});

	const {
		data: workers,
		isLoading: workersLoading,
		isError: workersError,
	} = useQuery({
		queryKey: ["workers"],
		queryFn: () => api.workers.list(),
	});

	const {
		data: workplaces,
		isLoading: workplacesLoading,
		isError: workplacesError,
	} = useQuery({
		queryKey: ["workplaces"],
		queryFn: () => api.workplaces.list(),
	});

	const isLoading = shiftsLoading || workersLoading || workplacesLoading;
	const isError = shiftsError || workersError || workplacesError;

	const stats = useMemo(() => {
		const all = shifts ?? [];
		return {
			total: all.length,
			open: all.filter((s) => !s.cancelled && !s.workerId).length,
			claimed: all.filter((s) => !s.cancelled && !!s.workerId).length,
			cancelled: all.filter((s) => s.cancelled).length,
		};
	}, [shifts]);

	/** Top 3 workers by number of claimed (non-cancelled) shifts */
	const topWorkers = useMemo(() => {
		const counts = new Map<string, number>();
		for (const s of shifts ?? []) {
			if (!s.cancelled && s.workerId && s.worker) {
				counts.set(s.workerId, (counts.get(s.workerId) ?? 0) + 1);
			}
		}
		return (workers ?? [])
			.map((w) => ({ ...w, count: counts.get(w.id) ?? 0 }))
			.filter((w) => w.count > 0)
			.sort((a, b) => b.count - a.count)
			.slice(0, 5);
	}, [shifts, workers]);

	/** Top 3 workplaces by total shifts */
	const topWorkplaces = useMemo(() => {
		const counts = new Map<string, number>();
		for (const s of shifts ?? []) {
			counts.set(s.workplaceId, (counts.get(s.workplaceId) ?? 0) + 1);
		}
		return (workplaces ?? [])
			.map((wp) => ({ ...wp, count: counts.get(wp.id) ?? 0 }))
			.filter((wp) => wp.count > 0)
			.sort((a, b) => b.count - a.count)
			.slice(0, 5);
	}, [shifts, workplaces]);

	const maxWorkerCount = topWorkers[0]?.count ?? 1;
	const maxWpCount = topWorkplaces[0]?.count ?? 1;

	if (isLoading) {
		return (
			<Box>
				<Typography
					component="h1"
					variant="h5"
					gutterBottom
					sx={{
						color: "text.primary",
						textShadow: "0 2px 12px rgba(0,0,0,0.8)",
					}}>
					Dashboard
				</Typography>
				<LinearProgress
					color="primary"
					sx={{ borderRadius: 1 }}
				/>
			</Box>
		);
	}

	return (
		<Box>
			<Typography
				component="h1"
				variant="h5"
				gutterBottom
				sx={{
					color: "text.primary",
					textShadow: "0 2px 12px rgba(0,0,0,0.8)",
				}}>
				Dashboard
			</Typography>

			{isError && (
				<Alert
					severity="error"
					sx={{ mb: 2 }}>
					Failed to load dashboard data. Please refresh and try again.
				</Alert>
			)}
			{/* Stat cards */}
			<Box
				component={motion.div}
				variants={containerVariants}
				initial="hidden"
				animate="visible"
				sx={{
					display: "grid",
					gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(4, 1fr)" },
					gap: 2,
					mb: 3,
				}}>
				<StatCard
					icon={<WorkIcon sx={{ color: "#fff", fontSize: 22 }} />}
					label="Total shifts"
					value={stats.total}
					color="rgba(232,97,44,0.35)"
				/>
				<StatCard
					icon={<LockOpenIcon sx={{ color: "#fff", fontSize: 22 }} />}
					label="Open"
					value={stats.open}
					color="rgba(46,213,115,0.25)"
				/>
				<StatCard
					icon={<CheckCircleOutlineIcon sx={{ color: "#fff", fontSize: 22 }} />}
					label="Claimed"
					value={stats.claimed}
					color="rgba(255,165,0,0.25)"
				/>
				<StatCard
					icon={<CancelOutlinedIcon sx={{ color: "#fff", fontSize: 22 }} />}
					label="Cancelled"
					value={stats.cancelled}
					color="rgba(220,53,69,0.25)"
				/>
			</Box>

			{/* Leaderboards */}
			<Box
				sx={{
					display: "grid",
					gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
					gap: 2,
				}}>
				{/* Top workers */}
				<motion.div
					variants={cardVariants}
					initial="hidden"
					animate="visible">
					<Card>
						<CardContent>
							<Box
								sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
								<PeopleAltIcon sx={{ color: "primary.main", fontSize: 20 }} />
								<Typography
									variant="subtitle1"
									fontWeight={600}>
									Top Workers
								</Typography>
							</Box>
							{topWorkers.length === 0 ? (
								<Typography
									variant="body2"
									color="text.secondary">
									No claimed shifts yet.
								</Typography>
							) : (
								<Box
									sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
									{topWorkers.map((w, i) => (
										<Box key={w.id}>
											<Box
												sx={{
													display: "flex",
													alignItems: "center",
													gap: 1.25,
													mb: 0.5,
												}}>
												<Typography
													variant="caption"
													color="text.secondary"
													sx={{ width: 16, textAlign: "center" }}>
													{i + 1}
												</Typography>
												<Avatar
													sx={{
														width: 28,
														height: 28,
														fontSize: "0.7rem",
														bgcolor: "primary.main",
													}}>
													{initials(w.name)}
												</Avatar>
												<Box sx={{ flex: 1, minWidth: 0 }}>
													<Typography
														variant="body2"
														noWrap
														fontWeight={500}>
														{w.name}
													</Typography>
												</Box>
												<Chip
													label={w.count}
													size="small"
													color="primary"
													variant="outlined"
													sx={{ minWidth: 42 }}
												/>
											</Box>
											<LinearProgress
												variant="determinate"
												value={(w.count / maxWorkerCount) * 100}
												sx={{ height: 4, borderRadius: 2, ml: "44px" }}
											/>
										</Box>
									))}
								</Box>
							)}
						</CardContent>
					</Card>
				</motion.div>

				{/* Top workplaces */}
				<motion.div
					variants={cardVariants}
					initial="hidden"
					animate="visible">
					<Card>
						<CardContent>
							<Box
								sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
								<LocationOnIcon sx={{ color: "primary.main", fontSize: 20 }} />
								<Typography
									variant="subtitle1"
									fontWeight={600}>
									Busiest Workplaces
								</Typography>
							</Box>
							{topWorkplaces.length === 0 ? (
								<Typography
									variant="body2"
									color="text.secondary">
									No shifts posted yet.
								</Typography>
							) : (
								<Box
									sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
									{topWorkplaces.map((wp, i) => (
										<Box key={wp.id}>
											<Box
												sx={{
													display: "flex",
													alignItems: "center",
													gap: 1.25,
													mb: 0.5,
												}}>
												<Typography
													variant="caption"
													color="text.secondary"
													sx={{ width: 16, textAlign: "center" }}>
													{i + 1}
												</Typography>
												<Box
													sx={{
														width: 28,
														height: 28,
														borderRadius: "50%",
														bgcolor: "rgba(232,97,44,0.18)",
														display: "flex",
														alignItems: "center",
														justifyContent: "center",
														flexShrink: 0,
													}}>
													<LocationOnIcon
														sx={{ fontSize: 15, color: "primary.main" }}
													/>
												</Box>
												<Box sx={{ flex: 1, minWidth: 0 }}>
													<Typography
														variant="body2"
														noWrap
														fontWeight={500}>
														{wp.name}
													</Typography>
													<Typography
														variant="caption"
														color="text.secondary"
														noWrap>
														{wp.address}
													</Typography>
												</Box>
												<Chip
													label={wp.count}
													size="small"
													color="primary"
													variant="outlined"
													sx={{ minWidth: 42 }}
												/>
											</Box>
											<LinearProgress
												variant="determinate"
												value={(wp.count / maxWpCount) * 100}
												sx={{ height: 4, borderRadius: 2, ml: "44px" }}
											/>
										</Box>
									))}
								</Box>
							)}
						</CardContent>
					</Card>
				</motion.div>
			</Box>

			{/* Fill rate */}
			{stats.total > 0 && (
				<motion.div
					variants={cardVariants}
					initial="hidden"
					animate="visible"
					style={{ marginTop: 16 }}>
					<Card>
						<CardContent>
							<Typography
								variant="subtitle1"
								fontWeight={600}
								sx={{ mb: 1.5 }}>
								Fill Rate
							</Typography>
							<Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
								<LinearProgress
									variant="determinate"
									value={
										stats.total > 0 ? (stats.claimed / stats.total) * 100 : 0
									}
									sx={{ flex: 1, height: 10, borderRadius: 5 }}
									color="success"
								/>
								<Typography
									variant="body2"
									fontWeight={600}
									sx={{ minWidth: 44, textAlign: "right" }}>
									{stats.total > 0
										? Math.round((stats.claimed / stats.total) * 100)
										: 0}
									%
								</Typography>
							</Box>
							<Divider sx={{ my: 1.5 }} />
							<Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
								<Typography
									variant="caption"
									color="text.secondary">
									{stats.claimed} of {stats.total} shifts filled
								</Typography>
								<Typography
									variant="caption"
									color="text.secondary">
									{workers?.length ?? 0} workers · {workplaces?.length ?? 0}{" "}
									workplaces
								</Typography>
							</Box>
						</CardContent>
					</Card>
				</motion.div>
			)}
		</Box>
	);
}
