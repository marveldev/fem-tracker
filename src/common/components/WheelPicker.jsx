import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"

const WheelPicker = ({ options, initialValue, onChange }) => {
	const [selectedValue, setSelectedValue] = useState(initialValue || options[0])
	const pickerRef = useRef(null)
	const itemHeight = 50

	useEffect(() => {
		if (initialValue) {
			setSelectedValue(initialValue)
		}
	}, [initialValue])

	const handleScroll = () => {
		const scrollPosition = pickerRef.current.scrollTop
		const selectedIndex = Math.round(scrollPosition / itemHeight)
		const newValue = options[Math.min(selectedIndex, options.length - 1)]

		if (newValue !== selectedValue) {
			setSelectedValue(newValue)
			onChange(newValue)
		}
	}

	const handleItemClick = (value) => {
		setSelectedValue(value)
		onChange(value)

		const index = options.indexOf(value)
		pickerRef.current.scrollTo({
			top: index * itemHeight,
			behavior: "smooth",
		})
	}

	return (
		<div className="relative h-60 w-full mx-auto">
			{/* Selection indicator */}
			<div className="absolute inset-0 pointer-events-none">
				<div className="w-full h-full flex items-center justify-center">
					<div className="h-[50px] w-full bg-pink-500 border-t border-b border-[#ffffff56]" />
				</div>
			</div>

			<div
				ref={pickerRef}
				className="flex flex-col overflow-y-auto scrollbar-hide snap-y snap-mandatory py-12"
				style={{ scrollSnapType: "y mandatory", height: "100%" }}
				onScroll={handleScroll}>
				<div className="flex-shrink-0 h-[calc(50%-25px)]" />
				{options.map((value) => (
					<motion.div
						key={value}
						className={`flex-shrink-0 h-[50px] flex items-center justify-center snap-center cursor-pointer text-lg font-medium ${
							selectedValue === value
								? "text-white font-bold z-20"
								: "text-[#000] opacity-50"
						}`}
						onClick={() => handleItemClick(value)}
						whileTap={{ scale: 0.95 }}>
						{value}
					</motion.div>
				))}
				<div className="flex-shrink-0 h-[calc(50%-25px)]" />
			</div>
		</div>
	)
}

export default WheelPicker
