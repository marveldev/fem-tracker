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
	startOfDay,
	isBefore,
} from "date-fns"
import {
	ChevronLeft,
	ChevronRight,
	Droplet,
	Edit3,
	Trash2,
	X,
	Circle,
	Dot,
	Droplets,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { calculateCyclePredictions } from "../utils/cycleUtils" // Import the prediction logic
import { AppContext } from "../context/AppContext"

// Helper to get tracking data for a specific date
const getTrackingDataForDate = (date) => {
	const dateString = format(date, "yyyy-MM-dd")
	const data = localStorage.getItem(`tracking_${dateString}`)
	return data ? JSON.parse(data) : null
}

// Helper to manage period days in localStorage
const getStoredPeriodDays = () => {
	const stored = localStorage.getItem("periodDays")
	// Ensure dates are parsed correctly and invalid dates are filtered out
	return stored
		? JSON.parse(stored)
				.map((d) => {
					try {
						return startOfDay(parseISO(d))
					} catch (e) {
						console.error("Error parsing stored date:", d, e)
						return null // Handle invalid date strings
					}
				})
				.filter((d) => d !== null) // Remove nulls from invalid parsing
		: []
}

const storePeriodDays = (days) => {
	// Ensure only valid Date objects are stored as ISO strings
	const validDays = days
		.filter((d) => d instanceof Date && !isNaN(d)) // Check if it's a valid Date object
		.map((d) => d.toISOString())
	localStorage.setItem("periodDays", JSON.stringify(validDays))
}

const Calendar = () => {
	const navigate = useNavigate()
	const { user, cycleInfo } = useContext(AppContext)
	const [currentMonth, setCurrentMonth] = useState(startOfDay(new Date()))
	const [loggedPeriodDays, setLoggedPeriodDays] = useState([])
	const [cyclePredictions, setCyclePredictions] = useState({
		predictedPeriods: [],
		fertileWindow: [],
		ovulationDays: [],
	})
	const [selectedDayDetails, setSelectedDayDetails] = useState(null) // For the note below calendar
	const [showOptionsModal, setShowOptionsModal] = useState(false)
	const [modalSelectedDate, setModalSelectedDate] = useState(null)
	const longPressTimer = useRef(null)
	const doubleClickTimer = useRef(null)
	const today = startOfDay(new Date()) // Define today at the top level

	// Initialize logged period days from localStorage or initial calculation
	useEffect(() => {
		const storedDays = getStoredPeriodDays()
		if (storedDays.length > 0) {
			setLoggedPeriodDays(storedDays.sort((a, b) => differenceInDays(a, b)))
		} else if (user && user.lastPeriodStartDate && user.periodLength > 0) {
			try {
				const lastPeriodStartDate = startOfDay(
					parseISO(user.lastPeriodStartDate)
				)
				const periodLength = user.periodLength
				const initialDays = Array.from({ length: periodLength })
					.map((_, i) => addDays(lastPeriodStartDate, i))
					.filter((d) => d instanceof Date && !isNaN(d)) // Ensure valid dates

				if (initialDays.length > 0) {
					setLoggedPeriodDays(
						initialDays.sort((a, b) => differenceInDays(a, b))
					)
					storePeriodDays(initialDays) // Store initial calculation only if valid
				} else {
					console.warn("Initial period calculation resulted in no valid dates.")
				}
			} catch (e) {
				console.error(
					"Error parsing initial user data date:",
					user.lastPeriodStartDate,
					e
				)
			}
		}
	}, [user]) // Rerun only if user changes

	// Recalculate predictions whenever loggedPeriodDays or cycle settings change
	useEffect(() => {
		if (loggedPeriodDays.length > 0 && user) {
			const predictions = calculateCyclePredictions(
				loggedPeriodDays,
				user.cycleLength,
				user.periodLength,
				currentMonth // Pass current month for context if needed by the util
			)
			setCyclePredictions(predictions)
		} else {
			// Clear predictions if there are no logged days or user data
			setCyclePredictions({
				predictedPeriods: [],
				fertileWindow: [],
				ovulationDays: [],
			})
		}
		// Persist logged days whenever they change
		storePeriodDays(loggedPeriodDays)
	}, [loggedPeriodDays, user, currentMonth]) // Add currentMonth dependency if util uses it

	const daysInMonth = eachDayOfInterval({
		start: startOfMonth(currentMonth),
		end: endOfMonth(currentMonth),
	})

	const startDayOfMonth = startOfMonth(currentMonth).getDay() // 0 for Sunday, 1 for Monday...

	const handlePrevMonth = () => {
		setCurrentMonth((prevMonth) => subMonths(prevMonth, 1))
		setSelectedDayDetails(null) // Clear details when changing month
	}

	const handleNextMonth = () => {
		setCurrentMonth((prevMonth) => addMonths(prevMonth, 1))
		setSelectedDayDetails(null) // Clear details when changing month
	}

	// --- Day Type Checkers ---
	const isLoggedPeriodDay = useCallback(
		(day) => {
			return loggedPeriodDays.some((d) => isSameDay(d, day))
		},
		[loggedPeriodDays]
	)

	const isPredictedPeriodDay = useCallback(
		(day) => {
			// Ensure it's a future prediction and not already logged
			return (
				!isBefore(day, today) &&
				cyclePredictions.predictedPeriods.some((d) => isSameDay(d, day)) &&
				!isLoggedPeriodDay(day)
			)
		},
		[cyclePredictions.predictedPeriods, today, isLoggedPeriodDay]
	)

	const isFertileDay = useCallback(
		(day) => {
			return cyclePredictions.fertileWindow.some((d) => isSameDay(d, day))
		},
		[cyclePredictions.fertileWindow]
	)

	const isOvulationDay = useCallback(
		(day) => {
			return cyclePredictions.ovulationDays.some((d) => isSameDay(d, day))
		},
		[cyclePredictions.ovulationDays]
	)
	// --- End Day Type Checkers ---

	const handleDayClick = (day) => {
		// Simple click: Show details note
		if (doubleClickTimer.current) {
			clearTimeout(doubleClickTimer.current)
			doubleClickTimer.current = null
			handleDayDoubleClick(day) // Treat as double click
		} else {
			doubleClickTimer.current = setTimeout(() => {
				const trackingData = getTrackingDataForDate(day)
				setSelectedDayDetails({
					date: day,
					isLoggedPeriod: isLoggedPeriodDay(day),
					isPredictedPeriod: isPredictedPeriodDay(day),
					isFertile: isFertileDay(day),
					isOvulation: isOvulationDay(day),
					trackingData,
				})
				doubleClickTimer.current = null
			}, 250) // 250ms delay to detect double click
		}
	}

	const handleDayDoubleClick = (day) => {
		// Double click: Open options modal
		setModalSelectedDate(day)
		setShowOptionsModal(true)
		setSelectedDayDetails(null) // Hide details note when modal opens
	}

	const handleTouchStart = (day) => {
		longPressTimer.current = setTimeout(() => {
			// Long press: Open options modal
			setModalSelectedDate(day)
			setShowOptionsModal(true)
			setSelectedDayDetails(null) // Hide details note
			longPressTimer.current = null // Clear timer ref
		}, 500) // 500ms for long press
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

	// --- Modal Actions ---
	const handleAddPeriod = () => {
		if (!modalSelectedDate || !user) return
		const periodLength = user.periodLength
		const newPeriodDaysToAdd = Array.from({ length: periodLength })
			.map((_, i) => addDays(modalSelectedDate, i))
			.filter((d) => d instanceof Date && !isNaN(d)) // Ensure valid dates

		setLoggedPeriodDays((prevDays) => {
			const updatedDaysSet = new Set(prevDays.map((d) => d.toISOString())) // Use Set for efficient check
			newPeriodDaysToAdd.forEach((newDay) => {
				updatedDaysSet.add(newDay.toISOString())
			})
			const updatedDaysArray = Array.from(updatedDaysSet)
				.map((iso) => parseISO(iso))
				.sort((a, b) => differenceInDays(a, b))
			return updatedDaysArray
		})
		setShowOptionsModal(false)
	}

	const handleAddSinglePeriodDay = () => {
		if (!modalSelectedDate) return

		setLoggedPeriodDays((prevDays) => {
			const updatedDaysSet = new Set(prevDays.map((d) => d.toISOString()))
			updatedDaysSet.add(startOfDay(modalSelectedDate).toISOString()) // ensure day is normalized
			const updatedDaysArray = Array.from(updatedDaysSet)
				.map((iso) => parseISO(iso))
				.sort((a, b) => differenceInDays(a, b))
			return updatedDaysArray
		})

		setShowOptionsModal(false)
	}

	const handleLogDetails = () => {
		if (!modalSelectedDate) return
		const dateString = format(modalSelectedDate, "yyyy-MM-dd")
		navigate(`/track/${dateString}`)
		setShowOptionsModal(false)
	}

	const handleRemovePeriod = () => {
		if (!modalSelectedDate) return
		setLoggedPeriodDays((prevDays) =>
			prevDays.filter((d) => !isSameDay(d, modalSelectedDate))
		)
		setShowOptionsModal(false)
	}

	const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

	return (
		<div className="min-h-screen bg-pink-50 flex flex-col">
			<header className="bg-white p-4 shadow-sm sticky top-0 z-20">
				<h1 className="text-2xl font-bold text-pink-700 text-center">
					Calendar
				</h1>
			</header>
			<main className="flex-1 p-4 mb-16">
				{" "}
				{/* Added mb-16 for bottom nav space */}
				<div className="bg-white rounded-xl shadow-md p-4 mb-4">
					{/* Month Navigation */}
					<div className="flex justify-between items-center mb-4">
						<button
							onClick={handlePrevMonth}
							className="p-2 rounded-full hover:bg-gray-100"
							aria-label="Previous month">
							<ChevronLeft size={20} className="text-pink-600" />
						</button>
						<h2 className="text-lg font-semibold text-pink-700">
							{format(currentMonth, "MMMM yyyy")}
						</h2>
						<button
							onClick={handleNextMonth}
							className="p-2 rounded-full hover:bg-gray-100"
							aria-label="Next month">
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
							.map((_, index) => (
								<div key={`empty-${index}`} className="h-12"></div>
							))}

						{/* Calendar Days */}
						{daysInMonth.map((day) => {
							const dayStr = day.toString() // For key
							const isCurrentMonth = isSameMonth(day, currentMonth)
							const isTodayFlag = isSameDay(day, today)
							const isSelected =
								selectedDayDetails && isSameDay(day, selectedDayDetails.date)
							const isPast = isBefore(day, today)

							const isLogged = isLoggedPeriodDay(day)
							const isPredicted = isPredictedPeriodDay(day)
							const isFertile = isFertileDay(day)
							const isOvulation = isOvulationDay(day)

							// Determine background and text styles
							let bgClass = "hover:bg-pink-50"
							let textClass = "text-gray-700"
							let borderClass = ""
							let indicator = null

							if (isLogged) {
								bgClass = "bg-pink-400" // Solid pink for logged period
								textClass = "text-white font-semibold"
							} else if (isFertile) {
								bgClass = isPast ? "bg-blue-100 opacity-70" : "bg-blue-200" // Blue for fertile, faded if past
								textClass = isPast
									? "text-blue-600 opacity-90"
									: "text-blue-800"
							} else if (isPredicted) {
								borderClass = "border-2 border-dashed border-pink-400" // Dashed pink border for predicted period
								bgClass = "bg-pink-50" // Lighter background
								textClass = "text-pink-700"
							}

							if (isOvulation) {
								// Add a dot for ovulation, stronger if future
								indicator = (
									<div
										className={`absolute bottom-1.5 left-1/2 transform -translate-x-1/2 w-2 h-2 rounded-full ${
											isPast ? "bg-blue-400 opacity-70" : "bg-blue-600"
										}`}></div>
								)
								// Make ovulation day background slightly more prominent within fertile window
								if (isFertile && !isLogged) {
									bgClass = isPast ? "bg-blue-200 opacity-80" : "bg-blue-400"
								}
							}

							if (isSelected) {
								borderClass = `ring-2 ring-offset-1 ${
									isLogged ? "ring-pink-600" : "ring-indigo-500"
								}` // Ring for selected
							} else if (isTodayFlag) {
								borderClass += " border-2 border-indigo-500" // Border for today (append if needed)
							}

							return (
								<button
									key={dayStr}
									onClick={() => handleDayClick(day)}
									onDoubleClick={() => handleDayDoubleClick(day)}
									onTouchStart={() => handleTouchStart(day)}
									onTouchEnd={handleTouchEnd}
									onContextMenu={(e) => {
										e.preventDefault()
										handleDayDoubleClick(day)
									}}
									className={`
                    h-12 rounded-lg flex flex-col items-center justify-center relative group
                    transition-all duration-150 ease-in-out
                    ${bgClass} ${borderClass}
                    ${!isCurrentMonth ? "opacity-40 pointer-events-none" : ""}
                  `}
									aria-label={`Date ${format(day, "d")}${
										isLogged ? ", Period day" : ""
									}${isPredicted ? ", Predicted period" : ""}${
										isFertile ? ", Fertile day" : ""
									}${isOvulation ? ", Ovulation day" : ""}`}
									disabled={!isCurrentMonth}>
									<span
										className={`text-sm ${textClass} ${
											!isCurrentMonth ? "text-gray-400" : ""
										}`}>
										{format(day, "d")}
									</span>
									{indicator}
								</button>
							)
						})}
					</div>

					{/* Updated Legend */}
					<div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-1 text-xs text-gray-600 mt-2">
						<div className="flex items-center">
							<div className="w-3 h-3 bg-pink-400 rounded-sm mr-1.5"></div>{" "}
							Logged Period
						</div>
						<div className="flex items-center">
							<div className="w-3 h-3 border-2 border-dashed border-pink-400 rounded-sm mr-1.5"></div>{" "}
							Predicted Period
						</div>
						<div className="flex items-center">
							<div className="w-3 h-3 bg-blue-200 rounded-sm mr-1.5"></div>{" "}
							Fertile Window
						</div>
						<div className="flex items-center">
							<div className="w-3 h-3 bg-blue-200 rounded-sm relative mr-1.5">
								<div className="absolute inset-0 flex items-center justify-center">
									<Dot size={16} className="text-blue-600" />
								</div>
							</div>{" "}
							Ovulation
						</div>
						<div className="flex items-center">
							<div className="w-3 h-3 border-2 border-indigo-500 rounded-full mr-1.5"></div>{" "}
							Today
						</div>
						<div className="flex items-center text-gray-400">
							(Faded = Past)
						</div>
					</div>
				</div>
				{/* Selected Day Details Note */}
				<AnimatePresence>
					{selectedDayDetails && (
						<motion.div
							initial={{ opacity: 0, height: 0 }}
							animate={{ opacity: 1, height: "auto" }}
							exit={{ opacity: 0, height: 0 }}
							transition={{ duration: 0.1 }}
							className="bg-white rounded-xl shadow-md p-4 overflow-hidden">
							<h3 className="text-md font-semibold text-pink-700 mb-2">
								{format(selectedDayDetails.date, "EEEE, MMMM d, yyyy")}
							</h3>
							{/* Display status based on selection */}
							{selectedDayDetails.isLoggedPeriod && (
								<p className="text-sm text-pink-600 mb-1 flex items-center">
									<Droplet size={14} className="mr-1" /> Logged Period Day
								</p>
							)}
							{selectedDayDetails.isPredictedPeriod && (
								<p className="text-sm text-pink-500 mb-1 flex items-center">
									<Circle
										size={12}
										strokeWidth={1}
										className="mr-1.5 border-dashed"
									/>{" "}
									Predicted Period
								</p>
							)}
							{selectedDayDetails.isOvulation && (
								<p className="text-sm text-blue-700 mb-1 flex items-center">
									<Dot size={18} className="mr-1 -ml-1" /> Predicted Ovulation
									Day
								</p>
							)}
							{selectedDayDetails.isFertile &&
								!selectedDayDetails.isOvulation && (
									<p className="text-sm text-blue-600 mb-1">Fertile Window</p>
								)}

							{selectedDayDetails.trackingData &&
							Object.entries(selectedDayDetails.trackingData).length > 0
								? Object.entries(selectedDayDetails.trackingData).map(
										([key, value]) => (
											<p key={key} className="text-sm text-gray-700 mb-1">
												<span className="font-medium capitalize">{key}:</span>{" "}
												{String(value)}
											</p>
										)
								  )
								: !selectedDayDetails.isLoggedPeriod &&
								  !selectedDayDetails.isPredictedPeriod &&
								  !selectedDayDetails.isFertile && (
										<p className="text-sm text-gray-500">
											No specific events or logs for this day.
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
						className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50" // Increased z-index
						onClick={() => setShowOptionsModal(false)} // Close on backdrop click
					>
						<motion.div
							initial={{ scale: 0.9, y: 20 }}
							animate={{ scale: 1, y: 0 }}
							exit={{ scale: 0.9, y: 20, opacity: 0 }}
							transition={{ type: "spring", stiffness: 300, damping: 25 }}
							className="bg-white rounded-xl p-5 w-full max-w-xs"
							onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
						>
							<div className="flex justify-between items-center mb-4">
								<h3 className="text-lg font-semibold text-pink-700">
									{format(modalSelectedDate, "MMM d, yyyy")}
								</h3>
								<button
									onClick={() => setShowOptionsModal(false)}
									className="p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
									aria-label="Close modal">
									<X size={20} />
								</button>
							</div>
							<div className="space-y-3">
								{!isLoggedPeriodDay(modalSelectedDate) && (
									<button
										onClick={handleAddSinglePeriodDay}
										className="w-full flex items-center px-4 py-2 text-left text-gray-700 hover:bg-pink-50 rounded-lg transition-colors">
										<Droplets size={20} className="mr-3 text-pink-500" /> Add
										Single Period
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

								{!isLoggedPeriodDay(modalSelectedDate) && (
									<button
										onClick={handleAddPeriod}
										className="w-full flex items-center px-4 py-2 text-left text-gray-700 hover:bg-pink-50 rounded-lg transition-colors">
										<Droplets size={20} className="mr-3 text-pink-500" /> Add
										Periods ({user.periodLength} days)
									</button>
								)}

								{isLoggedPeriodDay(modalSelectedDate) && ( // Check specifically if it's a logged day
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
