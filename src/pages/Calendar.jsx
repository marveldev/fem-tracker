import { useState, useEffect, useRef, useCallback, useContext } from "react"
import { useNavigate } from "react-router-dom"
import {
	format,
	startOfMonth,
	endOfMonth,
	eachDayOfInterval,
	isSameMonth,
	isSameDay,
	addMonths,
	subMonths,
	parseISO,
	addDays,
	differenceInDays,
} from "date-fns"
import {
	ChevronLeft,
	ChevronRight,
	Droplet,
	Edit3,
	Trash2,
	X,
	Droplets,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { AppContext } from "../context/AppContext"

const getTrackingDataForDate = (date) => {
	const dateString = format(date, "yyyy-MM-dd")
	const data = localStorage.getItem(`tracking_${dateString}`)
	return data ? JSON.parse(data) : null
}

const getStoredPeriodDays = () => {
	const stored = localStorage.getItem("periodDays")
	return stored ? JSON.parse(stored).map(parseISO) : []
}

const storePeriodDays = (days) => {
	localStorage.setItem(
		"periodDays",
		JSON.stringify(days.map((d) => d.toISOString()))
	)
}

const Calendar = () => {
	const navigate = useNavigate()
	const { user } = useContext(AppContext)

	const [currentMonth, setCurrentMonth] = useState(new Date())
	const [periodDays, setPeriodDays] = useState([])
	const [selectedDayDetails, setSelectedDayDetails] = useState(null)
	const [showOptionsModal, setShowOptionsModal] = useState(false)
	const [modalSelectedDate, setModalSelectedDate] = useState(null)

	const longPressTimer = useRef(null)
	const doubleClickTimer = useRef(null)

	useEffect(() => {
		const storedDays = getStoredPeriodDays()
		if (storedDays.length > 0) {
			setPeriodDays(storedDays)
		} else {
			// Initialize period days based on user's last period and period length
			const lastPeriodStartDate = new Date(user.lastPeriod)
			const initialDays = Array.from({ length: user.periodLength }).map(
				(_, i) => addDays(lastPeriodStartDate, i)
			)
			setPeriodDays(initialDays)
			storePeriodDays(initialDays)
		}
	}, [user])

	useEffect(() => {
		if (periodDays.length > 0) storePeriodDays(periodDays)
	}, [periodDays])

	const daysInMonth = eachDayOfInterval({
		start: startOfMonth(currentMonth),
		end: endOfMonth(currentMonth),
	})

	const startDayOfMonth = startOfMonth(currentMonth).getDay()

	const handlePrevMonth = () => {
		setCurrentMonth(subMonths(currentMonth, 1))
		setSelectedDayDetails(null)
	}

	const handleNextMonth = () => {
		setCurrentMonth(addMonths(currentMonth, 1))
		setSelectedDayDetails(null)
	}

	const isPeriodDay = useCallback(
		(day) => periodDays.some((d) => isSameDay(d, day)),
		[periodDays]
	)

	const handleDayClick = (day) => {
		if (doubleClickTimer.current) {
			clearTimeout(doubleClickTimer.current)
			doubleClickTimer.current = null
			handleDayDoubleClick(day)
		} else {
			doubleClickTimer.current = setTimeout(() => {
				const trackingData = getTrackingDataForDate(day)
				setSelectedDayDetails({
					date: day,
					isPeriod: isPeriodDay(day),
					trackingData,
				})
				doubleClickTimer.current = null
			}, 250)
		}
	}

	const handleDayDoubleClick = (day) => {
		setModalSelectedDate(day)
		setShowOptionsModal(true)
		setSelectedDayDetails(null)
	}

	const handleTouchStart = (day) => {
		longPressTimer.current = setTimeout(() => {
			setModalSelectedDate(day)
			setShowOptionsModal(true)
			setSelectedDayDetails(null)
			longPressTimer.current = null
		}, 500)
	}

	const handleTouchEnd = () => {
		if (longPressTimer.current) {
			clearTimeout(longPressTimer.current)
			longPressTimer.current = null
		}
		if (doubleClickTimer.current) {
			clearTimeout(doubleClickTimer.current)
			doubleClickTimer.current = null
		}
	}

	const handleAddSinglePeriodDay = () => {
		setPeriodDays((prevDays) => {
			// Only add if not already marked
			if (prevDays.some((d) => isSameDay(d, modalSelectedDate))) return prevDays

			const updatedDays = [...prevDays, modalSelectedDate]
			// Sort the days for consistency
			updatedDays.sort((a, b) => differenceInDays(a, b))
			return updatedDays
		})

		setShowOptionsModal(false)
	}

	const handleAddPeriod = () => {
		const newPeriodDays = Array.from({ length: user.periodLength }).map(
			(_, i) => addDays(modalSelectedDate, i)
		)
		setPeriodDays((prev) => {
			const updated = [...prev]
			newPeriodDays.forEach((day) => {
				if (!updated.some((d) => isSameDay(d, day))) updated.push(day)
			})
			return updated.sort((a, b) => differenceInDays(a, b))
		})
		setShowOptionsModal(false)
	}

	const handleLogDetails = () => {
		navigate(`/track/${format(modalSelectedDate, "yyyy-MM-dd")}`)
	}

	const handleRemovePeriod = () => {
		setPeriodDays((prev) =>
			prev.filter((d) => !isSameDay(d, modalSelectedDate))
		)
		setShowOptionsModal(false)
	}

	const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

	return (
		<div className="flex flex-col">
			<div className="h-16" />
			<main className="flex-1 p-4 mb-16">
				<div className="bg-gray-100 rounded-lg p-4 mb-4">
					{/* Navigation */}
					<div className="flex justify-between items-center mb-4">
						<button
							onClick={handlePrevMonth}
							className="p-2 rounded-full hover:bg-gray-100">
							<ChevronLeft size={20} className="text-pink-600" />
						</button>
						<h2 className="text-lg font-semibold text-pink-700">
							{format(currentMonth, "MMMM yyyy")}
						</h2>
						<button
							onClick={handleNextMonth}
							className="p-2 rounded-full hover:bg-gray-100">
							<ChevronRight size={20} className="text-pink-600" />
						</button>
					</div>

					{/* Calendar Grid */}
					<div className="grid grid-cols-7 gap-1 mb-4">
						{weekDays.map((day) => (
							<div
								key={day}
								className="text-center text-xs font-medium text-gray-500 py-2">
								{day}
							</div>
						))}
						{Array(startDayOfMonth)
							.fill(null)
							.map((_, idx) => (
								<div key={`empty-${idx}`} className="h-12" />
							))}
						{daysInMonth.map((day) => {
							const isToday = isSameDay(day, new Date())
							const isPeriod = isPeriodDay(day)
							const isSelected =
								selectedDayDetails && isSameDay(day, selectedDayDetails.date)

							return (
								<button
									key={day.toString()}
									onClick={() => handleDayClick(day)}
									onDoubleClick={() => handleDayDoubleClick(day)}
									onTouchStart={() => handleTouchStart(day)}
									onTouchEnd={handleTouchEnd}
									onContextMenu={(e) => {
										e.preventDefault()
										handleDayDoubleClick(day)
									}}
									className={`h-12 rounded-lg flex flex-col items-center justify-center relative group transition-colors duration-150
										${isPeriod ? "bg-pink-100" : "hover:bg-pink-50"}
										${isSelected ? "bg-pink-200 ring-2 ring-pink-400" : ""}
										${!isSameMonth(day, currentMonth) ? "text-gray-300" : ""}`}
									aria-label={`Date ${format(day, "d")}${
										isPeriod ? ", Period day" : ""
									}`}>
									<span
										className={`text-sm ${
											isPeriod ? "text-pink-700 font-medium" : "text-gray-700"
										} ${
											!isSameMonth(day, currentMonth) ? "text-gray-300" : ""
										}`}>
										{format(day, "d")}
									</span>
									{isPeriod && (
										<div className="w-1.5 h-1.5 bg-pink-500 rounded-full absolute bottom-1.5" />
									)}
									{isToday && !isSelected && (
										<div className="w-1.5 h-1.5 bg-blue-500 rounded-full absolute top-1.5 right-1.5" />
									)}
								</button>
							)
						})}
					</div>

					{/* Legend */}
					<div className="flex justify-center items-center space-x-4 text-sm text-gray-600 mt-2">
						<div className="flex items-center">
							<div className="w-3 h-3 bg-pink-500 rounded-full mr-1.5"></div>
							Period
						</div>
						<div className="flex items-center">
							<div className="w-3 h-3 bg-blue-500 rounded-full mr-1.5"></div>
							Today
						</div>
					</div>
				</div>

				{/* Day Details */}
				<AnimatePresence>
					{selectedDayDetails && (
						<motion.div
							initial={{ opacity: 0, height: 0 }}
							animate={{ opacity: 1, height: "auto" }}
							exit={{ opacity: 0, height: 0 }}
							transition={{ duration: 0.1 }}
							className="bg-gray-100 rounded-lg p-4 overflow-hidden">
							<h3 className="text-md font-semibold text-pink-700 mb-2">
								{format(selectedDayDetails.date, "EEEE, MMMM d, yyyy")}
							</h3>
							{selectedDayDetails.isPeriod && (
								<p className="text-sm text-pink-600 mb-1 flex items-center">
									<Droplet size={14} className="mr-1" /> Period Day
								</p>
							)}
							{selectedDayDetails.trackingData ? (
								<p className="text-sm text-gray-600">
									Logged:{" "}
									{Object.keys(selectedDayDetails.trackingData).join(", ")}
								</p>
							) : (
								<p className="text-sm text-gray-500">
									No details logged for this day.
								</p>
							)}
							{selectedDayDetails.date <= new Date() && (
								<button
									onClick={() =>
										navigate(
											`/track/${format(selectedDayDetails.date, "yyyy-MM-dd")}`
										)
									}
									className="text-sm text-pink-600 hover:underline mt-2">
									Log Details
								</button>
							)}
						</motion.div>
					)}
				</AnimatePresence>
			</main>

			{/* Options Modal */}
			<AnimatePresence>
				{showOptionsModal && modalSelectedDate && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50"
						onClick={() => setShowOptionsModal(false)}>
						<motion.div
							initial={{ scale: 0.9, y: 20 }}
							animate={{ scale: 1, y: 0 }}
							exit={{ scale: 0.9, y: 20, opacity: 0 }}
							transition={{ type: "spring", stiffness: 300, damping: 25 }}
							className="bg-white rounded-xl p-5 w-full max-w-xs"
							onClick={(e) => e.stopPropagation()}>
							<div className="flex justify-between items-center mb-4">
								<h3 className="text-lg font-semibold text-pink-700">
									{format(modalSelectedDate, "MMM d, yyyy")}
								</h3>
								<button
									onClick={() => setShowOptionsModal(false)}
									className="p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600">
									<X size={20} />
								</button>
							</div>
							<div className="space-y-3">
								{!isPeriodDay(modalSelectedDate) && (
									<button
										onClick={handleAddSinglePeriodDay}
										className="w-full flex items-center px-4 py-2 text-left text-gray-700 hover:bg-pink-50 rounded-lg transition-colors">
										<Droplet size={20} className="mr-3 text-pink-500" /> Add
										Single Period Day
									</button>
								)}

								{modalSelectedDate <= new Date() && (
									<button
										onClick={handleLogDetails}
										className="w-full flex items-center px-4 py-2 text-left text-gray-700 hover:bg-pink-50 rounded-lg transition-colors">
										<Edit3 size={20} className="mr-3 text-blue-500" />
										Log / Edit Details
									</button>
								)}

								{!isPeriodDay(modalSelectedDate) && (
									<button
										onClick={handleAddPeriod}
										className="w-full flex items-center px-4 py-2 text-left text-gray-700 hover:bg-pink-50 rounded-lg transition-colors">
										<Droplets size={20} className="mr-3 text-pink-500" /> Add
										Periods ({user.periodLength} days)
									</button>
								)}
								{isPeriodDay(modalSelectedDate) && (
									<button
										onClick={handleRemovePeriod}
										className="w-full flex items-center px-4 py-2 text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors">
										<Trash2 size={20} className="mr-3" /> Remove Period Mark
									</button>
								)}
							</div>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	)
}

export default Calendar
