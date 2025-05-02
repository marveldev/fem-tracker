import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Calendar, Heart } from "lucide-react"

const Welcome = () => {
	const navigate = useNavigate()

	return (
		<div className="min-h-screen flex flex-col items-center justify-between px-6 mt-4">
			<div className="w-full max-w-md flex flex-col items-center">
				<motion.div
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8 }}
					className="text-center">
					<h1 className="text-3xl font-bold mb-2">FemTracker</h1>
					<p className="text-[#393933]">Your Menstrual Health Companion</p>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, scale: 0.5 }}
					animate={{ opacity: 1, scale: 0.7 }}
					transition={{ duration: 0.8, delay: 0.2 }}
					className="w-full flex justify-center mb-10">
					<div className="relative w-60 h-60">
						<div className="absolute inset-0 bg-pink-200 rounded-full opacity-20"></div>
						<div className="absolute inset-4 bg-pink-300 rounded-full flex items-center justify-center">
							<div className="text-pink-600 flex flex-col items-center">
								<Calendar size={40} className="mb-2" />
								<Heart size={40} />
							</div>
						</div>
					</div>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8, delay: 0.4 }}
					className="text-center mb-12">
					<h2 className="text-xl font-semibold mb-4">
						Track your cycle with ease
					</h2>
					<p className="text-[#393933]">
						Understand your body better, track your periods, and plan ahead with
						our simple and intuitive app.
					</p>
				</motion.div>

				<motion.button
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8, delay: 0.6 }}
					onClick={() => navigate("/onboarding/cycle-length")}
					className="w-full max-w-md bg-[#5B2333] text-white py-4 rounded-full font-semibold hover:bg-pink-700 transition-colors">
					Get Started
				</motion.button>
			</div>
		</div>
	)
}

export default Welcome
