import { useState } from "react"
import {
	format,
	startOfMonth,
	endOfMonth,
	eachDayOfInterval,
	isSameDay,
	addMonths,
	subMonths,
	isAfter,
} from "date-fns"
import { ChevronLeft, ChevronRight } from "lucide-react"

const CalendarPicker = ({ onSelectDate, selectedDate }) => {
	const [currentMonth, setCurrentMonth] = useState(new Date())
	const today = new Date()

	const daysInMonth = eachDayOfInterval({
		start: startOfMonth(currentMonth),
		end: endOfMonth(currentMonth),
	})

	const startDay = startOfMonth(currentMonth).getDay()

	const handlePrevMonth = () => {
		setCurrentMonth((prevMonth) => subMonths(prevMonth, 1))
	}

	const handleNextMonth = () => {
		setCurrentMonth((prevMonth) => addMonths(prevMonth, 1))
	}

	const handleDateClick = (date) => {
		if (isAfter(date, today)) {
			return false // Return false to indicate invalid date
		}
		onSelectDate(date)
		return true // Return true to indicate valid date
	}

	const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

	return (
		<div className="w-full max-w-md mx-auto bg-white rounded-lg shadow p-4">
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

			<div className="grid grid-cols-7 gap-1">
				{weekDays.map((day) => (
					<div
						key={day}
						className="text-center text-sm font-medium text-gray-500 py-2">
						{day}
					</div>
				))}

				{Array(startDay)
					.fill(null)
					.map((_, index) => (
						<div key={`empty-${index}`} className="h-10"></div>
					))}

				{daysInMonth.map((day) => {
					const isToday = isSameDay(day, today)
					const isSelected = selectedDate && isSameDay(day, selectedDate)
					const isFuture = isAfter(day, today)

					return (
						<button
							key={day.toString()}
							onClick={() => handleDateClick(day)}
							disabled={isFuture}
							className={`
                h-10 w-10 rounded-full mx-auto flex items-center justify-center text-sm
                ${
									isFuture
										? "text-gray-300 cursor-not-allowed"
										: "hover:bg-pink-100"
								}
                ${isToday ? "border border-pink-400" : ""}
                ${isSelected ? "bg-[#5B2333] text-white" : ""}
              `}>
							{format(day, "d")}
						</button>
					)
				})}
			</div>
		</div>
	)
}

export default CalendarPicker
