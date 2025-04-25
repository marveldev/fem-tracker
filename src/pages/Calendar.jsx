import { useState, useContext } from "react"
import {
	format,
	startOfMonth,
	endOfMonth,
	startOfWeek,
	endOfWeek,
	addDays,
	isSameMonth,
	isSameDay,
	subMonths,
	addMonths,
} from "date-fns"
import {
	ChevronLeft,
	ChevronRight,
	Droplet,
	Sun,
	Heart,
	Moon,
	Info,
} from "lucide-react"
import { AppContext } from "../context/AppContext"
import { SymptomLogger } from "../common"

const Calendar = () => {
	const [currentDate, setCurrentDate] = useState(new Date())
	const [selectedDate, setSelectedDate] = useState(new Date())
	const [showLogger, setShowLogger] = useState(false)
	const { cycles, cycleInfo, user } = useContext(AppContext)

	const onDateClick = (day) => {
		setSelectedDate(day)
		setShowLogger(true)
	}

	const nextMonth = () => {
		setCurrentDate(addMonths(currentDate, 1))
	}

	const prevMonth = () => {
		setCurrentDate(subMonths(currentDate, 1))
	}

	const renderHeader = () => {
		return (
			<div className="flex justify-between items-center mb-4">
				<button
					onClick={prevMonth}
					className="p-2 text-white hover:bg-[#d14e87] rounded-full transition-colors">
					<ChevronLeft size={24} />
				</button>
				<h2 className="text-xl font-bold text-white">
					{format(currentDate, "MMMM yyyy")}
				</h2>
				<button
					onClick={nextMonth}
					className="p-2 text-white hover:bg-[#d14e87] rounded-full transition-colors">
					<ChevronRight size={24} />
				</button>
			</div>
		)
	}

	const renderDays = () => {
		const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
		return (
			<div className="grid grid-cols-7 mb-2 border-b border-[#00000013] py-1">
				{days.map((day, i) => (
					<div key={i} className="text-center text-sm font-medium py-2">
						{day}
					</div>
				))}
			</div>
		)
	}

	const renderCells = () => {
		const monthStart = startOfMonth(currentDate)
		const monthEnd = endOfMonth(monthStart)
		const startDate = startOfWeek(monthStart)
		const endDate = endOfWeek(monthEnd)

		const rows = []
		let days = []
		let day = startDate

		// Check if a date is in a period
		const isInPeriod = (date) => {
			return cycles.some((cycle) => {
				const start = new Date(cycle.startDate)
				const end = new Date(cycle.endDate)
				return date >= start && date <= end
			})
		}

		// Check if a date is in the fertile window
		const isInFertileWindow = (date) => {
			if (!cycleInfo.fertileWindow.start || !cycleInfo.fertileWindow.end)
				return false
			return (
				date >= cycleInfo.fertileWindow.start &&
				date <= cycleInfo.fertileWindow.end
			)
		}

		// Check if a date is the ovulation date
		const isOvulationDay = (date) => {
			if (!cycleInfo.ovulationDate) return false
			return isSameDay(date, cycleInfo.ovulationDate)
		}

		// Get flow intensity for a specific date
		const getFlowIntensity = (date) => {
			for (const cycle of cycles) {
				const start = new Date(cycle.startDate)
				if (isSameDay(date, start)) {
					const firstDay = cycle.symptoms.find((s) => s.day === 1)
					return firstDay?.flow || null
				}

				const dayDiff = Math.floor((date - start) / (1000 * 60 * 60 * 24))
				if (dayDiff >= 0 && dayDiff < cycle.symptoms.length) {
					const symptom = cycle.symptoms.find((s) => s.day === dayDiff + 1)
					return symptom?.flow || null
				}
			}
			return null
		}

		// Get emoji for flow intensity
		const getFlowEmoji = (intensity) => {
			switch (intensity) {
				case "heavy":
					return "💧💧💧"
				case "medium":
					return "💧💧"
				case "light":
					return "💧"
				case "spotting":
					return "·"
				default:
					return ""
			}
		}

		while (day <= endDate) {
			for (let i = 0; i < 7; i++) {
				const cloneDay = day
				const isCurrentMonth = isSameMonth(day, monthStart)
				const isToday = isSameDay(day, new Date())
				const isSelected = isSameDay(day, selectedDate)
				const isPeriod = isInPeriod(day)
				const isFertile = isInFertileWindow(day)
				const isOvulation = isOvulationDay(day)
				const flowIntensity = getFlowIntensity(day)

				days.push(
					<div
						key={day}
						className={`relative p-1 h-14 border border-transparent ${
							!isCurrentMonth
								? "text-[#000000a5] opacity-50"
								: isToday
								? "border-white font-bold"
								: "text-black"
						} ${isSelected ? "bg-[#d14e87] rounded-lg" : ""}`}
						onClick={() => isCurrentMonth && onDateClick(cloneDay)}>
						<div
							className={`flex flex-col items-center justify-center h-full ${
								isPeriod
									? "bg-white bg-opacity-20 text-white rounded-lg"
									: isFertile
									? "bg-[#d14e87] bg-opacity-70 text-white rounded-lg"
									: isOvulation
									? "bg-yellow-300 bg-opacity-30 text-white rounded-lg"
									: ""
							}`}>
							<span className="text-sm font-medium">{format(day, "d")}</span>

							{isPeriod && (
								<div className="mt-1 text-xs">
									<Droplet size={12} className="inline text-red-300 mr-1" />
									<span className="text-red-300">
										{getFlowEmoji(flowIntensity)}
									</span>
								</div>
							)}

							{isFertile && !isOvulation && !isPeriod && (
								<div className="mt-1 text-xs">
									<Heart size={12} className="inline text-pink-300" />
								</div>
							)}

							{isOvulation && (
								<div className="mt-1 text-xs">
									<Sun size={12} className="inline text-yellow-300" />
								</div>
							)}
						</div>
					</div>
				)
				day = addDays(day, 1)
			}
			rows.push(
				<div key={day} className="grid grid-cols-7 gap-1">
					{days}
				</div>
			)
			days = []
		}
		return <div className="rounded-lg">{rows}</div>
	}

	return (
		<div className="px-3 mt-8">
			<p className="mb-2">Track your cycle and symptoms</p>

			<div className="bg-[#95275eab] rounded-md lg:scale-125 lg:mt-20 pt-4">
				{renderHeader()}
				<div className="bg-[#ffffffe2]">
					{renderDays()}
					{renderCells()}
				</div>

				<div className="p-3">
					<div className="grid grid-cols-2 gap-2">
						<div className="flex items-center">
							<div className="w-6 h-6 rounded-full bg-white bg-opacity-20 flex items-center justify-center mr-2">
								<Droplet size={14} className="text-red-300" />
							</div>
							<span className="text-xs text-[#f7f74b]">Period</span>
						</div>
						<div className="flex items-center">
							<div className="w-6 h-6 rounded-full bg-[#d14e87] bg-opacity-70 flex items-center justify-center mr-2">
								<Heart size={14} className="text-pink-300" />
							</div>
							<span className="text-xs text-[#f7f74b]">Fertile Window</span>
						</div>
						<div className="flex items-center">
							<div className="w-6 h-6 rounded-full bg-yellow-300 bg-opacity-30 flex items-center justify-center mr-2">
								<Sun size={14} className="text-yellow-300" />
							</div>
							<span className="text-xs text-[#f7f74b]">Ovulation</span>
						</div>
						<div className="flex items-center">
							<div className="w-6 h-6 rounded-full bg-white flex items-center justify-center mr-2">
								<Moon size={14} className="text-[#fb6caa]" />
							</div>
							<span className="text-xs text-[#f7f74b]">Today</span>
						</div>
					</div>

					{user.goal === "fertility" && (
						<div className="mt-3 pt-3 border-t border-white border-opacity-20">
							<p className="text-xs text-white text-opacity-90">
								💡 Tip: Your most fertile days are marked with{" "}
								<Heart size={12} className="inline text-pink-300" /> and{" "}
								<Sun size={12} className="inline text-yellow-300" />
							</p>
						</div>
					)}
				</div>
			</div>

			{showLogger && (
				<SymptomLogger
					date={selectedDate}
					onClose={() => setShowLogger(false)}
				/>
			)}
		</div>
	)
}

export default Calendar
