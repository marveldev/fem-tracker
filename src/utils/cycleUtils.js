import {
	addDays,
	subDays,
	differenceInDays,
	startOfDay,
	isBefore,
	isSameDay,
	parseISO,
} from "date-fns"

/**
 * Identifies the start dates of contiguous period blocks from a sorted list of period days.
 * @param {Date[]} sortedPeriodDays - Array of Date objects, sorted chronologically.
 * @returns {Date[]} An array of the start dates of each period block.
 */
const getPeriodStartDates = (sortedPeriodDays) => {
	if (!sortedPeriodDays || sortedPeriodDays.length === 0) {
		return []
	}

	const periodStarts = [sortedPeriodDays[0]] // First day is always a start

	for (let i = 1; i < sortedPeriodDays.length; i++) {
		// If the difference between current and previous day is more than 1, it's a new period start
		if (differenceInDays(sortedPeriodDays[i], sortedPeriodDays[i - 1]) > 1) {
			periodStarts.push(sortedPeriodDays[i])
		}
	}
	return periodStarts
}

/**
 * Calculates cycle predictions based on logged period start dates and user settings.
 * @param {Date[]} loggedPeriodDays - Array of Date objects for logged period days.
 * @param {number} cycleLength - Average cycle length in days.
 * @param {number} periodLength - Average period duration in days.
 * @param {Date} currentMonth - The month currently being viewed in the calendar.
 * @returns {object} An object containing arrays of dates for predictions:
 *                   { predictedPeriods, fertileWindow, ovulationDays }
 */
export const calculateCyclePredictions = (
	loggedPeriodDays,
	cycleLength,
	periodLength,
	currentMonth
) => {
	const today = startOfDay(new Date())
	const predictions = {
		predictedPeriods: [],
		fertileWindow: [],
		ovulationDays: [],
	}

	if (!loggedPeriodDays || cycleLength <= 0) {
		return predictions
	}

	// Ensure dates are Date objects and sorted
	const sortedPeriodDays = loggedPeriodDays
		.map((d) => startOfDay(typeof d === "string" ? parseISO(d) : d))
		.sort((a, b) => differenceInDays(a, b))

	const periodStartDates = getPeriodStartDates(sortedPeriodDays)

	if (periodStartDates.length === 0) {
		return predictions // Cannot predict without at least one period start
	}

	// Use the latest known period start date as the anchor for future predictions
	const latestPeriodStartDate = periodStartDates[periodStartDates.length - 1]

	// Calculate predictions for several cycles (e.g., 6 months forward/backward)
	// Adjust the range based on performance needs
	const cyclesToPredict = 6
	for (let i = -cyclesToPredict; i <= cyclesToPredict; i++) {
		const currentCycleStartDate = addDays(
			latestPeriodStartDate,
			i * cycleLength
		)

		// Skip cycles that ended long ago unless they overlap the current view
		// This is a basic optimization; more sophisticated logic might be needed
		const cycleEndDate = addDays(currentCycleStartDate, cycleLength - 1)
		// if (isBefore(cycleEndDate, subMonths(startOfMonth(currentMonth), 1))) {
		//     continue; // Skip cycles ending before the previous month
		// }

		// --- Predict Period Days for this cycle ---
		// Only predict future periods (or current if ongoing based on prediction)
		for (let dayIndex = 0; dayIndex < periodLength; dayIndex++) {
			const predictedDay = addDays(currentCycleStartDate, dayIndex)
			// Only add if it's in the future OR today, and not already a logged period day
			if (
				!isBefore(predictedDay, today) &&
				!sortedPeriodDays.some((loggedDay) =>
					isSameDay(loggedDay, predictedDay)
				)
			) {
				predictions.predictedPeriods.push(predictedDay)
			}
		}

		// --- Predict Ovulation and Fertile Window for this cycle ---
		// Ovulation is typically ~14 days before the *next* cycle starts
		const nextCycleStartDate = addDays(currentCycleStartDate, cycleLength)
		const predictedOvulationDay = subDays(nextCycleStartDate, 14)

		// Fertile window: Ovulation day and the 5 days before it
		const fertileStart = subDays(predictedOvulationDay, 5)
		for (let dayIndex = 0; dayIndex <= 5; dayIndex++) {
			const fertileDay = addDays(fertileStart, dayIndex)
			// Avoid adding duplicates if calculation overlaps
			if (
				!predictions.fertileWindow.some((existingDay) =>
					isSameDay(existingDay, fertileDay)
				)
			) {
				predictions.fertileWindow.push(fertileDay)
			}
		}

		// Avoid adding duplicate ovulation days
		if (
			!predictions.ovulationDays.some((existingDay) =>
				isSameDay(existingDay, predictedOvulationDay)
			)
		) {
			predictions.ovulationDays.push(predictedOvulationDay)
		}
	}

	// Filter out duplicates just in case (though logic above tries to prevent them)
	const uniqueDateFilter = (date, index, self) =>
		self.findIndex((d) => isSameDay(d, date)) === index

	return {
		predictedPeriods: predictions.predictedPeriods
			.filter(uniqueDateFilter)
			.sort((a, b) => differenceInDays(a, b)),
		fertileWindow: predictions.fertileWindow
			.filter(uniqueDateFilter)
			.sort((a, b) => differenceInDays(a, b)),
		ovulationDays: predictions.ovulationDays
			.filter(uniqueDateFilter)
			.sort((a, b) => differenceInDays(a, b)),
	}
}
