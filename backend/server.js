import 'dotenv/config' // Ładuje .env przed jakimikolwiek innymi importami
import express from 'express'
import { supabase, supabaseAdmin } from './utils/supabase.js'
import cors from 'cors'

const app = express()
app.use(cors())
app.use(express.json())

app.post('/rent', async (req, res) => {
	try {
		console.log('Dane z frontendu:', req.body)

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
		const { auto_id, data_zwrotu } = req.body

		if (!auto_id || !data_zwrotu) {
			return res.status(400).json({ error: 'Brakuje wymaganych pól (auto_id lub data_zwrotu)' })
		}

		const { data: rentalData, error: rentalError } = await supabaseAdmin
			.from('wypozyczenia')
			.insert([
				{
					uzytkownik_id,
					auto_id,
					data_zwrotu,
					status: 'Niedostępne',
				},
			])
			.select()

		if (rentalError) {
			console.error('Błąd bazy danych przy wypożyczeniu:', rentalError)
			return res.status(500).json({ error: 'Nie udało się zapisać wypożyczenia. Sprawdź polityki RLS!' })
		}

		const { error: updateError } = await supabaseAdmin
			.from('auta')
			.update({ status_dostepnosci: false })
			.eq('id', auto_id)
		if (updateError) {
			console.error('Błąd aktualizacji dostępności auta:', updateError)
			return res.status(500).json({ error: 'Nie udało się zaktualizować dostępności samochodu' })
		}

		res.status(200).json({
			data: rentalData,
		})
	} catch (error) {
		console.error('Wewnętrzny błąd serwera:', error)
		res.status(500).json({ error: 'Wewnętrzny błąd serwera' })
	}
})

app.listen(3000, () => console.log('Serwer działa na porcie 3000!'))
