import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { ContextProvider } from "./context/AppContext"
import { BottomNav, PageHeader, SnackbarProvider } from "./common"
import { Calendar, Home, Settings } from "./pages"

function App() {
	return (
		<ContextProvider>
			<SnackbarProvider>
				<Router>
					<div className="app">
						<PageHeader />
						<div className="absolute lg:w-[65%] w-[98%] m-auto top-8 left-0 right-0 h-full">
							<Routes>
								<Route path="/" element={<Home />} />
								<Route path="/calendar" element={<Calendar />} />
								<Route path="/settings" element={<Settings />} />
							</Routes>
							<div className="text-center text-xs mt-24">
								FemTrack- Your privacy first period tracker © 2025
							</div>
							<div className="h-40 lg:h-40" />
						</div>
						<BottomNav />
					</div>
				</Router>
			</SnackbarProvider>
		</ContextProvider>
	)
}

export default App
