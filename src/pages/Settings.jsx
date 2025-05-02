import { useContext, useState } from "react"
import { Calendar, Save } from "lucide-react"
import { AppContext } from "../context/AppContext"
// import { useSnackbar } from "../common"

const Settings = () => {
	const { user, setUser } = useContext(AppContext)
	// const { showSnackbar } = useSnackbar()
	const [formData, setFormData] = useState({
		goal: user.goal,
		cycleLength: user.cycleLength,
		periodLength: user.periodLength,
	})
	const handleChange = (e) => {
		const { name, value, type, checked } = e.target
		setFormData((prev) => ({
			...prev,
			[name]: type === "checkbox" ? checked : value,
		}))
	}

	const handleSave = () => {
		setUser({
			...user,
			...formData,
		})

		// showSnackbar("Settings saved successfully! 🎉")
	}

	return (
		<div className="px-3 mt-8">
			<div className="p-4 rounded-md mb-6 bg-[#95275eab] text-white">
				<h3 className="text-lg font-semibold mb-4 flex items-center">
					<Calendar size={20} className="mr-2" />
					Cycle Details
				</h3>

				<div className="space-y-4">
					<div>
						<label className="block mb-2 text-sm font-medium text-[#f7f74b]">
							Cycle Length (days)
						</label>
						<input
							type="number"
							name="cycleLength"
							min="21"
							max="45"
							value={formData.cycleLength}
							onChange={handleChange}
							className="bg-white bg-opacity-10 w-full p-3 border border-gray-300 rounded-lg focus:border-[#fb6caa] focus:ring-1 focus:ring-[#fb6caa] focus:outline-none"
						/>
					</div>

					<div>
						<label className="block mb-2 text-sm font-medium text-[#f7f74b]">
							Period Length (days)
						</label>
						<input
							type="number"
							name="periodLength"
							min="1"
							max="10"
							value={formData.periodLength}
							onChange={handleChange}
							className="bg-white bg-opacity-10 w-full p-3 border border-gray-300 rounded-lg focus:border-[#fb6caa] focus:ring-1 focus:ring-[#fb6caa] focus:outline-none"
						/>
					</div>

					<div>
						<label className="block mb-2 text-sm font-medium text-[#f7f74b]">
							Tracking Goal
						</label>
						<select
							name="goal"
							value={formData.goal}
							onChange={handleChange}
							className="bg-white bg-opacity-10 w-full p-3 border border-gray-300 rounded-lg focus:border-[#fb6caa] focus:ring-1 focus:ring-[#fb6caa] focus:outline-none">
							<option value="tracking">Period Tracking</option>
							<option value="fertility">Fertility Planning</option>
						</select>
					</div>
				</div>

				<button
					onClick={handleSave}
					className="w-full mt-4 py-3 bg-[#5B2333] text-white rounded-lg font-medium flex items-center justify-center hover:bg-[#d14e87] transition-colors">
					<Save size={18} className="mr-2" />
					Save Changes
				</button>
			</div>

			<div className="p-4 rounded-md mb-6 bg-[#95275eab] text-white">
				<p>About FemTrack</p>
				<div className="bg-white bg-opacity-10 p-4 rounded mt-6">
					<p className="text-[#f7f74b]">
						FemTrack is a privacy-first period tracker app to help you
						understand and navigate your menstrual journey.
					</p>
					<p className="text-xs">Version 1.0.0</p>
				</div>
			</div>
		</div>
	)
}

export default Settings
