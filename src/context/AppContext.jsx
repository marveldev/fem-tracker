import { createContext, useState, useEffect } from "react"

export const AppContext = createContext()

export const ContextProvider = ({ children }) => {
	const saved = JSON.parse(localStorage.getItem("userData")) || {}

	const getValidDate = (dateStr) => {
		const d = new Date(dateStr)
		return isNaN(d) ? new Date() : d
	}

	// User data
	const [user, setUser] = useState({
		goal: saved.goal || "tracking",
		cycleLength: saved.cycleLength || 28,
		periodLength: saved.periodLength || 5,
		lastPeriod: getValidDate(saved.lastPeriodStartDate),
	})

	// Period tracking data
	const [cycles, setCycles] = useState([
		{
			id: 1,
			startDate: new Date(2023, 3, 15),
			endDate: new Date(2023, 3, 20),
			symptoms: [
				{
					day: 1,
					flow: "heavy",
					mood: "irritable",
					pain: "moderate",
					notes: "Cramps in the morning",
				},
				{
					day: 2,
					flow: "heavy",
					mood: "tired",
					pain: "severe",
					notes: "Took pain medication",
				},
				{ day: 3, flow: "medium", mood: "normal", pain: "mild", notes: "" },
				{ day: 4, flow: "light", mood: "normal", pain: "none", notes: "" },
				{
					day: 5,
					flow: "spotting",
					mood: "energetic",
					pain: "none",
					notes: "",
				},
			],
		},
		{
			id: 2,
			startDate: new Date(2023, 4, 12),
			endDate: new Date(2023, 4, 17),
			symptoms: [
				{ day: 1, flow: "medium", mood: "anxious", pain: "mild", notes: "" },
				{
					day: 2,
					flow: "heavy",
					mood: "tired",
					pain: "moderate",
					notes: "Headache in the afternoon",
				},
				{ day: 3, flow: "medium", mood: "normal", pain: "mild", notes: "" },
				{ day: 4, flow: "light", mood: "normal", pain: "none", notes: "" },
				{ day: 5, flow: "spotting", mood: "happy", pain: "none", notes: "" },
			],
		},
	])

	// Calculate current cycle day and predictions
	const [cycleInfo, setCycleInfo] = useState({
		currentDay: 0,
		nextPeriodDate: null,
		fertileWindow: { start: null, end: null },
		ovulationDate: null,
	})

	useEffect(() => {
		// Calculate current cycle day and predictions based on last period
		const today = new Date()
		const lastPeriod = new Date(user.lastPeriod)
		const daysSinceLastPeriod = Math.floor(
			(today - lastPeriod) / (1000 * 60 * 60 * 24)
		)

		const currentDay = (daysSinceLastPeriod % user.cycleLength) + 1

		const nextPeriodDate = new Date(lastPeriod)
		nextPeriodDate.setDate(
			lastPeriod.getDate() +
				Math.ceil(daysSinceLastPeriod / user.cycleLength) * user.cycleLength
		)

		const ovulationDate = new Date(lastPeriod)
		ovulationDate.setDate(
			lastPeriod.getDate() +
				Math.ceil(daysSinceLastPeriod / user.cycleLength) * user.cycleLength -
				14
		)

		const fertileStart = new Date(ovulationDate)
		fertileStart.setDate(ovulationDate.getDate() - 5)

		const fertileEnd = new Date(ovulationDate)
		fertileEnd.setDate(ovulationDate.getDate() + 1)

		setCycleInfo({
			currentDay,
			nextPeriodDate,
			fertileWindow: { start: fertileStart, end: fertileEnd },
			ovulationDate,
		})
	}, [user.lastPeriod, user.cycleLength])

	// Add symptom data
	const logSymptom = (date, symptomData) => {
		// Find if there's an existing cycle for this date
		const cycleIndex = cycles.findIndex(
			(cycle) => date >= cycle.startDate && date <= cycle.endDate
		)

		if (cycleIndex >= 0) {
			// Update existing cycle
			const updatedCycles = [...cycles]
			const cycle = updatedCycles[cycleIndex]
			const dayIndex = Math.floor(
				(date - cycle.startDate) / (1000 * 60 * 60 * 24)
			)

			if (cycle.symptoms[dayIndex]) {
				cycle.symptoms[dayIndex] = {
					...cycle.symptoms[dayIndex],
					...symptomData,
				}
			} else {
				cycle.symptoms[dayIndex] = { day: dayIndex + 1, ...symptomData }
			}

			setCycles(updatedCycles)
		} else {
			// Create new cycle if this is a period start
			if (
				symptomData.flow &&
				["light", "medium", "heavy"].includes(symptomData.flow)
			) {
				const endDate = new Date(date)
				endDate.setDate(date.getDate() + user.periodLength - 1)

				const newCycle = {
					id: cycles.length + 1,
					startDate: new Date(date),
					endDate,
					symptoms: [{ day: 1, ...symptomData }],
				}

				setCycles([...cycles, newCycle])

				// Update last period date
				setUser({ ...user, lastPeriod: date })
			}
		}
	}

	return (
		<AppContext.Provider
			value={{
				user,
				setUser,
				cycles,
				setCycles,
				cycleInfo,
				logSymptom,
			}}>
			{children}
		</AppContext.Provider>
	)
}
