// common/SnackbarContext.jsx
import { createContext, useContext, useState, useRef } from "react"

const SnackbarContext = createContext()

export const useSnackbar = () => useContext(SnackbarContext)

export const SnackbarProvider = ({ children }) => {
	const [message, setMessage] = useState("")
	const [isVisible, setIsVisible] = useState(false)
	const timerRef = useRef(null)

	const showSnackbar = (msg) => {
		setMessage(msg)
		setIsVisible(true)

		clearTimeout(timerRef.current)
		timerRef.current = setTimeout(() => {
			setIsVisible(false)
		}, 3000)
	}

	return (
		<SnackbarContext.Provider value={{ showSnackbar }}>
			{children}
			{/* Snackbar component */}
			<div
				className={`fixed bottom-5 right-5 bg-pink-500 text-white px-4 py-2 rounded-lg shadow-lg transition-all duration-300 transform ${
					isVisible ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"
				}`}>
				{message}
			</div>
		</SnackbarContext.Provider>
	)
}
