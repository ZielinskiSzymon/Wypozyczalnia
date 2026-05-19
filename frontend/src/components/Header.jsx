import { useState } from 'react'

export default function Header({ onSearch }) {
	const [searchQuery, setSearchQuery] = useState('')

	const handleSearch = (e) => {
		setSearchQuery(e.target.value)
		onSearch(e.target.value)
	}

	return (
		<div className='header d-flex flex-column flex-sm-row justify-content-between align-items-sm-center mb-4 pb-2 border-bottom gap-3'>
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
	)
}
