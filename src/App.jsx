import { useEffect, useState } from "react"
import {
	BrowserRouter as Router,
	Routes,
	Route,
	Navigate,
	useLocation,
} from "react-router-dom"
import { ContextProvider } from "./context/AppContext"
import { BottomNav, PageHeader, SnackbarProvider } from "./common"
import {
	Calendar,
	CycleLengthOnboarding,
	Home,
	PeriodDateOnboarding,
	PeriodLengthOnboarding,
	Settings,
	Welcome,
} from "./pages"

function AppContent({ userData, setUserData }) {
	const { pathname } = useLocation()
	const hiddenNavPaths = [
		"/",
		"/onboarding/cycle-length",
		"/onboarding/period-length",
		"/onboarding/period-date",
	]

	const handleDataSubmit = (data) => {
		setUserData(data)
	}

	return (
		<div className="app">
			{!hiddenNavPaths.includes(pathname) && <PageHeader />}

			<div className="absolute lg:w-[65%] m-auto left-0 right-0 h-full">
				<Routes>
					<Route
						path="/"
						element={userData ? <Navigate to="/home" /> : <Welcome />}
					/>
					<Route
						path="/onboarding/cycle-length"
						element={
							userData ? <Navigate to="/home" /> : <CycleLengthOnboarding />
						}
					/>
					<Route
						path="/onboarding/period-length"
						element={
							userData ? <Navigate to="/home" /> : <PeriodLengthOnboarding />
						}
					/>
					<Route
						path="/onboarding/period-date"
						element={
							userData ? (
								<Navigate to="/home" />
							) : (
								<PeriodDateOnboarding onDataSubmit={handleDataSubmit} />
							)
						}
					/>
					<Route path="/calendar" element={<Calendar />} />
					<Route path="/settings" element={<Settings />} />
					<Route path="/home" element={<Home />} />
				</Routes>
				{!hiddenNavPaths.includes(pathname) && (
					<>
						<div className="text-center text-xs mt-24">
							FemTrack - Your privacy-first period tracker © 2025
						</div>
						<div className="h-40 lg:h-40" />
					</>
				)}
			</div>

			{!hiddenNavPaths.includes(pathname) && <BottomNav />}
		</div>
	)
}

function App() {
	const [userData, setUserData] = useState(() => {
		const savedData = localStorage.getItem("userData")
		return savedData ? JSON.parse(savedData) : null
	})

	useEffect(() => {
		if (userData) {
			localStorage.setItem("userData", JSON.stringify(userData))
		}
	}, [userData])

	return (
		<ContextProvider>
			<SnackbarProvider>
				<Router>
					<AppContent userData={userData} setUserData={setUserData} />
				</Router>
			</SnackbarProvider>
		</ContextProvider>
	)
}

export default App
