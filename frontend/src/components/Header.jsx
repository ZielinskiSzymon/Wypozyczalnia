import { useState } from 'react'
import Filters from './Filters'

export default function Header({ onFilterChange, fuels, gearboxes, chassis, filters }) {
	const [searchQuery, setSearchQuery] = useState('')

	const handleSearch = (e) => {
		const value = e.target.value
		setSearchQuery(value)
		onFilterChange({ ...filters, search: value })
	}

	return (
<div className='header d-flex flex-column pb-2 border-bottom gap-3'>
    <div className='d-flex flex-column align-items-center flex-sm-row justify-content-between align-items-sm-center mb-2 gap-3 w-100'>
        <div>
            <h1 className='fw-bold text-dark mb-0 text-center text-sm-start'>Wypożyczalnia aut</h1>
            <p className='text-muted mb-0 text-center text-sm-start'>Przeglądaj naszą flotę dostępną od ręki</p>
        </div>
        <input
            type='text'
            className='form-control rounded-pill px-4 py-2 shadow-sm w-100 w-sm-auto mx-auto mx-sm-0'
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
