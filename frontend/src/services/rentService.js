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
			const contentType = response.headers.get("content-type");
			if (contentType && contentType.includes("application/json")) {
				const errorData = await response.json()
				throw new Error(errorData.error || 'Nie można pobrać wypożyczeń')
			} else {
				throw new Error(`Serwer zwrócił błąd ${response.status}. Sprawdź czy backend działa.`);
			}
		}
		const result = await response.json()
		return result.data
	} catch (error) {
		console.error('Błąd:', error)
		alert('Błąd połączenia z serwerem backendu: ' + error.message)
	}
}

export async function deleteRental(rentalId, token) {
	try {
		const response = await fetch(`http://localhost:3000/rentals/${rentalId}`, {
			method: 'DELETE',
			headers: {
				'Authorization': `Bearer ${token}`,
			},
		});

		if (!response.ok) {
			const contentType = response.headers.get("content-type");
			if (contentType && contentType.includes("application/json")) {
				const errorData = await response.json();
				throw new Error(errorData.error || 'Nie udało się usunąć wypożyczenia');
			} else {
				throw new Error(`Błąd ${response.status}. Prawdopodobnie nie dodałeś jeszcze obsługi 'DELETE /rentals/:id' na backendzie.`);
			}
		}
		
		return true;
	} catch (error) {
		console.error('Błąd usuwania:', error);
		throw error;
	}
}