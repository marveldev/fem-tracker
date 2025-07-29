import { useContext } from "react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { Droplet, Moon, Sun, Heart } from "lucide-react"
import { format, getHours, differenceInCalendarDays } from "date-fns"
import { AppContext } from "../context/AppContext"
import { CycleWheel } from "../common"

const Home = () => {
	const { user, cycleInfo } = useContext(AppContext)
	const navigate = useNavigate()

	const today = new Date()

	const formatDate = (date) => {
		if (!date) return ""
		return format(date, "MMM d, yyyy")
	}

	const getCyclePhase = () => {
		if (cycleInfo.currentDay <= user.periodLength) {
			return {
				name: "Menstrual",
				icon: Droplet,
				message: "Take it easy—it's your period time. ❤️",
				bgColor: "bg-[#d14e87]",
			}
		} else if (cycleInfo.currentDay <= 14) {
			return {
				name: "Follicular",
				icon: Moon,
				message: "You're gaining energy—follicular vibes.",
				bgColor: "bg-[#d14e87]",
			}
		} else if (cycleInfo.currentDay <= 16) {
			return {
				name: "Ovulation",
				icon: Sun,
				message: "Ovulation day! You're at your peak fertility.",
				bgColor: "bg-[#d14e87]",
			}
		} else {
			return {
				name: "Luteal",
				icon: Heart,
				message: "This is your luteal phase—rest and reflect.",
				bgColor: "bg-[#d14e87]",
			}
		}
	}

	const phase = getCyclePhase()
	const PhaseIcon = phase.icon

	const getTimeOfDay = () => {
		const hour = getHours(today)
		if (hour >= 5 && hour < 12) {
			return "morning"
		} else if (hour >= 12 && hour < 17) {
			return "afternoon"
		} else if (hour >= 17 && hour < 21) {
			return "evening"
		} else {
			return "night"
		}
	}
	const getDateDifferenceInDays = (dateString) =>
		differenceInCalendarDays(dateString, today)

	const getFertilityStatusMessage = () => {
		if (today < cycleInfo.fertileWindow.start) {
			return "Your fertile window is coming up soon."
		} else if (today > cycleInfo.fertileWindow.end) {
			return "You've passed your fertile window for this cycle."
		} else {
			return "You're currently in your fertile window"
		}
	}

	return (
		<motion.div
			className="px-3 mt-8"
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: 20 }}
			transition={{ duration: 0.5 }}>
			<div className="h-8" />
			<div className="mb-6">
				<h3 className="text-2xl mb-2 font-semibold text-pink-700">
					Good {getTimeOfDay()}
				</h3>
				<p>
					{phase.message} <br />
					Need to log anything?
				</p>
				<button
					onClick={() => navigate("/calendar")}
					className="bg-[#5B2333] rounded-3xl text-white my-2 h-10 w-40">
					<span>Log For Today</span>
				</button>
			</div>

			{/* Cycle Phase Card */}
			<div className="p-4 rounded-xl shadow-md bg-white mb-4">
				<h3 className="text-md font-semibold text-gray-700 mb-3 flex items-center">
					<PhaseIcon className="mr-2 text-pink-600" size={18} />
					Current Phase: {phase.name}
				</h3>
				<p className="text-opacity-90">
					Day {cycleInfo.currentDay} of your cycle
				</p>
				<div className="mt-3 text-sm text-opacity-90 text-pink-700">
					<p>Next period expected on {formatDate(cycleInfo.nextPeriodDate)}</p>
				</div>
			</div>

			{/* Cycle Wheel */}
			<div className="bg-white p-4 rounded-xl mb-4 shadow-md">
				<h2 className="text-lg font-semibold mb-2 text-gray-700">
					Your Cycle Wheel
				</h2>
				<CycleWheel />
			</div>

			{/* Today's Tips */}
			<div className="bg-white p-4 rounded-xl mb-4 shadow-md">
				<h2 className="text-md font-semibold text-gray-700 mb-3">
					Today's Tips
				</h2>
				<div className="space-y-3">
					<div className="flex items-start">
						<div className="h-2 w-2 rounded-full bg-[#fb6caa] mt-2 mr-2"></div>
						<p className="text-pink-700">
							Stay hydrated to help reduce bloating during your {phase.name}{" "}
							phase.
						</p>
					</div>
					{phase.name === "Menstrual" && (
						<div className="flex items-start">
							<div className="h-2 w-2 rounded-full bg-[#fb6caa] mt-2 mr-2"></div>
							<p className="text-pink-700">
								Warm compresses can help alleviate menstrual cramps.
							</p>
						</div>
					)}
					{phase.name === "Ovulation" && user.goal === "fertility" && (
						<div className="flex items-start">
							<div className="h-2 w-2 rounded-full bg-[#fb6caa] mt-2 mr-2"></div>
							<p className="text-pink-700">
								This is your most fertile time if you're trying to conceive.
							</p>
						</div>
					)}
				</div>
			</div>

			<div className="bg-white p-4 rounded-xl mb-4 shadow-md">
				<div className="flex justify-between mb-4">
					<p className="text-md font-semibold text-gray-700">Period Length</p>
					<p className="text-opacity-90 text-pink-700">
						{user.periodLength} days
					</p>
				</div>

				<div className="flex justify-between mb-4">
					<p className="text-md font-semibold text-gray-700">Cycle length</p>
					<p className="text-opacity-90 text-pink-700">
						{user.cycleLength} days
					</p>
				</div>

				<div className="flex justify-between">
					<p className="text-md font-semibold text-gray-700">
						Last period date
					</p>
					<p className="text-opacity-90 text-pink-700">
						{formatDate(user.lastPeriod)}
					</p>
				</div>
			</div>

			{/* Upcoming */}
			<div className="bg-white p-4 rounded-xl mb-4 shadow-md">
				<h2 className="text-md font-semibold text-gray-700 mb-4">Upcoming</h2>

				<div className="space-y-4">
					<div className="bg-gray-100 p-3 rounded-xl">
						<div className="flex flex-col gap-2">
							<p className="flex gap-2 text-base font-bold text-opacity-90 text-pink-700">
								<span>
									<Droplet
										className="text-opacity-90 text-pink-700"
										size={24}
									/>
								</span>{" "}
								Next Period
							</p>
							<p className="text-4xl text-opacity-90 text-pink-700">
								{formatDate(cycleInfo.nextPeriodDate).split(",")[0]}
							</p>
						</div>
					</div>

					<div className="bg-gray-100 p-3 rounded-xl">
						<div className="flex flex-col gap-2">
							<p className="flex gap-2 text-base font-bold text-pink-700">
								<span>
									<Moon className="text-pink-700" size={24} />
								</span>{" "}
								Fertility Window
							</p>
							<p className="text-4xl text-pink-700">
								{formatDate(cycleInfo.fertileWindow.start).split(",")[0]} -{" "}
								{formatDate(cycleInfo.fertileWindow.end).split(",")[0]}
							</p>
							<p className="text-sm text-pink-700">
								{getFertilityStatusMessage()}
							</p>
						</div>
					</div>

					<div className="flex justify-between items-center bg-gray-100 p-3 rounded-xl">
						<div className="flex items-center">
							<Sun className="text-pink-700 mr-3" size={24} />
							<div>
								<p className="text-base font-bold text-pink-700">Ovulation</p>
								<p className="text-sm text-pink-700">
									{formatDate(cycleInfo.ovulationDate)}
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</motion.div>
	)
}

export default Home
