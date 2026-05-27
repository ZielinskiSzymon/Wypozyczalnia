import 'dotenv/config'
import express from 'express'
import { supabase, supabaseAdmin } from './utils/supabase.js'
import cors from 'cors'

const app = express()
app.use(cors())
app.use(express.json())

async function requireAdmin(req, res) {
	const authHeader = req.headers.authorization
	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		res.status(401).json({ error: 'Brak tokenu autoryzacji' })
		return null
	}

	const token = authHeader.split(' ')[1]
	const {
		data: { user },
		error: authError,
	} = await supabase.auth.getUser(token)

	if (authError || !user) {
		res.status(401).json({ error: 'Nieautoryzowany dostęp lub wygasły token' })
		return null
	}

	const isAdmin = user.user_metadata?.role === 'admin'

	if (!isAdmin) {
		res.status(403).json({ error: 'Brak uprawnień administratora' })
		return null
	}

	return user
}

async function requireUser(req, res) {
	const authHeader = req.headers.authorization
	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		res.status(401).json({ error: 'Brak tokenu autoryzacji' })
		return null
	}

	const token = authHeader.split(' ')[1]
	const {
		data: { user },
		error: authError,
	} = await supabase.auth.getUser(token)

	if (authError || !user) {
		res.status(401).json({ error: 'Nieautoryzowany dostęp lub wygasły token' })
		return null
	}

	return user
}

app.post('/rentals', async (req, res) => {
	try {
		const user = await requireUser(req, res)
		if (!user) return

		const { data: rentalsData, error: rentalsError } = await supabaseAdmin
			.from('wypozyczenia')
			.select(`id, data_wypozyczenia, data_zwrotu, cena_calkowita, auta (id, marka, model, cena_za_dobe, zdjecie)`)
			.eq('uzytkownik_id', user.id)
			.order('data_wypozyczenia', { ascending: false })

		if (rentalsError) return res.status(500).json({ error: rentalsError.message })

		res.status(200).json({ data: rentalsData })
	} catch (error) {
		res.status(500).json({ error: 'Wewnętrzny błąd serwera' })
	}
})

app.delete('/rentals/:id', async (req, res) => {
	try {
		const user = await requireUser(req, res)
		if (!user) return

		const { error: deleteError } = await supabaseAdmin
			.from('wypozyczenia')
			.delete()
			.eq('id', req.params.id)
			.eq('uzytkownik_id', user.id)

		if (deleteError) return res.status(500).json({ error: deleteError.message })

		res.status(200).json({ success: true, message: 'Wypożyczenie zostało anulowane.' })
	} catch (error) {
		res.status(500).json({ error: 'Wewnętrzny błąd serwera' })
	}
})

app.post('/rent', async (req, res) => {
	try {
		const user = await requireUser(req, res)
		if (!user) return

		const { auto_id, data_wypozyczenia, data_zwrotu } = req.body

		if (!auto_id || !data_wypozyczenia || !data_zwrotu) {
			return res.status(400).json({ error: 'Brakuje wymaganych pól (auto_id, data_wypozyczenia, data_zwrotu)' })
		}

		const { data: car, error: carError } = await supabaseAdmin
			.from('auta')
			.select('cena_za_dobe')
			.eq('id', auto_id)
			.single()

		if (carError || !car) {
			return res.status(444).json({ error: `Nie znaleziono samochodu o podanym ID (${auto_id}).` })
		}

		const start = new Date(data_wypozyczenia)
		const end = new Date(data_zwrotu)
		const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1
		const total_price = days * car.cena_za_dobe

		const { data: rentalData, error: rentalError } = await supabaseAdmin
			.from('wypozyczenia')
			.insert([
				{
					uzytkownik_id: user.id,
					auto_id,
					data_wypozyczenia,
					data_zwrotu,
					cena_calkowita: total_price,
				},
			])
			.select()

		if (rentalError) return res.status(500).json({ error: rentalError.message })

		res.status(200).json({ data: rentalData })
	} catch (error) {
		res.status(500).json({ error: 'Wewnętrzny błąd serwera' })
	}
})

