import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import MyRentalsPage from './components/MyRentalsPage.jsx'
import Navigation from './components/Navigation.jsx'

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import 'bootstrap-icons/font/bootstrap-icons.css'
import 'react-calendar/dist/Calendar.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

function AppLayout({ children }) {
	return (
		<>
			<Navigation />
			<div className='container my-3'>{children}</div>
		</>
	)
}

createRoot(document.getElementById('root')).render(
	<StrictMode>
		<Router>
			<Routes>
				<Route
					path='/'
					element={
						<AppLayout>
							<App />
						</AppLayout>
					}
				/>

				<Route
					path='/rentals'
					element={
						<AppLayout>
							<MyRentalsPage />
						</AppLayout>
					}
				/>
			</Routes>
		</Router>
	</StrictMode>,
)
