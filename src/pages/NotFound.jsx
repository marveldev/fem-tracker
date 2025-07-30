import { Link } from "react-router-dom"
import { AlertTriangle } from "lucide-react"

const NotFound = () => {
	return (
		<div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
			<AlertTriangle size={48} className="text-red-500 mb-4" />
			<h1 className="text-4xl font-bold text-black-800 mb-2">404</h1>
			<p className="text-lg text-black-600 mb-6">
				Sorry, the page you’re looking for doesn’t exist.
			</p>
			<Link
				to="/"
				className="inline-block bg-[#5B2333]  hover:bg-pink-700 text-white px-5 py-2 rounded-full transition">
				Go Home
			</Link>
		</div>
	)
}

export default NotFound
