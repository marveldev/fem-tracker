import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import { motion } from "framer-motion"
import { CalendarPicker, Snackbar } from "../common"

const PeriodDateOnboarding = ({ setUserData }) => {
	const navigate = useNavigate()
	const [selectedDate, setSelectedDate] = useState(null)
	const [cycleLength, setCycleLength] = useState(28)
	const [periodLength, setPeriodLength] = useState(5)
	const [SnackbarIsVisible, setSnackbarIsVisible] = useState(false)

	useEffect(() => {
		const savedCycleLength = localStorage.getItem("cycleLength")
		const savedPeriodLength = localStorage.getItem("periodLength")

		if (savedCycleLength && savedPeriodLength) {
			setCycleLength(parseInt(savedCycleLength))
			setPeriodLength(parseInt(savedPeriodLength))
		} else {
			navigate("/onboarding/cycle-length")
		}
	}, [navigate])

	const handleSelectDate = (date) => {
		const isValid = date <= new Date()

		if (isValid) {
			setSelectedDate(date)
		} else {
			setSnackbarIsVisible(true)
		}

		return isValid
	}

	const handleSubmit = () => {
		if (!selectedDate) {
			return setSnackbarIsVisible(true)
		}

		const userData = {
			cycleLength,
			periodLength,
			lastPeriodStartDate: selectedDate.toISOString(),
		}

		// Clear localStorage items as they're no longer needed
		localStorage.removeItem("cycleLength")
		localStorage.removeItem("periodLength")

		setUserData(userData)
		navigate("/home")
	}

	const handleBack = () => {
		navigate("/onboarding/period-length")
	}

	return (
		<div className="flex flex-col">
			<header className="p-4 flex items-center">
				<button
					onClick={handleBack}
					className="p-2 rounded-full hover:bg-gray-100">
					<ArrowLeft size={24} className="text-gray-600" />
				</button>
				<div className="flex-1 flex justify-center">
					<div className="w-48 h-1 bg-gray-200 rounded-full overflow-hidden">
						<div className="h-full w-full bg-pink-500"></div>
					</div>
				</div>
				<div className="w-10"></div> {/* Spacer for balance */}
			</header>

			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				className="flex-1 flex flex-col items-center px-6 py-4">
				<h1 className="text-2xl font-bold mb-3 text-center">
					When did your last period start?
				</h1>
				<p className="text-[#393933] mb-6 text-center">
					Select the first day of your most recent period.
				</p>

				<div className="w-full mb-8">
					<CalendarPicker
						onSelectDate={handleSelectDate}
						selectedDate={selectedDate}
					/>
				</div>

				<div className="w-full max-w-xs mt-auto">
					<button
						onClick={handleSubmit}
						disabled={!selectedDate}
						className={`w-full py-3 rounded-full font-semibold transition-colors ${
							selectedDate
								? "bg-[#5B2333] text-white hover:bg-pink-700"
								: "bg-gray-300 text-[#0707079b] cursor-not-allowed"
						}`}>
						Submit
					</button>
				</div>
			</motion.div>

			<Snackbar
				message={"You can't log  periods for future dates"}
				isVisible={SnackbarIsVisible}
				onClose={() => setSnackbarIsVisible(false)}
			/>
		</div>
	)
}

export default PeriodDateOnboarding
