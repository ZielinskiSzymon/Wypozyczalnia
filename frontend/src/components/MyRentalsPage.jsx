import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../utils/supabase';
import { getUserRentals, deleteRental } from '../services/rentService';

const dateFormatter = new Intl.DateTimeFormat('pl-PL', {
	day: '2-digit',
	month: 'short',
	year: 'numeric',
});

const priceFormatter = new Intl.NumberFormat('pl-PL', {
	style: 'currency',
	currency: 'PLN',
	minimumFractionDigits: 0,
});

export default function MyRentalsPage() {
	const { user } = useAuth();
	const [rentals, setRentals] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const fetchUserRentals = async () => {
		try {
			const {
				data: { session },
			} = await supabase.auth.getSession();

			if (!session) {
				setError('Musisz być zalogowany, aby zobaczyć swoje rezerwacje.');
				setLoading(false);
				return;
			}

			const token = session.access_token;
			const data = await getUserRentals(token);
			setRentals(data || []);
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (user) {
			fetchUserRentals();
		} else {
			setLoading(false);
		}
	}, [user]);

	const handleDelete = async (rentalId) => {
		try {
			const { data: { session } } = await supabase.auth.getSession();
			if (!session) return;

			// Wywołanie usunięcia z API
			await deleteRental(rentalId, session.access_token);
			
			// Usunięcie elementu ze stanu komponentu, aby zniknął z ekranu bez przeładowania
			setRentals(rentals.filter(rental => rental.id !== rentalId));
		} catch (err) {
			alert(err.message);
		}
	};

	if (!user) {
		return (
			<div className='container py-5'>
				<div className='alert alert-warning border-0 shadow-sm rounded-4 text-center p-4'>
					<i className='bi bi-person-lock fs-1 d-block mb-2'></i>
					<h5 className='mb-0'>Zaloguj się, aby zobaczyć swoje auta.</h5>
				</div>
			</div>
		);
	}

	if (loading) {
		return (
			<div className='container py-5 d-flex justify-content-center align-items-center' style={{ minHeight: '50vh' }}>
				<div className='spinner-border text-primary' role='status' style={{ width: '3rem', height: '3rem' }}>
					<span className='visually-hidden'>Ładowanie...</span>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className='container py-5'>
				<div className='alert alert-danger border-0 shadow-sm rounded-4 p-4'>
					<i className='bi bi-exclamation-triangle-fill me-2'></i>
					<strong>Błąd:</strong> {error}
				</div>
			</div>
		);
	}

	return (
		<div className='container py-4'>
			<div className='d-flex align-items-center mb-4 pb-2 border-bottom'>
				<div className='bg-primary bg-opacity-10 text-primary rounded-circle px-4 py-3 me-3 d-flex align-items-center justify-content-center'>
					<i className='bi bi-car-front fs-4'></i>
				</div>
				<h2 className='mb-0 fw-bold'>Twoje wypożyczenia</h2>
			</div>

			{rentals.length === 0 ? (
				<div className='text-center py-5 bg-light rounded-4 shadow-sm border border-light'>
					<i className='bi bi-journal-x text-muted' style={{ fontSize: '4rem' }}></i>
					<h4 className='mt-3 text-secondary'>Brak historii wypożyczeń</h4>
					<p className='text-muted mb-0'>Gdy wypożyczysz samochód, pojawi się on w tym miejscu.</p>
				</div>
			) : (
				<div className='row g-4'>
					{rentals.map((rental) => (
						<div key={rental.id} className='col-12 col-md-6 col-xl-4'>
							<div className='card h-100 border-0 shadow-sm rounded-4 overflow-hidden'>
								<div className='bg-primary' style={{ height: '6px' }}></div>
								
								<div className='card-body p-4 d-flex flex-column'>
									<div className='d-flex justify-content-between align-items-start mb-3'>
										<h5 className='card-title fw-bold mb-0 text-truncate' title={`${rental.auta?.marka} ${rental.auta?.model}`}>
											{rental.auta?.marka} {rental.auta?.model}
										</h5>
										<span className='badge bg-light text-dark border'>Zrealizowano</span>
									</div>

									<div className='mb-4 flex-grow-1'>
										<div className='d-flex align-items-center mb-2 text-muted'>
											<i className='bi bi-calendar-event me-2 text-primary'></i>
											<span className='small'>
												<strong>Od:</strong> {dateFormatter.format(new Date(rental.data_wypozyczenia))}
											</span>
										</div>
										<div className='d-flex align-items-center text-muted'>
											<i className='bi bi-calendar-check me-2 text-primary'></i>
											<span className='small'>
												<strong>Do:</strong> {dateFormatter.format(new Date(rental.data_zwrotu))}
											</span>
										</div>
									</div>

									<div className='pt-3 border-top mt-auto d-flex justify-content-between align-items-center'>
										<button 
											onClick={() => handleDelete(rental.id)}
											className='btn btn-sm btn-outline-danger d-flex align-items-center gap-1'
										>
											<i className='bi bi-trash-fill'></i> Usuń
										</button>
										<span className='fs-5 fw-bold text-success'>
											{priceFormatter.format(rental.cena_calkowita)}
										</span>
									</div>
								</div>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}