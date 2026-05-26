import { NavLink } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import AuthZone from './AuthZone'

export default function Navigation() {
	const { user, logout } = useAuth()

	const handleLogout = async () => {
		await logout()
	}

	return (
		<>
			<nav className='desktop-top-nav navbar navbar-expand bg-white border-bottom shadow-sm py-3 mb-4 sticky-top'>
				<div className='container d-flex justify-content-between align-items-center'>
					<div className='d-flex align-items-center gap-4'>
						<span
							className='navbar-brand m-0 fw-extrabold text-primary fs-4 d-flex align-items-center gap-2'
							style={{ letterSpacing: '-0.5px' }}>
							<i className='bi bi-car-front-fill fs-3'></i>
							<span className='fw-bold text-dark'>Wypożyczalnia</span>
						</span>

						<div className='d-flex gap-2'>
							<NavLink
								to='/'
								className={({ isActive }) => `navbar-brand-link text-decoration-none ${isActive ? 'active' : ''}`}>
								Flota
							</NavLink>
							{user && (
								<NavLink
									to='/rentals'
									className={({ isActive }) => `navbar-brand-link text-decoration-none ${isActive ? 'active' : ''}`}>
									Moje Rezerwacje
								</NavLink>
							)}
						</div>
					</div>

					<div className='d-flex align-items-center gap-3'>
						<AuthZone user={user} onLogout={handleLogout} />
					</div>
				</div>
			</nav>

			<nav className='mobile-bottom-nav shadow-lg'>
				<NavLink to='/' className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
					<i className='bi bi-car-front-fill'></i>
					<span>Flota</span>
				</NavLink>

				<NavLink to='/rentals' className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
					<i className='bi bi-calendar-check-fill'></i>
					<span>Rezerwacje</span>
				</NavLink>

				{/* Przycisk otwierający dolną szufladę z logowaniem */}
				<button className='mobile-nav-item' type='button' data-bs-toggle='offcanvas' data-bs-target='#mobileAuthDrawer'>
					<div className='position-relative'>
						<i className={`bi ${user ? 'bi-person-check-fill text-success' : 'bi-person-circle'}`}></i>
						{user && (
							<span className='position-absolute top-0 start-100 translate-middle p-1 bg-success border border-light rounded-circle'></span>
						)}
					</div>
					<span>{user ? 'Profil' : 'Konto'}</span>
				</button>
			</nav>

			<div
				className='offcanvas offcanvas-bottom'
				tabIndex='-1'
				id='mobileAuthDrawer'
				style={{ height: 'auto', maxHeight: '80vh' }}>
				<div className='offcanvas-header border-bottom bg-light py-3 px-4'>
					<h5 className='offcanvas-title fw-bold text-dark d-flex align-items-center gap-2'>
						<i className='bi bi-person-circle text-primary'></i>
						{user ? 'Twój Profil' : 'Logowanie i Rejestracja'}
					</h5>
					<button
						type='button'
						className='btn-close shadow-none'
						data-bs-dismiss='offcanvas'
						aria-label='Close'></button>
				</div>
				<div className='offcanvas-body'>
					<AuthZone user={user} onLogout={handleLogout} />
				</div>
			</div>
		</>
	)
}
