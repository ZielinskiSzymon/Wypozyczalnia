import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth' // Importujemy uwierzytelnianie

export default function RentalCars() {
	const location = useLocation()
	const { user } = useAuth() // Pobieramy stan zalogowania

	const isActive = (path) => location.pathname === path

	return (
		<nav className='navbar navbar-expand bg-white rounded-3 shadow-sm px-3 py-2 mb-4'>
			<div className='container-fluid px-0'>
				<div className='d-flex w-100 justify-content-center justify-content-sm-between align-items-center gap-2 flex-wrap'>
					<Link
						to='/'
						className={`navbar-brand-link text-decoration-none d-flex align-items-center gap-2 fs-5 ${isActive('/') ? 'active' : ''}`}>
						<i className='bi bi-car-front-fill'></i>
						Auta do wypożyczenia
					</Link>

					{/* Zakładka pokazuje się TYLKO dla zalogowanych */}
					{user && (
						<Link
							to='/rentals'
							className={`navbar-brand-link text-decoration-none d-flex align-items-center gap-2 fs-5 ${isActive('/rentals') ? 'active' : ''}`}>
							<i className='bi bi-calendar-check-fill'></i>
							Moje wypożyczenia
						</Link>
					)}
				</div>
			</div>
		</nav>
	)
}
