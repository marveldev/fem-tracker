import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Save, Info, AlertTriangle } from "lucide-react"
import { motion } from "framer-motion"

const Settings = () => {
	const [userData, setUserData] = useState(null)
	const [cycleLength, setCycleLength] = useState("")
	const [periodLength, setPeriodLength] = useState("")
	const [trackingGoal, setTrackingGoal] = useState("track_periods")
	const [errors, setErrors] = useState({})
	const [isSaved, setIsSaved] = useState(false)

	useEffect(() => {
		const savedData = localStorage.getItem("userData")
		if (savedData) {
			const parsedData = JSON.parse(savedData)
			setUserData(parsedData)
			setCycleLength(parsedData.cycleLength?.toString() || "28")
			setPeriodLength(parsedData.periodLength?.toString() || "5")
			setTrackingGoal(parsedData.trackingGoal || "track_periods")
		} else {
			// Default values if no user data found (should ideally not happen if onboarding is complete)
			setCycleLength("28")
			setPeriodLength("5")
		}
	}, [])

	const validateField = (name, value) => {
		let errorMsg = ""
		const numValue = parseInt(value, 10)

		if (value.trim() === "") {
			errorMsg = "This field is required."
		} else if (isNaN(numValue)) {
			errorMsg = "Please enter a valid number."
		} else {
			if (name === "cycleLength") {
				if (numValue < 21 || numValue > 45) {
					errorMsg = "Cycle length must be between 21 and 45 days."
				}
			} else if (name === "periodLength") {
				if (numValue < 1 || numValue > 10) {
					errorMsg = "Period length must be between 1 and 10 days."
				}
			}
		}
		return errorMsg
	}

	const handleInputChange = (e) => {
		const { name, value } = e.target
		setIsSaved(false) // Reset save status on change

		if (name === "cycleLength") {
			setCycleLength(value)
		} else if (name === "periodLength") {
			setPeriodLength(value)
		} else if (name === "trackingGoal") {
			setTrackingGoal(value)
		}

		const errorMsg = validateField(name, value)
		setErrors((prevErrors) => ({ ...prevErrors, [name]: errorMsg }))
	}

	const handleSave = () => {
		const cycleError = validateField("cycleLength", cycleLength)
		const periodError = validateField("periodLength", periodLength)

		if (cycleError || periodError) {
			setErrors({ cycleLength: cycleError, periodLength: periodError })
			return
		}

		const updatedUserData = {
			...userData, // Preserve other existing data like lastPeriodStartDate
			cycleLength: parseInt(cycleLength, 10),
			periodLength: parseInt(periodLength, 10),
			trackingGoal: trackingGoal,
		}

		localStorage.setItem("userData", JSON.stringify(updatedUserData))
		setUserData(updatedUserData) // Update local state if needed elsewhere on this page
		setIsSaved(true)
		setErrors({}) // Clear errors on successful save

		// Optional: Navigate away or show persistent success message
		// navigate('/home'); // Example: navigate to home after save
	}

	const canSave =
		!errors.cycleLength &&
		!errors.periodLength &&
		cycleLength.trim() !== "" &&
		periodLength.trim() !== ""

	if (!userData && cycleLength === "") {
		// Still loading or no data
		return (
			<div className="min-h-screen bg-pink-50 flex items-center justify-center">
				<p className="text-pink-600">Loading settings...</p>
			</div>
		)
	}

	return (
		<div className="min-h-screen flex flex-col">
			<div className="h-16" />

			<main className="flex-1 p-4 mb-20 space-y-6">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
					className="bg-white rounded-xl shadow-md p-6">
					<h2 className="text-lg font-semibold text-gray-800 mb-4">
						Cycle Configuration
					</h2>

					{/* Cycle Length */}
					<div className="mb-5">
						<label
							htmlFor="cycleLength"
							className="block text-sm font-medium text-gray-700 mb-1">
							Average Cycle Length (days)
							<span className="group relative ml-1">
								<Info
									size={14}
									className="text-gray-400 inline cursor-pointer"
								/>
								<span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-max max-w-xs p-2 bg-gray-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
									The number of days from the first day of one period to the day
									before the next period starts. Typically 21-45 days.
								</span>
							</span>
						</label>
						<input
							type="number"
							name="cycleLength"
							id="cycleLength"
							value={cycleLength}
							onChange={handleInputChange}
							className={`w-full p-2 border rounded-md text-sm ${
								errors.cycleLength
									? "border-red-500 focus:ring-red-500 focus:border-red-500"
									: "border-gray-300 focus:ring-pink-500 focus:border-pink-500"
							}`}
							placeholder="e.g., 28"
							min="21"
							max="45"
						/>
						{errors.cycleLength && (
							<p className="mt-1 text-xs text-red-600 flex items-center">
								<AlertTriangle size={14} className="mr-1" />{" "}
								{errors.cycleLength}
							</p>
						)}
					</div>

					{/* Period Length */}
					<div className="mb-5">
						<label
							htmlFor="periodLength"
							className="block text-sm font-medium text-gray-700 mb-1">
							Average Period Length (days)
							<span className="group relative ml-1">
								<Info
									size={14}
									className="text-gray-400 inline cursor-pointer"
								/>
								<span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-max max-w-xs p-2 bg-gray-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
									The number of days your period typically lasts. Usually 1-10
									days.
								</span>
							</span>
						</label>
						<input
							type="number"
							name="periodLength"
							id="periodLength"
							value={periodLength}
							onChange={handleInputChange}
							className={`w-full p-2 border rounded-md text-sm ${
								errors.periodLength
									? "border-red-500 focus:ring-red-500 focus:border-red-500"
									: "border-gray-300 focus:ring-pink-500 focus:border-pink-500"
							}`}
							placeholder="e.g., 5"
							min="1"
							max="10"
						/>
						{errors.periodLength && (
							<p className="mt-1 text-xs text-red-600 flex items-center">
								<AlertTriangle size={14} className="mr-1" />{" "}
								{errors.periodLength}
							</p>
						)}
					</div>

					{/* Tracking Goal */}
					<div className="mb-5">
						<label
							htmlFor="trackingGoal"
							className="block text-sm font-medium text-gray-700 mb-1">
							Tracking Goal
						</label>
						<select
							name="trackingGoal"
							id="trackingGoal"
							value={trackingGoal}
							onChange={handleInputChange}
							className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-pink-500 focus:border-pink-500">
							<option value="track_periods">Track my periods</option>
							<option value="plan_pregnancy">Trying to conceive</option>
							{/* Add more goals if needed */}
						</select>
					</div>

					{isSaved && (
						<motion.p
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							className="text-sm text-green-600 mb-4">
							Settings saved successfully!
						</motion.p>
					)}

					<button
						onClick={handleSave}
						disabled={!canSave}
						className={`w-full flex items-center justify-center py-2.5 px-4 text-sm font-medium text-white rounded-lg shadow-md transition-colors ${
							canSave
								? "bg-pink-600 hover:bg-pink-700"
								: "bg-gray-400 cursor-not-allowed"
						}`}>
						<Save size={18} className="mr-2" />
						Save Settings
					</button>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.2 }}
					className="bg-white rounded-xl shadow-md p-6">
					<h2 className="text-lg font-semibold text-gray-800 mb-3">
						About FemTracker
					</h2>
					<p className="text-sm text-gray-600">
						FemTracker is your personal menstrual health companion, designed to
						help you understand your body and track your cycle with ease.
						<br />
						<br />
						Version: 1.0.0 (© 2025 FemTracker Health)
					</p>
					{/* Add more about info or links here */}
				</motion.div>
			</main>
		</div>
	)
}

export default Settings
