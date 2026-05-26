export default function Filters({ onFilterChange, fuels, gearboxes, chassis, filters }) {
	const handleChange = (e) => {
		const { name, value } = e.target
		const newFilters = { ...filters, [name]: value }
		onFilterChange(newFilters)
	}

	return (
		<div className='p-2 p-md-4 bg-white border border-light-subtle rounded-4 shadow-sm mb-4 animate-fade-in'>
			<div className='row justify-content-start g-1 g-md-2'>
				<div className='col-12 col-md-6 col-lg-3'>
					<select
						className='form-select border-light-subtle text-sm px-3 py-1'
						name='chassis'
						value={filters.chassis || ''}
						onChange={handleChange}>
						<option value=''>Typ nadwozia</option>
						{chassis &&
							chassis.map((c) => (
								<option key={c} value={c}>
									{c}
								</option>
							))}
					</select>
				</div>

				<div className='col-12 col-md-6 col-lg-3'>
					<select
						className='form-select border-light-subtle text-sm px-3 py-1'
						name='price'
						value={filters.price || ''}
						onChange={handleChange}>
						<option value=''>Cena</option>
						<option value='range1'>Poniżej 200 PLN</option>
						<option value='range2'>200 - 500 PLN</option>
						<option value='range3'>Powyżej 500 PLN</option>
					</select>
				</div>

				<div className='col-12 col-md-6 col-lg-3'>
					<select
						className='form-select border-light-subtle text-sm px-3 py-1'
						name='fuel'
						value={filters.fuel || ''}
						onChange={handleChange}>
						<option value=''>Paliwo</option>
						{fuels &&
							fuels.map((f) => (
								<option key={f} value={f}>
									{f}
								</option>
							))}
					</select>
				</div>

				<div className='col-12 col-md-6 col-lg-3'>
					<select
						className='form-select border-light-subtle text-sm px-3 py-1'
						name='gearbox'
						value={filters.gearbox || ''}
						onChange={handleChange}>
						<option value=''>Skrzynia biegów</option>
						{gearboxes &&
							gearboxes.map((g) => (
								<option key={g} value={g}>
									{g}
								</option>
							))}
					</select>
				</div>
			</div>
		</div>
	)
}
