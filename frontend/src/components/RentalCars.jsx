import { Link, useLocation } from 'react-router-dom'

export default function RentalCars({ user }) {
	const location = useLocation()
    
	const getLinkStyle = (path) => ({
		cursor: 'pointer',
		textDecoration: location.pathname === path ? 'underline' : 'none',
		color: location.pathname === path ? '#007bff' : 'black',
		fontWeight: location.pathname === path ? 'bold' : 'normal',
	})

	return (
		<div className='d-flex my-4 p-3 bg-light rounded shadow-sm align-items-center row'>
			{/* Zakładka 1: Przeglądanie samochodów (Strona główna) */}
			<Link to='/' style={getLinkStyle('/')} className='text-decoration-none h4 mb-2 mb-lg-0 text-center text-lg-start col-12 col-xl-6'>
				<i className='bi bi-car-front me-2'></i>Auta do wypożyczenia
			</Link>

			{/* <span className='text-muted col-12 col-md-3'>|</span> */}

			{/* Zakładka 2: Moje wypożyczenia */}
			<Link to='/rentals' style={getLinkStyle('/rentals')} className='text-decoration-none text-center text-lg-end  h4 mb-0 col-12 col-xl-6'>
				<i className='bi bi-calendar-check me-2'></i>Moje wypożyczenia
			</Link>

			{user && (
				<small className='text-muted ms-auto'>
					Zalogowany jako: <strong>{user.email}</strong>
				</small>
			)}
		</div>
	)
}
