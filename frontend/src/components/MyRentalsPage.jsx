import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../utils/supabase'
import { getUserRentals } from '../services/rentService' // Importujemy naszą nową metodę

export default function MyRentalsPage() {
	const { user } = useAuth()
	const [rentals, setRentals] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)

	useEffect(() => {
		const fetchUserRentals = async () => {
			try {
				// Pobieramy aktualną sesję, aby wyciągnąć token Bearer
				const {
					data: { session },
				} = await supabase.auth.getSession()

				if (!session) {
					setError('Musisz być zalogowany')
					setLoading(false)
					return
				}

				const token = session.access_token
				const data = await getUserRentals(token) // Wywołanie metody z services
				setRentals(data)
			} catch (err) {
				setError(err.message)
			} finally {
				setLoading(false)
			}
		}

		if (user) {
			fetchUserRentals()
		}
	}, [user])

	if (!user) return <div className='alert alert-warning mt-3'>Zaloguj się, aby zobaczyć swoje auta.</div>
	if (loading)
		return (
			<div className='text-center mt-4'>
				<div className='spinner-border text-primary'></div>
			</div>
		)
	if (error) return <div className='alert alert-danger mt-3'>Błąd: {error}</div>

	return (
		<div className='card p-4 shadow-sm mt-3'>
			<h3>
				<i className='bi bi-clock-history me-2'></i>Twoje wypożyczone samochody
			</h3>
			<hr />
			{rentals.length === 0 ? (
				<div className='alert alert-info'>Nie masz jeszcze żadnych zamówień.</div>
			) : (
				<div className='row'>
					{rentals.map((rental) => (
						<div key={rental.id} className='col-12 col-md-6 col-lg-4 mb-3'>
							<div className='card h-100 border-primary'>
								<div className='card-body'>
									{/* auta to relacja pobrana z Supabase dzięki złączeniu (join) na backendzie */}
									<h5 className='card-title'>
										{rental.auta?.marka} {rental.auta?.model}
									</h5>
									<p className='card-text mb-1'>
										<strong>Od:</strong> {new Date(rental.data_wypozyczenia).toLocaleDateString()}
									</p>
									<p className='card-text mb-1'>
										<strong>Do:</strong> {new Date(rental.data_zwrotu).toLocaleDateString()}
									</p>
									<h6 className='text-success mt-2'>Koszt całkowity: {rental.cena_calkowita} PLN</h6>
								</div>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	)
}
