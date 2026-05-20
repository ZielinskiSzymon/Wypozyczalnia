import { useEffect } from 'react'

export function CarInfoCard({ car, user, onRent, onClose }) {
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
			className='position-fixed top-0 start-0 vh-100 vw-100 d-flex justify-content-center align-items-center'
			style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 1050 }}
			onClick={onClose}>
			<div
				className='bg-white p-5 rounded-4 position-relative'
				style={{ minWidth: '400px', maxWidth: '800px' }}
				onClick={(e) => e.stopPropagation()}>
				<button
					className='btn-close position-absolute'
					style={{ top: '1.5rem', right: '1.5rem' }}
					aria-label='Close'
					onClick={onClose}></button>

				<div className='d-flex justify-content-between align-items-center p-3'>
					<h2 className='fw-bold'>
						{car.marka} {car.model}
					</h2>
					<span
						className={`badge px-2.5 py-1.5 rounded-pill ${car.status_dostepnosci ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`}>
						{car.status_dostepnosci ? 'Dostępne' : 'Niedostępne'}
					</span>
				</div>
				<hr />

				<div className='row g-4 align-items-center'>
					<div className='col-12 col-md-7 text-center order-md-2 mt-3'>
						<div className='position-relative overflow-hidden rounded-4 shadow-sm' style={{ maxHeight: '350px' }}>
							<img
								src={car.zdjecie}
								alt={`${car.marka} ${car.model}`}
								className='w-100 h-100 object-fit-cover img-fluid'
								style={{ minHeight: '250px' }}
							/>
						</div>
					</div>
					<div className='col-12 col-md-5 order-md-1'>
						<h3 className='fw-bold text-dark mb-4'>Specyfikacja pojazdu</h3>

						<div className='p-3 bg-gray rounded-3 shadow-sm'>
							<div className='d-flex justify-content-between align-items-center mb-3 border-bottom pb-2'>
								<span className='text-muted'>
									<i className='bi bi-calendar-event me-2'></i>Rok produkcji:
								</span>
								<span className='fw-semibold'>{car.rok_produkcji}</span>
							</div>

							<div className='d-flex justify-content-between align-items-center mb-3 border-bottom pb-2'>
								<span className='text-muted'>
									<i className='bi bi-calendar-event me-2'></i>Kategoria:{' '}
								</span>
								<span className='fw-semibold'>{car.kategoria}</span>
							</div>

							<div className='d-flex justify-content-between align-items-center mb-3 border-bottom pb-2'>
								<span className='text-muted'>
									<i className='bi bi-fuel-pump me-2'></i>Rodzaj paliwa:
								</span>
								<span className='fw-semibold text-capitalize'>{car.rodzaj_paliwa}</span>
							</div>

							<div className='d-flex justify-content-between align-items-center mb-3 border-bottom pb-2'>
								<span className='text-muted'>
									<i className='bi bi-gear me-2'></i>Skrzynia biegów:
								</span>
								<span className='fw-semibold text-capitalize'>{car.skrzynia_biegow}</span>
							</div>

							<div className='d-flex justify-content-between align-items-center mb-3 border-bottom pb-2'>
								<span className='text-muted'>
									<i className='bi bi-people me-2'></i>Liczba miejsc:
								</span>
								<span className='fw-semibold'>{car.liczba_miejsc}</span>
							</div>

							<div className='d-flex justify-content-between align-items-center pt-2'>
								<span className='text-muted'>
									<i className='bi bi-cash-coin me-2'></i>Cena za dobę:
								</span>
								<span className='fw-bold fs-5'>{car.cena_za_dobe} PLN</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
