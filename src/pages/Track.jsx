import { useState, useEffect, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { format, parseISO } from "date-fns"
import {
	Droplet,
	Smile,
	Meh,
	Frown,
	Heart,
	Pill,
	Bed,
	CloudRain,
	Brain,
	ShieldCheck,
	Thermometer,
	Wind,
	Zap,
	Briefcase,
	Edit,
} from "lucide-react" // Added more icons
import { AnimatePresence } from "framer-motion"
import { CalendarPicker, Snackbar } from "../common"

// Helper to get/set tracking data
const getTrackingData = (date) => {
	const dateString = format(date, "yyyy-MM-dd")
	const data = localStorage.getItem(`tracking_${dateString}`)
	return data ? JSON.parse(data) : {}
}

const saveTrackingData = (date, data) => {
	const dateString = format(date, "yyyy-MM-dd")
	localStorage.setItem(`tracking_${dateString}`, JSON.stringify(data))
}

// --- Reusable Components ---

const Section = ({ title, icon: Icon, children }) => (
	<div className="bg-white rounded-xl shadow-md p-4 mb-4">
		<h3 className="text-md font-semibold text-gray-700 mb-3 flex items-center">
			<Icon size={18} className="mr-2 text-pink-600" />
			{title}
		</h3>
		{children}
	</div>
)

const OptionButton = ({
	label,
	icon: Icon,
	isSelected,
	onClick,
	value,
	color = "pink",
}) => (
	<button
		onClick={() => onClick(value)}
		className={`flex-1 flex flex-col items-center p-2 rounded-lg border transition-all duration-150 ease-in-out ${
			isSelected
				? `bg-${color}-100 border-${color}-300 text-${color}-700 shadow-sm`
				: "bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100 hover:border-gray-300"
		}`}>
		{Icon && <Icon size={20} className="mb-1" />}
		<span className="text-xs text-center">{label}</span>
	</button>
)

const MultiSelectButtons = ({ options, selectedValues = [], onChange }) => {
	const handleSelect = (value) => {
		const newSelection = selectedValues.includes(value)
			? selectedValues.filter((item) => item !== value)
			: [...selectedValues, value]
		onChange(newSelection)
	}

	return (
		<div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
			{options.map((option) => (
				<OptionButton
					key={option.value}
					label={option.label}
					icon={option.icon}
					value={option.value}
					isSelected={selectedValues.includes(option.value)}
					onClick={handleSelect}
					color={option.color || "pink"}
				/>
			))}
		</div>
	)
}

const SingleSelectButtons = ({ options, selectedValue, onChange }) => (
	<div className="flex space-x-2">
		{options.map((option) => (
			<OptionButton
				key={option.value}
				label={option.label}
				icon={option.icon}
				value={option.value}
				isSelected={selectedValue === option.value}
				onClick={onChange}
				color={option.color || "pink"}
			/>
		))}
	</div>
)

// --- Main Track Page Component ---

const Track = () => {
	const { date: dateParam } = useParams()
	const navigate = useNavigate()
	const [currentDate, setCurrentDate] = useState(
		dateParam ? parseISO(dateParam) : new Date()
	)
	const [trackingData, setTrackingData] = useState({})
	const [showCalendar, setShowCalendar] = useState(false) // State for calendar visibility
	const [SnackbarIsVisible, setSnackbarIsVisible] = useState(false)
	const [isSaved, setIsSaved] = useState(false)

	// Load data when date changes
	useEffect(() => {
		const data = getTrackingData(currentDate)
		setTrackingData(data)
	}, [currentDate])

	// Update date in URL when currentDate changes
	useEffect(() => {
		const dateString = format(currentDate, "yyyy-MM-dd")
		navigate(`/track/${dateString}`, { replace: true })
	}, [currentDate, navigate])

	const handleDataChange = useCallback(
		(key, value) => {
			setIsSaved(false)
			setTrackingData((prevData) => {
				const newData = { ...prevData, [key]: value }
				return newData
			})
		},
		[currentDate]
	)

	const handleSubmit = () => {
		saveTrackingData(currentDate, trackingData)
		setIsSaved(true)
		setSnackbarIsVisible(true)
	}

	const handleMultiSelectChange = useCallback(
		(key, value) => {
			setIsSaved(false)
			setTrackingData((prevData) => {
				const newData = { ...prevData, [key]: value }
				return newData
			})
		},
		[currentDate]
	)

	const handleDateSelectFromCalendar = (day) => {
		setCurrentDate(day)
		setIsSaved(false)
		setShowCalendar(false) // Hide calendar after selection
	}

	// --- Options for Sections ---
	const flowOptions = [
		{
			value: "spotting",
			label: "Spotting",
			icon: () => <span className="text-xs">💧</span>,
		},
		{ value: "light", label: "Light", icon: () => <Droplet size={14} /> },
		{ value: "medium", label: "Medium", icon: () => <Droplet size={18} /> },
		{ value: "heavy", label: "Heavy", icon: () => <Droplet size={22} /> },
	]

	const symptomOptions = [
		{ value: "cramps", label: "Cramps", icon: Zap, color: "red" },
		{ value: "headache", label: "Headache", icon: Brain, color: "red" },
		{ value: "nausea", label: "Nausea", icon: CloudRain, color: "green" },
		{ value: "fatigue", label: "Fatigue", icon: Bed, color: "blue" },
		{ value: "bloating", label: "Bloating", icon: Wind, color: "purple" },
		{
			value: "backache",
			label: "Backache",
			icon: () => <span className="text-lg">🦴</span>,
			color: "orange",
		},
		{
			value: "acne",
			label: "Acne",
			icon: () => <span className="text-lg">✨</span>,
			color: "yellow",
		},
		// Add more symptoms
	]

	const moodOptions = [
		{ value: "happy", label: "Happy", icon: Smile, color: "yellow" },
		{
			value: "calm",
			label: "Calm",
			icon: () => <span className="text-lg">😌</span>,
			color: "blue",
		},
		{ value: "sad", label: "Sad", icon: Frown, color: "gray" },
		{
			value: "anxious",
			label: "Anxious",
			icon: () => <span className="text-lg">😟</span>,
			color: "purple",
		},
		{
			value: "irritable",
			label: "Irritable",
			icon: () => <span className="text-lg">😠</span>,
			color: "red",
		},
		{ value: "energetic", label: "Energetic", icon: Zap, color: "orange" },
	]

	const sexOptions = [
		{
			value: "protected",
			label: "Protected",
			icon: ShieldCheck,
			color: "green",
		},
		{ value: "unprotected", label: "Unprotected", icon: Heart, color: "red" },
		{
			value: "none",
			label: "None",
			icon: () => <span className="text-lg">🚫</span>,
			color: "gray",
		},
	]

	const sexDriveOptions = [
		{ value: "low", label: "Low", icon: Frown, color: "blue" },
		{ value: "medium", label: "Medium", icon: Meh, color: "yellow" },
		{ value: "high", label: "High", icon: Smile, color: "red" },
	]

	const dischargeOptions = [
		{
			value: "none",
			label: "None",
			icon: () => <span className="text-lg">🚫</span>,
		},
		{
			value: "sticky",
			label: "Sticky",
			icon: () => <span className="text-lg">🍯</span>,
		},
		{
			value: "creamy",
			label: "Creamy",
			icon: () => <span className="text-lg">🥛</span>,
		},
		{ value: "watery", label: "Watery", icon: () => <Droplet size={16} /> },
		{
			value: "egg_white",
			label: "Egg White",
			icon: () => <span className="text-lg">🥚</span>,
		},
	]

	const birthControlOptions = [
		{ value: "taken", label: "Taken", icon: Pill, color: "green" },
		{
			value: "missed",
			label: "Missed",
			icon: () => <span className="text-lg">⚠️</span>,
			color: "red",
		},
		{
			value: "not_applicable",
			label: "N/A",
			icon: () => <span className="text-lg">🚫</span>,
			color: "gray",
		},
	]

	const breastOptions = [
		{
			value: "normal",
			label: "Normal",
			icon: () => <span className="text-lg">👍</span>,
			color: "green",
		},
		{
			value: "tender",
			label: "Tender",
			icon: () => <span className="text-lg">🤏</span>,
			color: "orange",
		},
		{
			value: "sore",
			label: "Sore",
			icon: () => <span className="text-lg">😖</span>,
			color: "red",
		},
	]

	const psychologicalOptions = [
		{ value: "focused", label: "Focused", icon: Brain, color: "blue" },
		{
			value: "productive",
			label: "Productive",
			icon: Briefcase,
			color: "green",
		},
		{
			value: "distracted",
			label: "Distracted",
			icon: () => <span className="text-lg">😵‍💫</span>,
			color: "yellow",
		},
		{ value: "unproductive", label: "Unproductive", icon: Bed, color: "gray" },
	]

	return (
		<div className="min-h-screen bg-pink-50 flex flex-col">
			<div className="h-16" />
			{/* Date Navigator Header */}
			<button
				onClick={() => setShowCalendar(!showCalendar)}
				className="text-lg font-semibold text-pink-700 text-center underline">
				{format(currentDate, "EEEE, MMMM d, yyyy")}
			</button>

			{/* Collapsible Calendar */}
			<AnimatePresence>
				{showCalendar && (
					<CalendarPicker
						selectedDate={currentDate}
						onSelectDate={handleDateSelectFromCalendar}
					/>
				)}
			</AnimatePresence>

			<main className="flex-1 p-4 mb-16 overflow-y-auto">
				<Section title="Flow" icon={Droplet}>
					<SingleSelectButtons
						options={flowOptions}
						selectedValue={trackingData.flow}
						onChange={(value) => handleDataChange("flow", value)}
					/>
				</Section>
				<Section title="Symptoms" icon={Zap}>
					<MultiSelectButtons
						options={symptomOptions}
						selectedValues={trackingData.symptoms}
						onChange={(value) => handleMultiSelectChange("symptoms", value)}
					/>
				</Section>
				<Section title="Mood" icon={Smile}>
					<MultiSelectButtons
						options={moodOptions}
						selectedValues={trackingData.moods}
						onChange={(value) => handleMultiSelectChange("moods", value)}
					/>
				</Section>
				<Section title="Sex & Drive" icon={Heart}>
					<div className="mb-3">
						<h4 className="text-sm font-medium text-gray-600 mb-1.5">
							Activity
						</h4>
						<SingleSelectButtons
							options={sexOptions}
							selectedValue={trackingData.sexActivity}
							onChange={(value) => handleDataChange("sexActivity", value)}
						/>
					</div>
					<div>
						<h4 className="text-sm font-medium text-gray-600 mb-1.5">Drive</h4>
						<SingleSelectButtons
							options={sexDriveOptions}
							selectedValue={trackingData.sexDrive}
							onChange={(value) => handleDataChange("sexDrive", value)}
						/>
					</div>
				</Section>
				<Section title="Vaginal Discharge" icon={Thermometer}>
					<SingleSelectButtons
						options={dischargeOptions}
						selectedValue={trackingData.discharge}
						onChange={(value) => handleDataChange("discharge", value)}
					/>
				</Section>
				<Section title="Birth Control" icon={Pill}>
					<SingleSelectButtons
						options={birthControlOptions}
						selectedValue={trackingData.birthControl}
						onChange={(value) => handleDataChange("birthControl", value)}
					/>
				</Section>
				<Section
					title="Breast Health"
					icon={() => <span className="text-lg">🍈</span>}>
					<SingleSelectButtons
						options={breastOptions}
						selectedValue={trackingData.breast}
						onChange={(value) => handleDataChange("breast", value)}
					/>
				</Section>
				<Section title="Psychological Capacity" icon={Brain}>
					<MultiSelectButtons
						options={psychologicalOptions}
						selectedValues={trackingData.psychological}
						onChange={(value) =>
							handleMultiSelectChange("psychological", value)
						}
					/>
				</Section>
				<Section title="Notes" icon={Edit}>
					<textarea
						value={trackingData.notes || ""}
						onChange={(e) => handleDataChange("notes", e.target.value)}
						className="w-full border border-gray-300 rounded-lg p-2 text-sm h-24 focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
						placeholder="Add any additional notes for the day..."></textarea>
				</Section>
				<button
					onClick={handleSubmit}
					disabled={isSaved}
					className={`w-full py-2 rounded-lg text-white ${
						isSaved
							? "bg-gray-400 cursor-not-allowed"
							: "bg-pink-600 hover:bg-pink-700"
					}`}>
					{isSaved ? "Saved" : "Submit"}
				</button>
			</main>

			<Snackbar
				message={`Your entry for ${format(
					currentDate,
					"MMMM d, yy"
				)} has been saved.`}
				isVisible={SnackbarIsVisible}
				onClose={() => setSnackbarIsVisible(false)}
			/>
		</div>
	)
}

export default Track
