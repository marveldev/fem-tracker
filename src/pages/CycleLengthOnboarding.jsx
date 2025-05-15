import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import { motion } from "framer-motion"
import WheelPicker from "../common/components/WheelPicker"

const CycleLengthOnboarding = () => {
	const navigate = useNavigate()
	const [cycleLength, setCycleLength] = useState(23)

	const cycleLengthOptions = Array.from({ length: 20 }, (_, i) => i + 21) // 21-40

	const handleContinue = () => {
		localStorage.setItem("cycleLength", cycleLength)
		navigate("/onboarding/period-length")
	}

	return (
		<div className="flex flex-col">
			<header className="p-4 flex items-center">
				<button
					onClick={() => navigate("/")}
					className="p-2 rounded-full hover:bg-gray-100">
					<ArrowLeft size={24} className="text-black" />
				</button>
				<div className="flex-1 flex justify-center">
					<div className="w-48 h-1 bg-gray-200 rounded-full overflow-hidden">
						<div className="h-full w-1/3 bg-[#5B2333]"></div>
					</div>
				</div>
				<div className="w-10"></div> {/* Spacer for balance */}
			</header>

			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				className="flex-1 flex flex-col items-center justify-center">
				<h1 className="text-2xl font-bold mb-3 text-center px-2">
					How long is your cycle?
				</h1>
				<p className="text-[#393933] mb-8 text-center px-4">
					A menstrual cycle begins on the first day of your period and ends the
					day before your next period starts.
				</p>

				<div className="w-full mb-12">
					<WheelPicker
						options={cycleLengthOptions}
						initialValue={cycleLength}
						onChange={setCycleLength}
					/>
					<p className="text-center mt-4">days</p>
				</div>

				<div className="w-full max-w-xs px-2">
					<button
						onClick={handleContinue}
						className="w-full bg-[#5B2333] text-white py-3 rounded-full font-semibold shadow-md hover:bg-pink-700 transition-colors">
						Continue
					</button>
				</div>
			</motion.div>
		</div>
	)
}

export default CycleLengthOnboarding