app.get('/admin/stats', async (req, res) => {
	try {
		const admin = await requireAdmin(req, res)
		if (!admin) return

		const { data: allRentals, error: rentalsError } = await supabaseAdmin
			.from('wypozyczenia')
			.select('id, cena_calkowita, data_wypozyczenia, data_zwrotu')

		if (rentalsError) return res.status(500).json({ error: rentalsError.message })

		const { count: carsCount, error: carsError } = await supabaseAdmin
			.from('auta')
			.select('*', { count: 'exact', head: true })

		if (carsError) return res.status(500).json({ error: carsError.message })

		const { data: usersData, error: usersError } = await supabaseAdmin.auth.admin.listUsers()
		if (usersError) return res.status(500).json({ error: usersError.message })

		const today = new Date()
		const activeRentals = allRentals.filter(
			(r) => new Date(r.data_wypozyczenia) <= today && new Date(r.data_zwrotu) >= today,
		)
		const totalRevenue = allRentals.reduce((sum, r) => sum + (r.cena_calkowita || 0), 0)

		res.status(200).json({
			data: {
				totalRentals: allRentals.length,
				activeRentals: activeRentals.length,
				totalCars: carsCount || 0,
				totalUsers: usersData.users.length,
				totalRevenue,
			},
		})
	} catch (error) {
		res.status(500).json({ error: 'Wewnętrzny błąd serwera' })
	}
})

app.get('/admin/rentals', async (req, res) => {
	try {
		const admin = await requireAdmin(req, res)
		if (!admin) return

		const { data, error } = await supabaseAdmin
			.from('wypozyczenia')
			.select(
				`id, data_wypozyczenia, data_zwrotu, cena_calkowita, uzytkownik_id,
         auta (id, marka, model, cena_za_dobe)`,
			)
			.order('data_wypozyczenia', { ascending: false })

		if (error) return res.status(500).json({ error: error.message })

		const { data: usersData } = await supabaseAdmin.auth.admin.listUsers()
		const usersMap = {}
		usersData.users.forEach((u) => {
			usersMap[u.id] = u.email
		})

		const enriched = data.map((r) => ({
			...r,
			uzytkownik_email: usersMap[r.uzytkownik_id] || 'Nieznany',
		}))

		res.status(200).json({ data: enriched })
	} catch (error) {
		res.status(500).json({ error: 'Wewnętrzny błąd serwera' })
	}
})

app.delete('/admin/rentals/:id', async (req, res) => {
	try {
		const admin = await requireAdmin(req, res)
		if (!admin) return

		const { error: deleteError } = await supabaseAdmin
			.from('wypozyczenia')
			.delete()
			.eq('id', req.params.id)

		if (deleteError) return res.status(500).json({ error: deleteError.message })

		res.status(200).json({ success: true, message: `Wypożyczenie ${req.params.id} zostało usunięte przez admina.` })
	} catch (error) {
		res.status(500).json({ error: 'Wewnętrzny błąd serwera' })
	}
})

app.get('/admin/users', async (req, res) => {
	try {
		const admin = await requireAdmin(req, res)
		if (!admin) return

		const { data: usersData, error } = await supabaseAdmin.auth.admin.listUsers()
		if (error) return res.status(500).json({ error: error.message })

		const { data: rentals } = await supabaseAdmin.from('wypozyczenia').select('uzytkownik_id')

		const rentalCounts = {}
		rentals?.forEach((r) => {
			rentalCounts[r.uzytkownik_id] = (rentalCounts[r.uzytkownik_id] || 0) + 1
		})

		const users = usersData.users.map((u) => ({
			id: u.id,
			email: u.email,
			created_at: u.created_at,
			last_sign_in_at: u.last_sign_in_at,
			role: u.user_metadata?.role || 'user',
			rentals_count: rentalCounts[u.id] || 0,
		}))

		res.status(200).json({ data: users })
	} catch (error) {
		res.status(500).json({ error: 'Wewnętrzny błąd serwera' })
	}
})

app.listen(3000, () => console.log('Serwer Express nasłuchuje na porcie 3000!'))