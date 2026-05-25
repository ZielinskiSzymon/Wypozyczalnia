import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabase'

export function useCars() {
	const [cars, setCars] = useState([])
	const [filteredCars, setFilteredCars] = useState([])
	const [filters, setFilters] = useState({
		search: '',
		fuel: '',
		gearbox: '',
		chassis: '',
		price: '',
	})

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

	// Funkcja do filtrowania aut na podstawie wybranych kryteriów
	const applyFilters = (newFilters) => {
		setFilters(newFilters)
		let result = cars

		// Filter po nazwie (marka/model)
		if (newFilters.search?.trim()) {
			result = result.filter(
				(car) =>
					car.marka.toLowerCase().includes(newFilters.search.toLowerCase()) ||
					car.model.toLowerCase().includes(newFilters.search.toLowerCase()),
			)
		}

		// Filter po rodzaju paliwa
		if (newFilters.fuel) {
			result = result.filter((car) => car.rodzaj_paliwa === newFilters.fuel)
		}

		// Filter po skrzyni biegów
		if (newFilters.gearbox) {
			result = result.filter((car) => car.skrzynia_biegow === newFilters.gearbox)
		}

		// Filter po kategorii (nadwoziu)
		if (newFilters.chassis) {
			result = result.filter((car) => car.kategoria === newFilters.chassis)
		}

		// Filter po cenie
		if (newFilters.price) {
			if (newFilters.price === 'range1') {
				result = result.filter((car) => car.cena_za_dobe < 200)
			} else if (newFilters.price === 'range2') {
				result = result.filter((car) => car.cena_za_dobe >= 200 && car.cena_za_dobe <= 500)
			} else if (newFilters.price === 'range3') {
				result = result.filter((car) => car.cena_za_dobe > 500)
			}
		}

		setFilteredCars(result)
	}

	// Funkcje pomocnicze do filtrowania
	const getUniqueFuels = () => {
		const fuels = new Set(cars.map((car) => car.rodzaj_paliwa).filter(Boolean))
		return Array.from(fuels).sort()
	}

	const getUniqueGearboxes = () => {
		const gearboxes = new Set(cars.map((car) => car.skrzynia_biegow).filter(Boolean))
		return Array.from(gearboxes).sort()
	}

	const getUniqueChassises = () => {
		const chassis = new Set(cars.map((car) => car.kategoria).filter(Boolean))
		return Array.from(chassis).sort()
	}

	return {
		filteredCars,
		applyFilters,
		getUniqueFuels,
		getUniqueGearboxes,
		getUniqueChassises,
		filters,
	}
}
