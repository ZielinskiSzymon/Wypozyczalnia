export default function CarCard({ car, user, onSelectCar }) {
	return (
		<div className='col box animate-card' onClick={() => onSelectCar(car)} style={{ cursor: 'pointer' }}>
			<div className='h-100 border-0 shadow-sm rounded-4 overflow-hidden bg-white card-car-custom d-flex flex-column'>
				<div className='position-relative overflow-hidden' style={{ height: '200px' }}>
					<img src={car.zdjecie} alt={car.model} className='w-100 h-100 object-fit-cover img-transition' />
				</div>

				<div className='card-body p-4 d-flex flex-column justify-content-between flex-grow-1'>
					<div className='d-flex justify-content-between align-items-start flex-wrap mb-3'>
						<div>
							<h5 className='card-title fw-bold text-dark m-0'>{car.marka}</h5>
							<p className='card-text text-muted small m-0'>{car.model}</p>
						</div>
						<div className='text-end'>
							<div className='text-muted' style={{ fontSize: '0.7rem' }}>
								od
							</div>
							<div className='d-flex align-items-baseline'>
								<span className='fw-bold' style={{ color: 'royalblue', fontSize: '1.2rem' }}>
									{car.cena_za_dobe} PLN
								</span>
								<span className='ms-1 text-muted' style={{ fontSize: '0.7rem' }}>
									/ doba
								</span>
							</div>
						</div>
					</div>

					<div className='d-grid gap-1 mb-4' style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(85px, 1fr))' }}>
						<span
							className='badge rounded-pill bg-light text-dark px-2 py-2 d-flex align-items-center justify-content-center'
							style={{ fontSize: '0.7rem', fontWeight: '500' }}>
							<i className='bi bi-gear-wide-connected text-dark me-2'></i>
							{car.skrzynia_biegow}
						</span>
						<span
							className='badge rounded-pill bg-light text-dark px-2 py-2 d-flex align-items-center justify-content-center'
							style={{ fontSize: '0.7rem', fontWeight: '500' }}>
							<i className='bi bi-fuel-pump text-dark me-2'></i>
							{car.rodzaj_paliwa}
						</span>
						<span
							className='badge rounded-pill bg-light text-dark px-2 py-2 d-flex align-items-center justify-content-center'
							style={{ fontSize: '0.7rem', fontWeight: '500' }}>
							<i className='bi bi-people text-dark me-2'></i>
							{car.liczba_miejsc} osób
						</span>
					</div>

					<div className='szczegoly mt-auto'>
						<button
							className={`btn w-100 py-2 rounded-3 fw-medium ${user ? 'btn-dark' : 'btn-outline-primary'}`}
							onClick={(e) => {
								e.stopPropagation()
								onSelectCar(car)
							}}
							disabled={!user}>
							{user ? 'Wypożycz teraz' : 'Zaloguj się, aby wypożyczyć'}
						</button>
					</div>
				</div>
			</div>
		</div>
	)
}
