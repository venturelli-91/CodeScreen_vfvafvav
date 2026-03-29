import {
	BrowserRouter,
	Link,
	Navigate,
	Route,
	Routes,
	useLocation,
	useNavigate,
} from "react-router-dom";
import {
	AppBar,
	BottomNavigation,
	BottomNavigationAction,
	Container,
	Paper,
	Tab,
	Tabs,
	Toolbar,
	Typography,
	useMediaQuery,
	useTheme,
} from "@mui/material";
import BusinessIcon from "@mui/icons-material/Business";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import ScheduleIcon from "@mui/icons-material/Schedule";
import ShiftsPage from "./pages/ShiftsPage";
import WorkplacesPage from "./pages/WorkplacesPage";
import WorkersPage from "./pages/WorkersPage";
import DashboardPage from "./pages/DashboardPage";

const NAV = [
	{ label: "Dashboard", path: "/dashboard", icon: <DashboardIcon /> },
	{ label: "Shifts", path: "/shifts", icon: <ScheduleIcon /> },
	{ label: "Workplaces", path: "/workplaces", icon: <BusinessIcon /> },
	{ label: "Workers", path: "/workers", icon: <PeopleIcon /> },
];

function Nav() {
	const { pathname } = useLocation();
	const navigate = useNavigate();
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
	const current = NAV.findIndex((n) => pathname.startsWith(n.path));
	const activeIndex = current === -1 ? 0 : current;

	if (isMobile) {
		return (
			<Paper
				component="nav"
				aria-label="Main navigation"
				sx={{
					position: "fixed",
					bottom: 0,
					left: 0,
					right: 0,
					zIndex: 1100,
					background: "rgba(10, 4, 2, 0.94)",
					backdropFilter: "blur(14px)",
					borderTop: "1px solid rgba(232, 97, 44, 0.2)",
					pb: "env(safe-area-inset-bottom)",
				}}
				elevation={0}>
				<BottomNavigation
					value={activeIndex}
					onChange={(_, val) => navigate(NAV[val].path)}
					sx={{ background: "transparent", height: 58 }}>
					{NAV.map((n, i) => (
						<BottomNavigationAction
							key={n.path}
							label={n.label}
							icon={n.icon}
							aria-current={activeIndex === i ? "page" : undefined}
							sx={{
								color: "text.secondary",
								minWidth: 64,
								"&.Mui-selected": { color: "primary.main" },
							}}
						/>
					))}
				</BottomNavigation>
			</Paper>
		);
	}

	return (
		<AppBar
			component="header"
			position="sticky"
			sx={{ top: 0 }}>
			<Toolbar sx={{ gap: 2 }}>
				<Typography
					variant="h6"
					sx={{
						letterSpacing: "0.04em",
						color: "#e8612c",
						whiteSpace: "nowrap",
					}}>
					Red Planet
				</Typography>
				<Tabs
					value={activeIndex}
					textColor="inherit"
					indicatorColor="secondary"
					aria-label="Main navigation">
					{NAV.map((n, i) => (
						<Tab
							key={n.path}
							label={n.label}
							component={Link}
							to={n.path}
							aria-current={activeIndex === i ? "page" : undefined}
						/>
					))}
				</Tabs>
			</Toolbar>
		</AppBar>
	);
}

export default function App() {
	return (
		<BrowserRouter>
			<Nav />
			<Container
				component="main"
				id="main-content"
				maxWidth="lg"
				sx={{
					mt: { xs: 2, sm: 4 },
					pb: { xs: "90px", sm: 4 } /* space for bottom nav on mobile */,
					px: { xs: 1.5, sm: 3 },
				}}>
				<Routes>
					<Route
						path="/"
						element={
							<Navigate
								to="/dashboard"
								replace
							/>
						}
					/>
					<Route
						path="/dashboard"
						element={<DashboardPage />}
					/>
					<Route
						path="/shifts"
						element={<ShiftsPage />}
					/>
					<Route
						path="/workplaces"
						element={<WorkplacesPage />}
					/>
					<Route
						path="/workers"
						element={<WorkersPage />}
					/>
				</Routes>
			</Container>
		</BrowserRouter>
	);
}
