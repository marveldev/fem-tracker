import { useEffect, useState } from "react"
import {
	BrowserRouter as Router,
	Routes,
	Route,
	Navigate,
	useLocation,
} from "react-router-dom"
import { ContextProvider } from "./context/AppContext"
import { BottomNav, PageHeader } from "./common"
import {
	Calendar,
	CycleLengthOnboarding,
	Home,
	NotFound,
	PeriodDateOnboarding,
	PeriodLengthOnboarding,
	Settings,
	Track,
	Welcome,
} from "./pages"

function AppContent({ userData, setUserData, showSnackbar }) {
	const { pathname } = useLocation()

	const hiddenNavPaths = [
		"/",
		"/onboarding/cycle-length",
		"/onboarding/period-length",
		"/onboarding/period-date",
	]

	const showHeaderAndFooter = !hiddenNavPaths.includes(pathname)

	const handleDataSubmit = (data) => {
		setUserData(data)
		showSnackbar("Your data has been saved successfully!")
	}

	return (
		<div className="app">
			{showHeaderAndFooter && <PageHeader />}

			<div className="absolute left-0 right-0 m-auto h-full lg:w-[65%]">
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
								<PeriodDateOnboarding setUserData={setUserData} />
							)
						}
					/>
					<Route path="/calendar" element={<Calendar />} />
					<Route path="/track/" element={<Track />} />
					<Route path="/track/:date" element={<Track />} />
					<Route path="/settings" element={<Settings />} />
					<Route path="/home" element={<Home />} />
					<Route path="*" element={<NotFound />} />
				</Routes>

				{showHeaderAndFooter && (
					<>
						<div className="mt-24 text-center text-xs">
							FemTracker - Your privacy-first period tracker © 2025
						</div>
						<div className="h-40 lg:h-40" />
					</>
				)}
			</div>

			{showHeaderAndFooter && <BottomNav />}
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
			<Router>
				<AppContent userData={userData} setUserData={setUserData} />
			</Router>
		</ContextProvider>
	)
}

export default App
