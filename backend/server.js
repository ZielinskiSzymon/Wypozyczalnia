import 'dotenv/config'
import express from 'express'
import { supabase, supabaseAdmin } from './utils/supabase.js'
import cors from 'cors'

const app = express()
app.use(cors())
app.use(express.json())

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
async function requireUser(req, res) {
	const authHeader = req.headers.authorization
	if (!authHeader?.startsWith('Bearer ')) {
		res.status(401).json({ error: 'Brak tokenu autoryzacji' })
		return null
	}
	const { data: { user }, error } = await supabase.auth.getUser(authHeader.split(' ')[1])
	if (error || !user) { res.status(401).json({ error: 'Nieautoryzowany lub wygasły token' }); return null }
	return user
}

async function requireAdmin(req, res) {
	const user = await requireUser(req, res)
	if (!user) return null
	if (user.user_metadata?.role !== 'admin') {
		res.status(403).json({ error: 'Brak uprawnień administratora' })
		return null
	}
	return user
}

// ═════════════════════════════════════════════
// USER ENDPOINTS
// ═════════════════════════════════════════════

// Pobieranie własnych wypożyczeń
app.post('/rentals', async (req, res) => {
	try {
		const user = await requireUser(req, res)
		if (!user) return
		const { data, error } = await supabaseAdmin
			.from('wypozyczenia')
			.select('id, data_wypozyczenia, data_zwrotu, cena_calkowita, auta (id, marka, model, cena_za_dobe, zdjecie)')
			.eq('uzytkownik_id', user.id)
			.order('data_wypozyczenia', { ascending: false })
		if (error) return res.status(500).json({ error: error.message })
		res.status(200).json({ data })
	} catch (e) { res.status(500).json({ error: 'Wewnętrzny błąd serwera' }) }
})

// Usunięcie WŁASNEGO wypożyczenia
app.delete('/rentals/:id', async (req, res) => {
	try {
		const user = await requireUser(req, res)
		if (!user) return
		const { error } = await supabaseAdmin
			.from('wypozyczenia').delete()
			.eq('id', req.params.id)
			.eq('uzytkownik_id', user.id) // tylko własne!
		if (error) return res.status(500).json({ error: error.message })
		res.status(200).json({ success: true })
	} catch (e) { res.status(500).json({ error: 'Wewnętrzny błąd serwera' }) }
})

// Tworzenie wypożyczenia
app.post('/rent', async (req, res) => {
	try {
		const user = await requireUser(req, res)
		if (!user) return
		const { auto_id, data_wypozyczenia, data_zwrotu } = req.body
		if (!auto_id || !data_wypozyczenia || !data_zwrotu)
			return res.status(400).json({ error: 'Brakuje wymaganych pól' })

		const { data: car, error: carError } = await supabaseAdmin
			.from('auta').select('cena_za_dobe').eq('id', auto_id).single()
		if (carError || !car)
			return res.status(404).json({ error: `Nie znaleziono samochodu o ID: ${auto_id}` })
const days = Math.ceil((new Date(data_zwrotu) - new Date(data_wypozyczenia)) / 86400000) + 1
const cena_calkowita = days * car.cena_za_dobe

		const { data, error } = await supabaseAdmin
			.from('wypozyczenia')
			.insert([{ uzytkownik_id: user.id, auto_id, data_wypozyczenia, data_zwrotu, cena_calkowita }])
			.select()
		if (error) return res.status(500).json({ error: error.message })
		res.status(200).json({ data })
	} catch (e) { res.status(500).json({ error: 'Wewnętrzny błąd serwera' }) }
})

// ═════════════════════════════════════════════
// ADMIN ENDPOINTS
// ═════════════════════════════════════════════

// Dashboard – statystyki
app.get('/admin/stats', async (req, res) => {
	try {
		const admin = await requireAdmin(req, res)
		if (!admin) return

		const [{ data: allRentals }, { count: totalCars }, { data: usersData }] = await Promise.all([
			supabaseAdmin.from('wypozyczenia').select('id, cena_calkowita, data_wypozyczenia, data_zwrotu'),
			supabaseAdmin.from('auta').select('*', { count: 'exact', head: true }),
			supabaseAdmin.auth.admin.listUsers(),
		])

		const today = new Date()
		const activeRentals = allRentals.filter(r =>
			new Date(r.data_wypozyczenia) <= today && new Date(r.data_zwrotu) >= today
		).length
		const totalRevenue = allRentals.reduce((s, r) => s + (r.cena_calkowita || 0), 0)

		res.json({ data: {
			totalRentals: allRentals.length,
			activeRentals,
			totalCars: totalCars || 0,
			totalUsers: usersData.users.length,
			totalRevenue,
		}})
	} catch (e) { res.status(500).json({ error: 'Wewnętrzny błąd serwera' }) }
})

