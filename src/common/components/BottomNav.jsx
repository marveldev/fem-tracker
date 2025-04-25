import React from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { Calendar, Home, Settings } from "lucide-react"

const BottomNav = () => {
	const location = useLocation()
	const navigate = useNavigate()

	const navItems = [
		{ path: "/", icon: Home, label: "Home" },
		{ path: "/calendar", icon: Calendar, label: "Calendar" },
		{ path: "/settings", icon: Settings, label: "Settings" },
	]

	return (
		<div className="fixed bottom-0 left-0 right-0 h-16 bg-[#fb6caa] shadow-lg border border-[#2e2e2e2e]">
			<div className="flex justify-around items-center">
				{navItems.map((item) => (
					<button
						key={item.path}
						onClick={() => navigate(item.path)}
						className={`flex flex-col items-center justify-center p-2 rounded-lg ${
							location.pathname === item.path
								? "text-[#000]"
								: "text-[#373737c3]"
						}`}>
						<item.icon
							size={24}
							className={
								location.pathname === item.path
									? "text-[#000]"
									: "text-[#373737c3]"
							}
						/>
						<span className="text-sm mt-1">{item.label}</span>
					</button>
				))}
			</div>
		</div>
	)
}

export default BottomNav
