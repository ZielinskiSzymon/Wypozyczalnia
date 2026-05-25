export async function rentCar(carId, dataOd, dataDo, token, onSuccess) {
	try {
		const response = await fetch('http://localhost:3000/rent', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({
				auto_id: carId,
				data_wypozyczenia: dataOd,
				data_zwrotu: dataDo,
			}),
		})

		const result = await response.json()

		if (response.ok) {
			onSuccess()
			window.location.reload()
		} else {
			alert(result.error || 'Wystąpił błąd podczas wypożyczania')
		}
	} catch (error) {
		console.error('Błąd:', error)
		alert('Błąd połączenia z serwerem backendu.')
	}
}


export async function getUserRentals(token) {
	try {
		const response = await fetch('http://localhost:3000/rentals', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
		})
		if (!response.ok) {
			const errorData = await response.json()
			throw new Error(errorData.error || 'Nie można pobrać wypożyczeń')
		}
		const result = await response.json()
		return result.data
	} catch (error) {
		console.error('Błąd:', error)
		alert('Błąd połączenia z serwerem backendu.')
	}
}
