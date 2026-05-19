export default function CarCard({ car, user, onRent }) {
	return (
		<div className='col box animate-card'>
			<div className='h-100 border-0 shadow-sm rounded-4 overflow-hidden bg-white card-car-custom d-flex flex-column'>
				<div className='position-relative overflow-hidden' style={{ height: '200px' }}>
					<img src={car.zdjecie} alt={car.model} className='w-100 h-100 object-fit-cover img-transition' />
				</div>
				<div className='card-body p-4 d-flex flex-column justify-content-between flex-grow-1'>
					<div>
						<div className='d-flex justify-content-between align-items-start mb-2'>
							<h5 className='card-title fw-bold text-dark m-0'>{car.marka}</h5>
							<span
								className={`badge px-2.5 py-1.5 rounded-pill ${car.status_dostepnosci ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`}>
								{car.status_dostepnosci ? 'Dostępne' : 'Niedostępne'}
							</span>
						</div>
						<p className='card-text text-muted mb-4 small'>{car.model}</p>
					</div>
					<div className='szczegoly mt-auto'>
						<button
							className={`btn w-100 py-2 rounded-3 fw-medium ${!car.status_dostepnosci ? 'btn-light text-muted' : user ? 'btn-dark' : 'btn-outline-primary'}`}
							onClick={() => onRent(car.id)}
							disabled={!car.status_dostepnosci || !user}>
							{!car.status_dostepnosci ? 'Niedostępny' : user ? 'Wypożycz teraz' : 'Zaloguj się, aby wypożyczyć'}
						</button>
					</div>
				</div>
			</div>
		</div>
	)
}
