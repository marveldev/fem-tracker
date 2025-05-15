import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { ArrowLeft } from "lucide-react"
import WheelPicker from "../common/components/WheelPicker"

const PeriodLengthOnboarding = () => {
	const navigate = useNavigate()
	const [periodLength, setPeriodLength] = useState(5)
	const [cycleLength, setCycleLength] = useState(28)

	useEffect(() => {
		const savedCycleLength = localStorage.getItem("cycleLength")
		if (savedCycleLength) {
			setCycleLength(parseInt(savedCycleLength))
		} else {
			navigate("/onboarding/cycle-length")
		}
	}, [navigate])

	const periodLengthOptions = Array.from({ length: 9 }, (_, i) => i + 2) // 2-10

	const handleContinue = () => {
		localStorage.setItem("periodLength", periodLength)
		navigate("/onboarding/period-date")
	}

	const handleBack = () => {
		navigate("/onboarding/cycle-length")
	}

	return (
		<div className="flex flex-col">
			<header className="p-4 flex items-center">
				<button
					onClick={handleBack}
					className="p-2 rounded-full hover:bg-gray-100">
					<ArrowLeft size={24} className="text-black" />
				</button>
				<div className="flex-1 flex justify-center">
					<div className="w-48 h-1 bg-gray-200 rounded-full overflow-hidden">
						<div className="h-full w-2/3 bg-[#5B2333]"></div>
					</div>
				</div>
				<div className="w-10"></div> {/* Spacer for balance */}
			</header>

			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				className="flex-1 flex flex-col items-center justify-center">
				<h1 className="text-2xl font-bold px-2  mb-3 text-center">
					How long does your period usually last?
				</h1>
				<p className="text-[#393933] px-4 mb-8 text-center">
					This is the number of days you typically bleed during your period.
				</p>

				<div className="w-full mb-12">
					<WheelPicker
						options={periodLengthOptions}
						initialValue={periodLength}
						onChange={setPeriodLength}
					/>
					<p className="text-center mt-4">days</p>
				</div>

				<div className="w-full max-w-xs">
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

export default PeriodLengthOnboarding
