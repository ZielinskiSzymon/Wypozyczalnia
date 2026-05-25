import { useEffect } from 'react'

export function CarInfoCard({ car, user, onSelectCar, onClose }) {
	useEffect(() => {
		const prevPadding = document.body.style.paddingRight || ''
		const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth
		if (scrollBarWidth > 0) document.body.style.paddingRight = `${scrollBarWidth}px`
		document.body.style.overflow = 'hidden'
		return () => {
			document.body.style.overflow = ''
			document.body.style.paddingRight = prevPadding
		}
	}, [])

	return (
		<div
			className='position-fixed top-0 start-0 vh-100 vw-100 d-flex justify-content-center align-items-center p-2 p-sm-3'
			style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 1050 }}
			onClick={onClose}>
			<div
				className='bg-white p-3 p-sm-4 p-md-5 rounded-4 position-relative overflow-y-auto w-100'
				style={{ minWidth: '320px', maxWidth: '800px', maxHeight: '95vh' }}
				onClick={(e) => e.stopPropagation()}>
				<div className='w-100 d-flex justify-content-end'>
					<button
						className='btn-close'
						style={{ top: '1.25rem', right: '1.25rem', zIndex: 10 }}
						onClick={onClose}></button>
				</div>

				<div className='row g-4 pt-2'>
					<div className='col-12 col-md-5 d-flex flex-column justify-content-between order-2 order-md-1'>
						<div>
							<span className='badge bg-primary mb-2'>{car.typ_nadwozia}</span>
							<h3 className='fw-bold text-dark mb-1'>
								{car.marka} {car.model}
							</h3>
							<p className='text-muted small mb-4'>Rok produkcji: {car.rok_produkcji || 'N/A'}</p>

							<h6 className='fw-bold text-secondary text-uppercase small mb-3'>Specyfikacja pojazdu</h6>
							<div className='d-flex flex-column gap-2 mb-4'>
								<div className='d-flex justify-content-between border-bottom pb-1.5 fs-7'>
									<span className='text-muted'>
										<i className='bi bi-gear-wide-connected me-2'></i>Skrzynia biegów
									</span>
									<span className='fw-semibold text-dark'>{car.skrzynia_biegow}</span>
								</div>
								<div className='d-flex justify-content-between border-bottom pb-1.5 fs-7'>
									<span className='text-muted'>
										<i className='bi bi-fuel-pump me-2'></i>Rodzaj paliwa
									</span>
									<span className='fw-semibold text-dark'>{car.rodzaj_paliwa}</span>
								</div>
								<div className='d-flex justify-content-between border-bottom pb-1.5 fs-7'>
									<span className='text-muted'>
										<i className='bi bi-people me-2'></i>Liczba miejsc
									</span>
									<span className='fw-semibold text-dark'>{car.liczba_miejsc} miejsc</span>
								</div>
							</div>

							<div className='pt-2'>
								<span className='text-muted small d-block'>Cena za dobę</span>
								<div className='d-flex align-items-baseline'>
									<span className='fw-bold text-primary' style={{ fontSize: '1.6rem' }}>
										{car.cena_za_dobe} PLN
									</span>
									<span className='ms-1 text-muted small'>/ doba</span>
								</div>
							</div>
						</div>
					</div>

					<div className='col-12 col-md-7 d-flex flex-column justify-content-between order-1 order-md-2'>
						<div
							className='position-relative overflow-hidden rounded-4 shadow-sm mb-md-3 mb-0'
							style={{ maxHeight: '350px' }}>
							<img
								src={car.zdjecie}
								alt={`${car.marka} ${car.model}`}
								className='w-100 h-100 object-fit-cover img-fluid'
								style={{ minHeight: '200px', maxHeight: '350px' }}
							/>
						</div>
						<div className='d-none d-md-block mt-auto text-end'>
							<button
								className={`btn py-2 px-5 rounded-3 fw-medium w-100 ${user ? 'btn-dark' : 'btn-outline-primary'}`}
								onClick={(e) => {
									e.stopPropagation()
									onSelectCar(car)
								}}
								disabled={!user}>
								{user ? 'Przejdź do rezerwacji' : 'Zaloguj się, aby wypożyczyć'}
							</button>
						</div>
					</div>
				</div>

				<div className='d-block d-md-none mt-3'>
					<button
						className={`btn py-2.5 rounded-3 fw-medium w-100 ${user ? 'btn-dark' : 'btn-outline-primary'}`}
						onClick={(e) => {
							e.stopPropagation()
							onSelectCar(car)
						}}
						disabled={!user}>
						{user ? 'Przejdź do rezerwacji' : 'Zaloguj się, aby wypożyczyć'}
					</button>
				</div>
			</div>
		</div>
	)
}
