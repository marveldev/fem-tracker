import { useContext } from "react"
import { Droplet, Moon, Sun, Heart } from "lucide-react"
import { AppContext } from "../../context/AppContext"

const CycleWheel = () => {
	const { user, cycleInfo } = useContext(AppContext)

	// Calculate the current position in the cycle as a percentage
	const cyclePercentage = (cycleInfo.currentDay / user.cycleLength) * 100

	// Calculate the rotation angle for the marker
	const markerRotation = (cyclePercentage / 100) * 360

	// Determine which phase we're in
	const getPhaseInfo = () => {
		if (cycleInfo.currentDay <= user.periodLength) {
			return {
				name: "Menstrual",
				icon: Droplet,
				color: "text-red-400",
				description: "Your period phase",
				startPercentage: 0,
				endPercentage: (user.periodLength / user.cycleLength) * 100,
			}
		} else if (cycleInfo.currentDay <= 14) {
			return {
				name: "Follicular",
				icon: Moon,
				color: "text-blue-400",
				description: "Preparing for ovulation",
				startPercentage: (user.periodLength / user.cycleLength) * 100,
				endPercentage: (14 / user.cycleLength) * 100,
			}
		} else if (cycleInfo.currentDay <= 16) {
			return {
				name: "Ovulation",
				icon: Sun,
				color: "text-yellow-400",
				description: "Egg release phase",
				startPercentage: (14 / user.cycleLength) * 100,
				endPercentage: (16 / user.cycleLength) * 100,
			}
		} else {
			return {
				name: "Luteal",
				icon: Heart,
				color: "text-pink-400",
				description: "Post-ovulation phase",
				startPercentage: (16 / user.cycleLength) * 100,
				endPercentage: 100,
			}
		}
	}

	const currentPhase = getPhaseInfo()
	const PhaseIcon = currentPhase.icon

	// Calculate segment sizes based on cycle length
	const menstrualSegment = (user.periodLength / user.cycleLength) * 360
	const follicularSegment = ((14 - user.periodLength) / user.cycleLength) * 360
	const ovulationSegment = (2 / user.cycleLength) * 360
	const lutealSegment = ((user.cycleLength - 16) / user.cycleLength) * 360

	return (
		<div className="flex flex-col items-center my-6">
			<div className="relative w-64 h-64">
				{/* Cycle wheel */}
				<svg className="w-full h-full" viewBox="0 0 100 100">
					{/* Menstrual phase segment */}
					<path
						d="M50 10 A40 40 0 0 1 88.2 34.2 L50 50 Z"
						fill="#f87171"
						opacity="1"
					/>

					{/* Follicular phase segment */}
					<path
						d="M88.2 34.2 A40 40 0 0 1 65.8 88.2 L50 50 Z"
						fill="#60a5fa"
						opacity="1"
					/>

					{/* Ovulation phase segment */}
					<path
						d="M65.8 88.2 A40 40 0 0 1 34.2 88.2 L50 50 Z"
						fill="#fcd34d"
						opacity="1"
					/>

					{/* Luteal phase segment */}
					<path
						d="M34.2 88.2 A40 40 0 0 1 11.8 34.2 L50 50 Z"
						fill="#f472b6"
						opacity="1"
					/>

					{/* Menstrual phase segment - second half */}
					<path
						d="M11.8 34.2 A40 40 0 0 1 50 10 L50 50 Z"
						fill="#f87171"
						opacity="0.8"
					/>

					{/* Center circle */}
					<circle cx="50" cy="50" r="30" fill="white" />

					{/* Marker */}
					<g transform={`rotate(${markerRotation} 50 50)`}>
						<circle cx="50" cy="10" r="4" fill="#f7f74b" />
						<line
							x1="50"
							y1="14"
							x2="50"
							y2="20"
							stroke="#f7f74b"
							strokeWidth="2"
						/>
					</g>
				</svg>

				{/* Icons for each phase */}
				<div className="flex absolute top-4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-pink-800">
					<Droplet size={20} />
					<span>Menstrual</span>
				</div>
				<div className="absolute top-1/2 right-[-1em] transform translate-y-1/2 text-pink-800">
					<Moon size={20} />
					<span>Follicular</span>
				</div>
				<div className="flex flex-col items-center absolute bottom-5 left-1/2 transform -translate-x-1/2 translate-y-1/2 text-pink-800">
					<Sun size={20} />
					<span>Ovulation</span>
				</div>
				<div className="flex flex-col items-center absolute top-1/2 left-0 transform -translate-y-1/2 text-pink-800">
					<Heart size={20} />
					<span>Luteal</span>
				</div>

				{/* Current phase indicator in center */}
				<div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
					<PhaseIcon className={`${currentPhase.color} mb-1`} size={24} />
					<h3 className="text-lg font-semibold text-[#fb6caa]">
						{currentPhase.name}
					</h3>
					<p className="text-xs text-gray-600">{currentPhase.description}</p>
					<p className="text-sm font-medium mt-1">Day {cycleInfo.currentDay}</p>
				</div>
			</div>

			{/* Legend */}
			<div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4 text-sm bg-gray-100 p-3 rounded-xl">
				<div className="flex items-center">
					<div className="w-3 h-3 rounded-full bg-red-400 mr-2"></div>
					<span>Menstrual ({user.periodLength} days)</span>
				</div>
				<div className="flex items-center">
					<div className="w-3 h-3 rounded-full bg-blue-400 mr-2"></div>
					<span>Follicular ({14 - user.periodLength} days)</span>
				</div>
				<div className="flex items-center">
					<div className="w-3 h-3 rounded-full bg-yellow-400 mr-2"></div>
					<span>Ovulation (2 days)</span>
				</div>
				<div className="flex items-center">
					<div className="w-3 h-3 rounded-full bg-pink-400 mr-2"></div>
					<span>Luteal ({user.cycleLength - 16} days)</span>
				</div>
			</div>
		</div>
	)
}

export default CycleWheel
