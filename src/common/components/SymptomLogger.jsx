import { useState, useContext } from "react"
import { format } from "date-fns"
import {
	X,
	Droplet,
	ThermometerSun,
	HeartPulse,
	Frown,
	Moon,
} from "lucide-react"
import { AppContext } from "../../context/AppContext"

const SymptomLogger = ({ date, onClose }) => {
	const { logSymptom } = useContext(AppContext)
	const [symptoms, setSymptoms] = useState({
		flow: "",
		mood: "",
		pain: "",
	})

	const handleSubmit = (event) => {
		event.preventDefault()

		logSymptom(date, symptoms)
		onClose()
	}

	const flowOptions = [
		{ value: "none", label: "None", icon: "⚪", color: "bg-gray-100" },
		{ value: "spotting", label: "Spotting", icon: "·", color: "bg-red-100" },
		{ value: "light", label: "Light", icon: "💧", color: "bg-red-200" },
		{ value: "medium", label: "Medium", icon: "💧💧", color: "bg-red-300" },
		{ value: "heavy", label: "Heavy", icon: "💧💧💧", color: "bg-red-400" },
	]

	const moodOptions = [
		{ value: "happy", label: "Happy", icon: "😊", color: "bg-green-100" },
		{ value: "normal", label: "Normal", icon: "😐", color: "bg-blue-100" },
		{ value: "sad", label: "Sad", icon: "😢", color: "bg-blue-200" },
		{
			value: "irritable",
			label: "Irritable",
			icon: "😠",
			color: "bg-orange-100",
		},
		{ value: "anxious", label: "Anxious", icon: "😰", color: "bg-yellow-100" },
		{ value: "tired", label: "Tired", icon: "😴", color: "bg-purple-100" },
		{
			value: "energetic",
			label: "Energetic",
			icon: "⚡",
			color: "bg-yellow-200",
		},
	]

	const painOptions = [
		{ value: "none", label: "None", icon: "0", color: "bg-gray-100" },
		{ value: "mild", label: "Mild", icon: "1", color: "bg-yellow-100" },
		{ value: "moderate", label: "Moderate", icon: "2", color: "bg-orange-100" },
		{ value: "severe", label: "Severe", icon: "3", color: "bg-red-100" },
	]

	return (
		<div
			className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50"
			onClick={onClose}>
			<div
				className="bg-white rounded-lg p-4 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto"
				onClick={(e) => e.stopPropagation()}>
				<div className="flex justify-between items-center mb-4">
					<h2 className="text-xl font-semibold text-[#fb6caa]">
						Log for {format(date, "MMMM d, yyyy")}
					</h2>
					<button
						onClick={onClose}
						className="text-gray-500 hover:bg-gray-100 p-1 rounded-full">
						<X size={24} />
					</button>
				</div>

				<form onSubmit={(event) => handleSubmit(event)}>
					<div className="mb-5">
						<div className="flex items-center mb-3">
							<Droplet size={18} className="text-[#fb6caa] mr-2" />
							<label className="text-gray-700 font-medium">Flow</label>
						</div>
						<div className="grid grid-cols-5 gap-2">
							{flowOptions.map((option) => (
								<button
									key={option.value}
									type="button"
									className={`py-2 px-1 rounded-lg text-sm flex flex-col items-center ${
										symptoms.flow === option.value
											? "bg-[#fb6caa] text-white"
											: `${option.color} text-gray-700`
									}`}
									onClick={() =>
										setSymptoms((prev) => ({ ...prev, flow: option.value }))
									}>
									<span className="text-base mb-1">{option.icon}</span>
									<span className="text-xs">{option.label}</span>
								</button>
							))}
						</div>
					</div>

					<div className="mb-5">
						<div className="flex items-center mb-3">
							<Moon size={18} className="text-[#fb6caa] mr-2" />
							<label className="text-gray-700 font-medium">Mood</label>
						</div>
						<div className="grid grid-cols-4 gap-2">
							{moodOptions.map((option) => (
								<button
									key={option.value}
									type="button"
									className={`py-2 px-1 rounded-lg text-sm flex flex-col items-center ${
										symptoms.mood === option.value
											? "bg-[#fb6caa] text-white"
											: `${option.color} text-gray-700`
									}`}
									onClick={() =>
										setSymptoms((prev) => ({ ...prev, mood: option.value }))
									}>
									<span className="text-base mb-1">{option.icon}</span>
									<span className="text-xs">{option.label}</span>
								</button>
							))}
						</div>
					</div>

					<div className="mb-5">
						<div className="flex items-center mb-3">
							<HeartPulse size={18} className="text-[#fb6caa] mr-2" />
							<label className="text-gray-700 font-medium">Pain Level</label>
						</div>
						<div className="grid grid-cols-4 gap-2">
							{painOptions.map((option) => (
								<button
									key={option.value}
									type="button"
									className={`py-2 px-3 rounded-lg text-sm flex flex-col items-center ${
										symptoms.pain === option.value
											? "bg-[#fb6caa] text-white"
											: `${option.color} text-gray-700`
									}`}
									onClick={() =>
										setSymptoms((prev) => ({ ...prev, pain: option.value }))
									}>
									<span className="text-base mb-1">{option.icon}</span>
									<span className="text-xs">{option.label}</span>
								</button>
							))}
						</div>
					</div>

					<div className="mb-5">
						<div className="flex items-center mb-3">
							<ThermometerSun size={18} className="text-[#fb6caa] mr-2" />
							<label className="text-gray-700 font-medium">
								Other Symptoms
							</label>
						</div>
						<div className="grid grid-cols-3 gap-2">
							{[
								"Headache",
								"Bloating",
								"Acne",
								"Cravings",
								"Insomnia",
								"Nausea",
							].map((symptom) => (
								<button
									key={symptom}
									type="button"
									className={`py-2 px-2 rounded-lg text-xs ${
										symptoms[symptom.toLowerCase()]
											? "bg-[#fb6caa] text-white"
											: "bg-gray-100 text-gray-700"
									}`}
									onClick={() =>
										setSymptoms((prev) => ({
											...prev,
											[symptom.toLowerCase()]: !prev[symptom.toLowerCase()],
										}))
									}>
									{symptom}
								</button>
							))}
						</div>
					</div>

					<div className="flex justify-end">
						<button
							type="button"
							onClick={onClose}
							className="mr-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
							Cancel
						</button>
						<button
							type="submit"
							className="px-4 py-2 bg-[#fb6caa] text-white rounded-lg hover:bg-[#d14e87] transition-colors">
							Save
						</button>
					</div>
				</form>
			</div>
		</div>
	)
}

export default SymptomLogger
