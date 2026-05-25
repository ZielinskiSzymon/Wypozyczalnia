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
				<button
					className='btn-close position-absolute'
					style={{ top: '1.25rem', right: '1.25rem', zIndex: 1060 }}
					aria-label='Close'
					onClick={onClose}></button>

				<div className='d-flex justify-content-between align-items-center pe-4 p-2'>
					<h2 className='fw-bold fs-3 mb-0'>
						{car.marka} {car.model}
					</h2>
				</div>
				<hr className='my-2 mb-4' />

				<div className='row g-4'>
					<div className='col-12 col-md-5 order-2 order-md-1'>
						<h3 className='fw-bold text-dark mb-3 fs-5 d-none d-md-block'>Specyfikacja pojazdu</h3>
						<div className='p-1 p-sm-2 rounded-3'>
							<div className='d-flex justify-content-between align-items-center mb-2 border-bottom pb-2'>
								<span className='text-muted small'>
									<i className='bi bi-calendar-event me-2'></i>Rok produkcji:
								</span>
								<span className='fw-semibold small me-2'>{car.rok_produkcji}</span>
							</div>
							<div className='d-flex justify-content-between align-items-center mb-2 border-bottom pb-2'>
								<span className='text-muted small'>
									<i className='bi bi-tags me-2'></i>Kategoria:
								</span>
								<span className='fw-semibold small me-2'>{car.kategoria}</span>
							</div>
							<div className='d-flex justify-content-between align-items-center mb-2 border-bottom pb-2'>
								<span className='text-muted small'>
									<i className='bi bi-fuel-pump me-2'></i>Rodzaj paliwa:
								</span>
								<span className='fw-semibold small me-2 text-capitalize'>{car.rodzaj_paliwa}</span>
							</div>
							<div className='d-flex justify-content-between align-items-center mb-2 border-bottom pb-2'>
								<span className='text-muted small'>
									<i className='bi bi-gear me-2'></i>Skrzynia biegów:
								</span>
								<span className='fw-semibold small me-2 text-capitalize'>{car.skrzynia_biegow}</span>
							</div>
							<div className='d-flex justify-content-between align-items-center mb-2 border-bottom pb-2'>
								<span className='text-muted small'>
									<i className='bi bi-people me-2'></i>Liczba miejsc:
								</span>
								<span className='fw-semibold small me-2'>{car.liczba_miejsc}</span>
							</div>
							<div className='d-flex justify-content-between align-items-center pt-2'>
								<span className='text-muted small'>
									<i className='bi bi-cash-coin me-2'></i>Cena za dobę:
								</span>
								<div className='d-flex align-items-baseline'>
									<span className='fw-bold' style={{ color: 'royalblue', fontSize: '1.6rem' }}>
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
								{user ? 'Wypożycz teraz' : 'Zaloguj się, aby wypożyczyć'}
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
						{user ? 'Wypożycz teraz' : 'Zaloguj się, aby wypożyczyć'}
					</button>
				</div>
			</div>
		</div>
	)
}
