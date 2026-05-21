import CarCard from './CarCard'

export default function CarsList({ cars, user, onRent, onSelectCar }) {
	return (
		<div className='row row-cols-1 row-cols-sm-1 row-cols-md-2 row-cols-lg-2 row-cols-xl-3 g-4 '>
			{cars.map((car) => (
				<CarCard key={car.id} car={car} user={user} onRent={onRent} onSelectCar={onSelectCar} />
			))}
		</div>
	)
}
