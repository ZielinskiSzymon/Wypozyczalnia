import CarCard from './CarCard'

export default function CarsList({ cars, user, onRent, onSelectCar }) {
	return (
		<div className='row row-cols-sm-1 row-cols-md-2 row-cols-lg-3 '>
			{cars.map((car) => (
				<CarCard key={car.id} car={car} user={user} onRent={onRent} onSelectCar={onSelectCar}/>
			))}
		</div>
	)
}
