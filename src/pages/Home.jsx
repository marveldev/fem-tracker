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
				<h3 className="text-2xl mb-2 text-[#353535] font-bold">
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
			<div className="p-4 rounded-md mb-6 bg-[#95275eab] text-white">
				<div className="flex items-center mb-2">
					<PhaseIcon className="mr-2" size={20} />
					<h2 className="text-lg font-semibold ">
						Current Phase: {phase.name}
					</h2>
				</div>
				<p className="text-opacity-90 text-[#f7f74b]">
					Day {cycleInfo.currentDay} of your cycle
				</p>
				<div className="mt-3 text-sm text-opacity-90 text-[#f7f74b]">
					<p>Next period expected on {formatDate(cycleInfo.nextPeriodDate)}</p>
				</div>
			</div>

			{/* Cycle Wheel */}
			<div className="bg-[#95275eab] p-4 rounded-md mb-6">
				<h2 className="text-lg font-semibold mb-2 text-white">
					Your Cycle Wheel
				</h2>
				<CycleWheel />
			</div>

			{/* Today's Tips */}
			<div className="bg-[#95275eab] text-white p-4 rounded-md mb-6">
				<h2 className="text-lg font-semibold mb-3">Today's Tips</h2>
				<div className="space-y-3">
					<div className="flex items-start">
						<div className="h-2 w-2 rounded-full bg-[#fb6caa] mt-2 mr-2"></div>
						<p className="text-[#f7f74b]">
							Stay hydrated to help reduce bloating during your {phase.name}{" "}
							phase.
						</p>
					</div>
					{phase.name === "Menstrual" && (
						<div className="flex items-start">
							<div className="h-2 w-2 rounded-full bg-[#fb6caa] mt-2 mr-2"></div>
							<p className="text-[#f7f74b]">
								Warm compresses can help alleviate menstrual cramps.
							</p>
						</div>
					)}
					{phase.name === "Ovulation" && user.goal === "fertility" && (
						<div className="flex items-start">
							<div className="h-2 w-2 rounded-full bg-[#fb6caa] mt-2 mr-2"></div>
							<p className="text-[#f7f74b]">
								This is your most fertile time if you're trying to conceive.
							</p>
						</div>
					)}
				</div>
			</div>

			<div className="bg-[#95275eab] text-white p-4 rounded-md mb-6">
				<div className="flex justify-between mb-4">
					<p className="font-bold">Period Length</p>
					<p className="text-[#f7f74b]">{user.periodLength} days</p>
				</div>

				<div className="flex justify-between mb-4">
					<p className="font-bold">Cycle length</p>
					<p className="text-[#f7f74b]">{user.cycleLength} days</p>
				</div>

				<div className="flex justify-between">
					<p className="font-bold">Last period date</p>
					<p className="text-[#f7f74b]">{formatDate(user.lastPeriod)}</p>
				</div>
			</div>

			{/* Upcoming */}
			<div className="bg-[#95275eab] text-white p-5 rounded-md">
				<h2 className="text-xl font-bold mb-4">Upcoming</h2>

				<div className="space-y-4">
					<div className="bg-white bg-opacity-10 p-3 rounded-xl shadow-sm">
						<div className="flex flex-col gap-2">
							<p className="flex gap-2 text-base font-bold text-[#fdfdfd]">
								<span>
									<Droplet className="text-[#f7f74b]" size={24} />
								</span>{" "}
								Next Period
							</p>
							<p className="text-4xl text-[#f7f74b]">
								{formatDate(cycleInfo.nextPeriodDate).split(",")[0]}
							</p>
							<p className="text-s text-[#f7f74b]">
								in {getDateDifferenceInDays(cycleInfo.nextPeriodDate)} days
							</p>
						</div>
					</div>

					<div className="bg-white bg-opacity-10 p-3 rounded-xl shadow-sm">
						<div className="flex flex-col gap-2">
							<p className="flex gap-2 text-base font-bold text-[#fdfdfd]">
								<span>
									<Moon className="text-[#f7f74b]" size={24} />
								</span>{" "}
								Fertility Window
							</p>
							<p className="text-4xl text-[#f7f74b]">
								{formatDate(cycleInfo.fertileWindow.start).split(",")[0]} -{" "}
								{formatDate(cycleInfo.fertileWindow.end).split(",")[0]}
							</p>
							<p className="text-sm text-[#f7f74b]">
								{getFertilityStatusMessage()}
							</p>
						</div>
					</div>

					<div className="flex justify-between items-center bg-white bg-opacity-10 p-3 rounded-xl shadow-sm">
						<div className="flex items-center">
							<Sun className="text-[#f7f74b] mr-3" size={24} />
							<div>
								<p className="text-base font-bold text-[#fdfdfd]">Ovulation</p>
								<p className="text-sm text-[#f7f74b]">
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