// Wszystkie wypożyczenia
app.get('/admin/rentals', async (req, res) => {
	try {
		const admin = await requireAdmin(req, res)
		if (!admin) return
		const { data, error } = await supabaseAdmin
			.from('wypozyczenia')
			.select('id, data_wypozyczenia, data_zwrotu, cena_calkowita, uzytkownik_id, auta (id, marka, model, cena_za_dobe)')
			.order('data_wypozyczenia', { ascending: false })
		if (error) return res.status(500).json({ error: error.message })

		const { data: usersData } = await supabaseAdmin.auth.admin.listUsers()
const emailMap = Object.fromEntries(usersData.users.map(u => [u.id, u.email]))
res.json({ data: data.map(r => ({ ...r, uzytkownik_email: emailMap[r.uzytkownik_id] || 'Nieznany' })) })

		res.json({ data: data.map(r => ({ ...r, uzytkownik_email: emailMap[r.uzytkownik_id] || 'Nieznany' })) })
	} catch (e) { res.status(500).json({ error: 'Wewnętrzny błąd serwera' }) }
})

// Usunięcie dowolnego wypożyczenia (admin)
app.delete('/admin/rentals/:id', async (req, res) => {
	try {
		const admin = await requireAdmin(req, res)
		if (!admin) return
		const { error } = await supabaseAdmin.from('wypozyczenia').delete().eq('id', req.params.id)
		if (error) return res.status(500).json({ error: error.message })
		res.json({ success: true })
	} catch (e) { res.status(500).json({ error: 'Wewnętrzny błąd serwera' }) }
})

// Lista wszystkich użytkowników
app.get('/admin/users', async (req, res) => {
	try {
		const admin = await requireAdmin(req, res)
		if (!admin) return
		const { data: usersData, error } = await supabaseAdmin.auth.admin.listUsers()
		if (error) return res.status(500).json({ error: error.message })

		const { data: rentals } = await supabaseAdmin.from('wypozyczenia').select('uzytkownik_id')
		const counts = {}
		rentals?.forEach(r => { counts[r.uzytkownik_id] = (counts[r.uzytkownik_id] || 0) + 1 })

		res.json({ data: usersData.users.map(u => ({
			id: u.id, email: u.email,
			created_at: u.created_at, last_sign_in_at: u.last_sign_in_at,
			role: u.user_metadata?.role || 'user',
			rentals_count: counts[u.id] || 0,
		}))})
	} catch (e) { res.status(500).json({ error: 'Wewnętrzny błąd serwera' }) }
})

// ─── Samochody ────────────────────────────────────────────────

// Lista wszystkich aut
app.get('/admin/cars', async (req, res) => {
	try {
		const admin = await requireAdmin(req, res)
		if (!admin) return
		const { data, error } = await supabaseAdmin
			.from('auta')
			.select('*')
			.order('id', { ascending: false })
		if (error) return res.status(500).json({ error: error.message })
		res.json({ data })
	} catch (e) { res.status(500).json({ error: 'Wewnętrzny błąd serwera' }) }
})

// Dodanie nowego samochodu (zdjęcie już w Supabase Storage – przychodzi jako URL)
app.post('/admin/cars', async (req, res) => {
	try {
		const admin = await requireAdmin(req, res)
		if (!admin) return

		const { marka, model, rok_produkcji, cena_za_dobe, skrzynia_biegow, rodzaj_paliwa, liczba_miejsc, kategoria, zdjecie } = req.body

		if (!marka || !model || !cena_za_dobe) {
			return res.status(400).json({ error: 'Wymagane pola: marka, model, cena_za_dobe' })
		}

		const { data, error } = await supabaseAdmin
			.from('auta')
			.insert([{ marka, model, rok_produkcji, cena_za_dobe: Number(cena_za_dobe), skrzynia_biegow, rodzaj_paliwa, liczba_miejsc: Number(liczba_miejsc) || null, kategoria, zdjecie }])
			.select()
		if (error) return res.status(500).json({ error: error.message })
		res.status(201).json({ data })
	} catch (e) { res.status(500).json({ error: 'Wewnętrzny błąd serwera' }) }
})

// Usunięcie samochodu
app.delete('/admin/cars/:id', async (req, res) => {
	try {
		const admin = await requireAdmin(req, res)
		if (!admin) return

		// Sprawdź czy auto ma aktywne wypożyczenia
		const { data: activeRentals } = await supabaseAdmin
			.from('wypozyczenia')
			.select('id')
			.eq('auto_id', req.params.id)
			.gte('data_zwrotu', new Date().toISOString().split('T')[0])

		if (activeRentals?.length > 0) {
			return res.status(409).json({ error: `Nie można usunąć – samochód ma ${activeRentals.length} aktywnych wypożyczeń.` })
		}

		const { error } = await supabaseAdmin.from('auta').delete().eq('id', req.params.id)
		if (error) return res.status(500).json({ error: error.message })
		res.json({ success: true })
	} catch (e) { res.status(500).json({ error: 'Wewnętrzny błąd serwera' }) }
})

app.listen(3000, () => console.log('Serwer nasłuchuje na porcie 3000'))