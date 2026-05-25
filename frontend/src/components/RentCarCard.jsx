import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabase'
import Calendar from 'react-calendar'

export default function RentCarCard({ car, user, onRent, onClose }) {
	const [dateRange, setDateRange] = useState([null, null])
	const [startDate, endDate] = dateRange
	const [disabledDates, setDisabledDates] = useState([])
	const [days, setDays] = useState(0)
	const [totalPrice, setTotalPrice] = useState(0)
	const [isSubmitting, setIsSubmitting] = useState(false)

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

	useEffect(() => {
		if (!car?.id) return
		async function fetchRentals() {
			const { data, error } = await supabase
				.from('wypozyczenia')
				.select('data_wypozyczenia, data_zwrotu')
				.eq('auto_id', car.id)

			if (!error && data) {
				const datesArray = []
				data.forEach((rental) => {
					if (!rental.data_wypozyczenia || !rental.data_zwrotu) return
					let current = new Date(rental.data_wypozyczenia.split('T')[0])
					const last = new Date(rental.data_zwrotu.split('T')[0])
					current.setHours(0, 0, 0, 0)
					last.setHours(0, 0, 0, 0)
					while (current <= last) {
						datesArray.push(current.toISOString().split('T')[0])
						current.setDate(current.getDate() + 1)
					}
				})
				setDisabledDates(datesArray)
			}
		}
		fetchRentals()
	}, [car])

	useEffect(() => {
		if (startDate && endDate) {
			const timeDiff = endDate.getTime() - startDate.getTime()
			const calculatedDays = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1
			setDays(calculatedDays)
			setTotalPrice(calculatedDays * car.cena_za_dobe)
		} else {
			setDays(0)
			setTotalPrice(0)
		}
	}, [startDate, endDate, car])

	const tileDisabled = ({ date, view }) => {
		if (view === 'month') {
			const formattedDate = date.toISOString().split('T')[0]
			return disabledDates.includes(formattedDate) || date < new Date().setHours(0, 0, 0, 0)
		}
		return false
	}

	const tileClassName = ({ date, view }) => {
		if (view === 'month' && disabledDates.includes(date.toISOString().split('T')[0])) return 'booked-tile'
		return null
	}

	const handleSubmit = async (e) => {
		e.preventDefault()
		if (!startDate || !endDate || isSubmitting) return
		setIsSubmitting(true)
		const formattedStart = startDate.toISOString().split('T')[0]
		const formattedEnd = endDate.toISOString().split('T')[0]
		await onRent(car.id, formattedStart, formattedEnd)
		setIsSubmitting(false)
		onClose()
	}

	if (!car) return null

	return (
		<div
			className='position-fixed top-0 start-0 vh-100 vw-100 d-flex justify-content-center align-items-center p-2 p-sm-3'
			style={{ backgroundColor: 'rgba(30, 64, 175, 0.2)', zIndex: 2000, backdropFilter: 'blur(10px)' }}>
			<div
				className='bg-white rounded-4 shadow-lg w-100 d-flex flex-column text-dark border-0 animate-fade-in'
				style={{ maxWidth: '850px', maxHeight: '95vh', overflowY: 'auto' }}>
				<div className='d-flex justify-content-between align-items-center p-4 border-bottom'>
					<div>
						<h5 className='m-0 fw-bold' style={{ color: 'var(--primary-dark)' }}>
							{car.marka} {car.model}
						</h5>
						<p className='text-muted small m-0'>Wybierz dogodny termin rezerwacji</p>
					</div>
					<button type='button' className='btn-close' onClick={onClose}></button>
				</div>

				<form onSubmit={handleSubmit} className='p-4 d-flex flex-column gap-4'>
					<div className='row g-3'>
						<div className='col-12 col-md-4'>
							<div className='p-3 border rounded-3 bg-light'>
								<label className='text-muted small fw-bold d-block mb-1'>LOKALIZACJA</label>
								<span className='fw-bold small'>
									<i className='bi bi-geo-alt-fill me-1 text-primary'></i> Kraków, PL
								</span>
							</div>
						</div>
						<div className='col-6 col-md-4'>
							<div className='p-3 border rounded-3' style={{ backgroundColor: startDate ? '#f0f9ff' : '#fff' }}>
								<label className='text-muted small fw-bold d-block mb-1'>ODBIÓR</label>
								<span className={`fw-bold small ${startDate ? 'text-primary' : ''}`}>
									{startDate ? startDate.toLocaleDateString('pl-PL') : 'Wybierz datę'}
								</span>
							</div>
						</div>
						<div className='col-6 col-md-4'>
							<div className='p-3 border rounded-3' style={{ backgroundColor: endDate ? '#f0f9ff' : '#fff' }}>
								<label className='text-muted small fw-bold d-block mb-1'>ZWROT</label>
								<span className={`fw-bold small ${endDate ? 'text-primary' : ''}`}>
									{endDate ? endDate.toLocaleDateString('pl-PL') : 'Wybierz datę'}
								</span>
							</div>
						</div>
					</div>

					<div className='p-2 border rounded-4 shadow-sm custom-calendar-container'>
						<Calendar
							onChange={setDateRange}
							value={dateRange}
							selectRange={true}
							showDoubleView={window.innerWidth > 768}
							minDate={new Date()}
							tileDisabled={tileDisabled}
							tileClassName={tileClassName}
							locale='pl-PL'
						/>
					</div>

					<div className='row g-3 align-items-center'>
						<div className='col-12 col-md-6'>
							<div className='d-flex flex-column gap-2'>
								<div className='d-flex align-items-center gap-2 text-muted small'>
									<i className='bi bi-check-circle-fill text-success'></i>
									<span>Brak ukrytych opłat</span>
								</div>
								<div className='d-flex align-items-center gap-2 text-muted small'>
									<i className='bi bi-check-circle-fill text-success'></i>
									<span>Ubezpieczenie AC/OC w cenie</span>
								</div>
							</div>
						</div>

						<div className='col-12 col-md-6'>
							{days > 0 ? (
								<div className='p-3 rounded-4 bg-light border border-primary-subtle'>
									<div className='d-flex justify-content-between align-items-center'>
										<div>
											<span className='text-muted small d-block'>Razem za {days} dni</span>
											<span className='fs-3 fw-bold text-dark'>{totalPrice} PLN</span>
										</div>
										<div className='text-end'>
											<span className='badge bg-primary rounded-pill'>{car.cena_za_dobe} PLN / doba</span>
										</div>
									</div>
								</div>
							) : (
								<div className='p-3 text-center rounded-4 border border-dashed text-muted small'>
									Zaznacz zakres dat na kalendarzu, aby obliczyć cenę
								</div>
							)}
						</div>
					</div>

					<button
						type='submit'
						className='btn btn-primary w-100 py-3 fw-bold shadow-md rounded-3'
						disabled={!startDate || !endDate || isSubmitting}>
						{isSubmitting ? 'PRZETWARZANIE...' : 'POTWIERDŹ REZERWACJĘ'}
					</button>
				</form>
			</div>
		</div>
	)
}
