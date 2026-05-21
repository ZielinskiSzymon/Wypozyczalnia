import { useState } from 'react'
import Filters from './Filters'

export default function Header({ onFilterChange, fuels, gearboxes, chassis, filters, onSearch }) {
	const [searchQuery, setSearchQuery] = useState('')

	const handleSearch = (e) => {
		const value = e.target.value
		setSearchQuery(value)
		onFilterChange({ ...filters, search: value })
	}

	return (
		<div className='header d-flex flex-column pb-2 border-bottom gap-3'>
			<div className='d-flex flex-column flex-sm-row justify-content-between align-items-sm-center mb-2 gap-3'>
				<div>
					<h1 className='fw-bold text-dark mb-0'>Wypożyczalnia aut</h1>
					<p className='text-muted mb-0'>Przeglądaj naszą flotę dostępną od ręki</p>
				</div>
				<input
					type='text'
					className='form-control rounded-pill px-4 py-2 shadow-sm'
					style={{ maxWidth: '300px' }}
					placeholder='Szukaj samochodu...'
					value={searchQuery}
					onChange={handleSearch}
				/>
			</div>
			<Filters
				onFilterChange={onFilterChange}
				fuels={fuels}
				gearboxes={gearboxes}
				chassis={chassis}
				filters={filters}
			/>
		</div>
	)
}
