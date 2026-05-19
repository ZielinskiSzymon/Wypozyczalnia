import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabase'

export function useCars() {
	const [cars, setCars] = useState([])
	const [filteredCars, setFilteredCars] = useState([])

	useEffect(() => {
		async function getCars() {
			const { data } = await supabase.from('auta').select()
			if (data) {
				setCars(data)
				setFilteredCars(data)
			}
		}
		getCars()
	}, [])

	const filterCars = (query) => {
		if (!query.trim()) {
			setFilteredCars(cars)
			return
		}
		const filtered = cars.filter(
			(car) =>
				car.marka.toLowerCase().includes(query.toLowerCase()) || car.model.toLowerCase().includes(query.toLowerCase()),
		)
		setFilteredCars(filtered)
	}

	const updateCarAvailability = (carId) => {
		setCars(cars.map((car) => (car.id === carId ? { ...car, status_dostepnosci: false } : car)))
		setFilteredCars(filteredCars.map((car) => (car.id === carId ? { ...car, status_dostepnosci: false } : car)))
	}

	return { filteredCars, filterCars, updateCarAvailability }
}
