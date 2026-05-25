import 'dotenv/config'
import express from 'express'
import { supabase, supabaseAdmin } from './utils/supabase.js'
import cors from 'cors'

const app = express()
app.use(cors())
app.use(express.json())

app.post('/rent', async (req, res) => {
	try {
		console.log('--- NOWE ŻĄDANIE REZERWACJI ---')
		console.log('Dane odebrane z frontendu:', req.body)

		const authHeader = req.headers.authorization
		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			return res.status(401).json({ error: 'Brak tokenu autoryzacji' })
		}
		const token = authHeader.split(' ')[1]

		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser(token)

		if (authError || !user) {
			return res.status(401).json({ error: 'Nieautoryzowany dostęp lub wygasły token' })
		}

		const uzytkownik_id = user.id
		const { auto_id, data_wypozyczenia, data_zwrotu } = req.body

		if (!auto_id || !data_wypozyczenia || !data_zwrotu) {
			return res.status(400).json({ error: 'Brakuje wymaganych pól (auto_id, data_wypozyczenia, data_zwrotu)' })
		}

		// Pobieramy cenę za dobę dla wybranego samochodu
		const { data: car, error: carError } = await supabaseAdmin
			.from('auta')
			.select('cena_za_dobe')
			.eq('id', auto_id)
			.single()

		if (carError || !car) {
			console.error(
				'Błąd szukania auta w bazie. Prawdopodobnie zły typ ID (np. oczekiwano UUID, przesłano numer):',
				carError,
			)
			return res.status(444).json({
				error: `Nie znaleziono samochodu o podanym ID (${auto_id}). Sprawdź czy ID w bazie to liczba czy UUID!`,
			})
		}

		// Obliczamy liczbę dni oraz cenę całkowitą
		const start = new Date(data_wypozyczenia)
		const end = new Date(data_zwrotu)
		const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1
		const total_price = days * car.cena_za_dobe

		console.log(`Obliczono: Dni: ${days}, Cena całkowita: ${total_price} PLN`)

		// Zapis do tabeli 'wypozyczenia' zgodnie z kolumnami w Supabase
		const { data: rentalData, error: rentalError } = await supabaseAdmin
			.from('wypozyczenia')
			.insert([
				{
					uzytkownik_id,
					auto_id,
					data_wypozyczenia: data_wypozyczenia,
					data_zwrotu: data_zwrotu,
					cena_calkowita: total_price,
				},
			])
			.select()

		if (rentalError) {
			console.error('Błąd zapisu rezerwacji w Supabase:', rentalError)
			return res.status(500).json({ error: rentalError.message })
		}

		console.log('Rezerwacja zapisana pomyślnie!', rentalData)
		res.status(200).json({ data: rentalData })
	} catch (error) {
		console.error('Krytyczny błąd serwera Express:', error)
		res.status(500).json({ error: 'Wewnętrzny błąd serwera' })
	}
})

app.listen(3000, () => console.log('Serwer Express nasłuchuje na porcie 3000!'))
