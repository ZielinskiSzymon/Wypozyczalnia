export async function rentCar(carId, token, onSuccess) {
	try {
		const returnDate = new Date()
		returnDate.setDate(returnDate.getDate() + 3)

		const response = await fetch('http://localhost:3000/rent', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({
				auto_id: carId,
				data_zwrotu: returnDate.toISOString(),
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
