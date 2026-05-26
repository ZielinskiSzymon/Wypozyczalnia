import { useState } from 'react'
import { supabase } from './utils/supabase'
import { useAuth } from './hooks/useAuth'
import { useCars } from './hooks/useCars'
import { rentCar } from './services/rentService'
import AuthZone from './components/AuthZone'
import Header from './components/Header'
import CarsList from './components/CarsList'
import { CarInfoCard } from './components/CarInfoCard'
import RentCarCard from './components/RentCarCard.jsx'

import './App.css'

export default function App() {
	const { user, logout } = useAuth()
	const { filteredCars, applyFilters, getUniqueFuels, getUniqueGearboxes, getUniqueChassises, filters } = useCars()

	const [selectedCar, setSelectedCar] = useState(null)

	const handleRent = async (carId, dataOd, dataDo) => {
		const {
			data: { session },
			error: sessionError,
		} = await supabase.auth.getSession()

		if (sessionError || !session) {
			alert('Musisz być zalogowany, aby wypożyczyć samochód!')
			return
		}

		const token = session.access_token
		await rentCar(carId, dataOd, dataDo, token, () => {
			setSelectedCar(null)
		})
	}

	const handleLogout = async () => {
		await logout()
	}

	return (
		<>
			{selectedCar && !selectedCar.openRental && (
				<CarInfoCard
					car={selectedCar}
					user={user}
					onSelectCar={(car) => setSelectedCar({ ...car, openRental: true })}
					onClose={() => setSelectedCar(null)}
				/>
			)}

			{selectedCar && selectedCar.openRental && (
				<RentCarCard car={selectedCar} user={user} onRent={handleRent} onClose={() => setSelectedCar(null)} />
			)}

			<AuthZone user={user} onLogout={handleLogout} />

			<Header
				onFilterChange={applyFilters}
				fuels={getUniqueFuels()}
				gearboxes={getUniqueGearboxes()}
				chassis={getUniqueChassises()}
				filters={filters}
			/>
			<CarsList cars={filteredCars} user={user} onRent={handleRent} onSelectCar={setSelectedCar} />
		</>
	)
}
