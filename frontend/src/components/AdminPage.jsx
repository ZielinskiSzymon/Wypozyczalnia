import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '../utils/supabase';

// ─── Formattery ────────────────────────────────────────────────────────────────
const dateFmt = new Intl.DateTimeFormat('pl-PL', { day: '2-digit', month: 'short', year: 'numeric' });
const priceFmt = new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN', minimumFractionDigits: 0 });

const API = 'http://localhost:3000';

async function apiFetch(path, token, options = {}) {
	const res = await fetch(`${API}${path}`, {
		...options,
		headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...(options.headers || {}) },
	});
	const json = await res.json();
	if (!res.ok) throw new Error(json.error || `Błąd ${res.status}`);
	return json.data;
}

// ─── Karta statystyki ──────────────────────────────────────────────────────────
function StatCard({ icon, label, value, color }) {
	return (
		<div className="col-6 col-xl-3">
			<div className="card border-0 shadow-sm rounded-4 h-100">
				<div className="card-body d-flex align-items-center gap-3 p-4">
					<div className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
						style={{ width: 52, height: 52, background: color + '18' }}>
						<i className={`bi ${icon} fs-4`} style={{ color }} />
					</div>
					<div>
						<div className="text-muted small">{label}</div>
						<div className="fw-bold fs-4">{value ?? '—'}</div>
					</div>
				</div>
			</div>
		</div>
	);
}

// ─── Strefa wklejania zdjęcia ──────────────────────────────────────────────────
function ImageDropZone({ imageFile, imagePreview, onImageChange }) {
	const fileInputRef = useRef(null);
	const [isDragging, setIsDragging] = useState(false);

	const processFile = (file) => {
		if (!file || !file.type.startsWith('image/')) {
			alert('Wybierz plik graficzny (jpg, png, webp...)');
			return;
		}
		onImageChange(file);
	};

	// Wklejanie ze schowka (Ctrl+V)
	useEffect(() => {
		const handlePaste = (e) => {
			const item = [...(e.clipboardData?.items || [])].find(i => i.type.startsWith('image/'));
			if (item) processFile(item.getAsFile());
		};
		window.addEventListener('paste', handlePaste);
		return () => window.removeEventListener('paste', handlePaste);
	}, []);

	const handleDrop = (e) => {
		e.preventDefault();
		setIsDragging(false);
		processFile(e.dataTransfer.files[0]);
	};

	return (
		<div>
			<label className="form-label fw-semibold text-muted small text-uppercase">Zdjęcie samochodu</label>

			{imagePreview ? (
				// Podgląd wgranego zdjęcia
				<div className="position-relative rounded-4 overflow-hidden border" style={{ height: 200 }}>
					<img src={imagePreview} alt="Podgląd" className="w-100 h-100 object-fit-cover" />
					<button
						type="button"
						onClick={() => onImageChange(null)}
						className="btn btn-sm btn-danger position-absolute top-0 end-0 m-2 rounded-3 d-flex align-items-center gap-1">
						<i className="bi bi-x-lg" /> Usuń
					</button>
					<div className="position-absolute bottom-0 start-0 end-0 p-2 text-center"
						style={{ background: 'rgba(0,0,0,0.45)', color: '#fff', fontSize: 12 }}>
						{imageFile?.name || 'Zdjęcie ze schowka'}
					</div>
				</div>
			) : (
				// Strefa upuszczania
				<div
					className="rounded-4 border-2 border d-flex flex-column align-items-center justify-content-center gap-2 p-4 text-center"
					style={{
						height: 200,
						borderStyle: 'dashed',
						borderColor: isDragging ? '#0d6efd' : '#ced4da',
						background: isDragging ? '#e9f0ff' : '#fafafa',
						cursor: 'pointer',
						transition: 'all .15s ease',
					}}
					onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
					onDragLeave={() => setIsDragging(false)}
					onDrop={handleDrop}
					onClick={() => fileInputRef.current?.click()}>
					<div className="rounded-circle d-flex align-items-center justify-content-center"
						style={{ width: 56, height: 56, background: '#0d6efd15' }}>
						<i className="bi bi-image fs-3 text-primary" />
					</div>
					<div>
						<div className="fw-semibold text-dark mb-1" style={{ fontSize: 15 }}>
							Wklej zdjęcie <kbd style={{ fontSize: 11 }}>Ctrl+V</kbd>
						</div>
						<div className="text-muted small">lub przeciągnij plik, albo kliknij aby wybrać</div>
					</div>
					<input
						ref={fileInputRef}
						type="file"
						accept="image/*"
						className="d-none"
						onChange={(e) => processFile(e.target.files[0])}
					/>
				</div>
			)}
		</div>
	);
}

// ─── Formularz dodawania samochodu ─────────────────────────────────────────────
const EMPTY_FORM = {
	marka: '', model: '', rok_produkcji: '', cena_za_dobe: '',
	skrzynia_biegow: 'Automatyczna', rodzaj_paliwa: 'Benzyna',
	liczba_miejsc: '5', kategoria: 'SUV',
};

function AddCarForm({ token, onSuccess }) {
	const [form, setForm] = useState(EMPTY_FORM);
	const [imageFile, setImageFile] = useState(null);
	const [imagePreview, setImagePreview] = useState('');
	const [uploading, setUploading] = useState(false);
	const [progress, setProgress] = useState('');

	const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

	const handleImageChange = (file) => {
		setImageFile(file);
		setImagePreview(file ? URL.createObjectURL(file) : '');
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!form.marka || !form.model || !form.cena_za_dobe) {
			alert('Wypełnij wymagane pola: Marka, Model, Cena za dobę');
			return;
		}
		setUploading(true);

		try {
			let zdjecieUrl = '';

			// 1. Upload zdjęcia do Supabase Storage (jeśli wybrane)
			if (imageFile) {
				setProgress('Przesyłanie zdjęcia...');
				const ext = imageFile.name.split('.').pop() || 'jpg';
				const fileName = `${Date.now()}_${form.marka}_${form.model}.${ext}`.replace(/\s+/g, '_');

				const { data: uploadData, error: uploadError } = await supabase.storage
					.from('car-images') // ← nazwa bucketa w Supabase Storage
					.upload(fileName, imageFile, { cacheControl: '3600', upsert: false });

				if (uploadError) throw new Error('Błąd uploadu zdjęcia: ' + uploadError.message);

				const { data: { publicUrl } } = supabase.storage.from('car-images').getPublicUrl(uploadData.path);
				zdjecieUrl = publicUrl;
			}

			// 2. Zapis samochodu przez backend
			setProgress('Zapisywanie samochodu...');
			await apiFetch('/admin/cars', token, {
				method: 'POST',
				body: JSON.stringify({ ...form, zdjecie: zdjecieUrl }),
			});

			setForm(EMPTY_FORM);
			setImageFile(null);
			setImagePreview('');
			onSuccess();
		} catch (err) {
			alert('Błąd: ' + err.message);
		} finally {
			setUploading(false);
			setProgress('');
		}
	};

	return (
		<form onSubmit={handleSubmit}>
			<div className="row g-3">
				{/* Zdjęcie */}
				<div className="col-12">
					<ImageDropZone imageFile={imageFile} imagePreview={imagePreview} onImageChange={handleImageChange} />
				</div>

				{/* Marka + Model */}
				<div className="col-md-6">
					<label className="form-label fw-semibold text-muted small text-uppercase">Marka *</label>
					<input name="marka" value={form.marka} onChange={handleChange}
						className="form-control rounded-3" placeholder="np. Toyota" required />
				</div>
				<div className="col-md-6">
					<label className="form-label fw-semibold text-muted small text-uppercase">Model *</label>
					<input name="model" value={form.model} onChange={handleChange}
						className="form-control rounded-3" placeholder="np. Corolla" required />
				</div>

				{/* Rok + Cena */}
				<div className="col-md-6">
					<label className="form-label fw-semibold text-muted small text-uppercase">Rok produkcji</label>
					<input name="rok_produkcji" value={form.rok_produkcji} onChange={handleChange}
						type="number" min="1990" max="2030" className="form-control rounded-3" placeholder="np. 2022" />
				</div>
				<div className="col-md-6">
					<label className="form-label fw-semibold text-muted small text-uppercase">Cena za dobę (PLN) *</label>
					<div className="input-group">
						<input name="cena_za_dobe" value={form.cena_za_dobe} onChange={handleChange}
							type="number" min="1" className="form-control rounded-start-3" placeholder="np. 350" required />
						<span className="input-group-text">PLN</span>
					</div>
				</div>

				{/* Skrzynia + Paliwo */}
				<div className="col-md-4">
					<label className="form-label fw-semibold text-muted small text-uppercase">Skrzynia biegów</label>
					<select name="skrzynia_biegow" value={form.skrzynia_biegow} onChange={handleChange} className="form-select rounded-3">
						{['Automatyczna', 'Manualna'].map(v => <option key={v}>{v}</option>)}
					</select>
				</div>
				<div className="col-md-4">
					<label className="form-label fw-semibold text-muted small text-uppercase">Rodzaj paliwa</label>
					<select name="rodzaj_paliwa" value={form.rodzaj_paliwa} onChange={handleChange} className="form-select rounded-3">
						{['Benzyna', 'Diesel', 'Hybryda', 'Elektryczny', 'LPG'].map(v => <option key={v}>{v}</option>)}
					</select>
				</div>
				<div className="col-md-4">
					<label className="form-label fw-semibold text-muted small text-uppercase">Liczba miejsc</label>
					<select name="liczba_miejsc" value={form.liczba_miejsc} onChange={handleChange} className="form-select rounded-3">
						{['2', '4', '5', '7', '8', '9'].map(v => <option key={v}>{v}</option>)}
					</select>
				</div>

				{/* Kategoria */}
				<div className="col-12">
					<label className="form-label fw-semibold text-muted small text-uppercase">Kategoria / Typ nadwozia</label>
					<select name="kategoria" value={form.kategoria} onChange={handleChange} className="form-select rounded-3">
						{['SUV', 'Sedan', 'Hatchback', 'Kombi', 'Coupe', 'Kabriolet', 'Van', 'Pickup'].map(v => <option key={v}>{v}</option>)}
					</select>
				</div>

				{/* Submit */}
				<div className="col-12 pt-2">
					<button type="submit" className="btn btn-primary w-100 py-3 rounded-3 fw-bold d-flex align-items-center justify-content-center gap-2"
						disabled={uploading}>
						{uploading ? (
							<><span className="spinner-border spinner-border-sm" />{progress || 'Dodawanie...'}</>
						) : (
							<><i className="bi bi-plus-circle-fill" /> Dodaj samochód</>
						)}
					</button>
				</div>
			</div>
		</form>
	);
}

// ═════════════════════════════════════════════
// GŁÓWNY KOMPONENT
// ═════════════════════════════════════════════
export default function AdminPage() {
	const [token, setToken] = useState(null);
	const [isAdmin, setIsAdmin] = useState(false);
	const [loading, setLoading] = useState(true);
	const [activeTab, setActiveTab] = useState('dashboard');

	const [stats, setStats] = useState(null);
	const [rentals, setRentals] = useState([]);
	const [users, setUsers] = useState([]);
	const [cars, setCars] = useState([]);
	const [dataLoading, setDataLoading] = useState(false);
	const [error, setError] = useState(null);
	const [showAddForm, setShowAddForm] = useState(false);

	useEffect(() => {
		const init = async () => {
			const { data: { session } } = await supabase.auth.refreshSession();
			const finalSession = session || (await supabase.auth.getSession()).data.session;
			if (!finalSession) { setLoading(false); return; }
			setIsAdmin(finalSession.user?.user_metadata?.role === 'admin');
			setToken(finalSession.access_token);
			setLoading(false);
		};
		init();
	}, []);

	const loadData = useCallback(async (tab) => {
		if (!token) return;
		setDataLoading(true);
		setError(null);
		try {
			const endpointMap = {
				dashboard: '/admin/stats',
				rentals: '/admin/rentals',
				users: '/admin/users',
				cars: '/admin/cars',
			};
			const data = await apiFetch(endpointMap[tab], token);
			if (tab === 'dashboard') setStats(data);
			else if (tab === 'rentals') setRentals(data);
			else if (tab === 'users') setUsers(data);
			else if (tab === 'cars') setCars(data);
		} catch (err) {
			setError(err.message);
		} finally {
			setDataLoading(false);
		}
	}, [token]);

	useEffect(() => {
		if (isAdmin) loadData(activeTab);
	}, [activeTab, isAdmin, loadData]);

	const handleDeleteRental = async (id) => {
		if (!window.confirm('Usunąć to wypożyczenie?')) return;
		try {
			await apiFetch(`/admin/rentals/${id}`, token, { method: 'DELETE' });
			setRentals(p => p.filter(r => r.id !== id));
		} catch (err) { alert('Błąd: ' + err.message); }
	};

	const handleDeleteCar = async (id) => {
		if (!window.confirm('Usunąć ten samochód? Operacja jest nieodwracalna.')) return;
		try {
			await apiFetch(`/admin/cars/${id}`, token, { method: 'DELETE' });
			setCars(p => p.filter(c => c.id !== id));
		} catch (err) { alert('Błąd: ' + err.message); }
	};

	// ── Stany ładowania ──
	if (loading) return (
		<div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
			<div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} />
		</div>
	);

	if (!token) return (
		<div className="container py-5">
			<div className="alert alert-warning rounded-4 border-0 shadow-sm text-center p-5">
				<i className="bi bi-lock-fill fs-1 d-block mb-3 text-warning" />
				<h4>Musisz być zalogowany</h4>
			</div>
		</div>
	);

	if (!isAdmin) return (
		<div className="container py-5">
			<div className="alert alert-danger rounded-4 border-0 shadow-sm text-center p-5">
				<i className="bi bi-shield-x fs-1 d-block mb-3 text-danger" />
				<h4>Brak uprawnień</h4>
				<p className="text-muted mb-1">Twoje konto nie ma roli <strong>admin</strong>.</p>
				<p className="text-muted small mb-0">Jeśli właśnie ustawiłeś rolę w Supabase — wyloguj się i zaloguj ponownie.</p>
			</div>
		</div>
	);

	const navItems = [
		{ id: 'dashboard', icon: 'bi-speedometer2', label: 'Dashboard' },
		{ id: 'rentals', icon: 'bi-calendar2-check', label: 'Wypożyczenia' },
		{ id: 'cars', icon: 'bi-car-front-fill', label: 'Samochody' },
		{ id: 'users', icon: 'bi-people-fill', label: 'Użytkownicy' },
	];

	return (
		<div style={{ display: 'flex', minHeight: '100vh', background: '#f3f4f6' }}>

			{/* ── Sidebar ── */}
			<aside className="d-flex flex-column p-3 shadow"
				style={{ width: 240, background: '#111827', color: '#fff', flexShrink: 0 }}>
				<div className="px-2 py-3 mb-4">
					<div className="d-flex align-items-center gap-2">
						<div className="rounded-3 d-flex align-items-center justify-content-center"
							style={{ width: 38, height: 38, background: '#e94560' }}>
							<i className="bi bi-car-front-fill text-white" />
						</div>
						<div>
							<div className="fw-bold" style={{ fontSize: 15 }}>AutoRent</div>
							<div style={{ fontSize: 11, color: '#9ca3af' }}>Panel Admina</div>
						</div>
					</div>
				</div>

				<nav className="flex-grow-1">
					{navItems.map((item) => (
						<button key={item.id} onClick={() => { setActiveTab(item.id); setShowAddForm(false); }}
							className="btn w-100 text-start d-flex align-items-center gap-2 mb-1 px-3 py-2 rounded-3"
							style={{
								color: activeTab === item.id ? '#fff' : '#9ca3af',
								background: activeTab === item.id ? '#e94560' : 'transparent',
								border: 'none', fontSize: 14,
							}}>
							<i className={`bi ${item.icon}`} />{item.label}
						</button>
					))}
				</nav>

				<div className="px-2 py-3 rounded-3 mt-2"
					style={{ background: '#ffffff0f', fontSize: 12, color: '#6b7280' }}>
					<i className="bi bi-shield-check me-2 text-emerald-400" style={{ color: '#34d399' }} />
					Zalogowany jako admin
				</div>
			</aside>

			{/* ── Główna treść ── */}
			<main className="flex-grow-1 p-4" style={{ overflowX: 'auto' }}>

				{/* Nagłówek strony */}
				<div className="d-flex align-items-center justify-content-between mb-4">
					<h4 className="mb-0 fw-bold text-dark">
						{{ dashboard: 'Dashboard', rentals: 'Wszystkie wypożyczenia', cars: 'Samochody w flotcie', users: 'Użytkownicy' }[activeTab]}
					</h4>
					<div className="d-flex gap-2">
						{activeTab === 'cars' && (
							<button
								className={`btn btn-sm rounded-3 d-flex align-items-center gap-1 ${showAddForm ? 'btn-outline-secondary' : 'btn-primary'}`}
								onClick={() => setShowAddForm(f => !f)}>
								<i className={`bi ${showAddForm ? 'bi-x-lg' : 'bi-plus-lg'}`} />
								{showAddForm ? 'Anuluj' : 'Dodaj samochód'}
							</button>
						)}
						<button className="btn btn-sm btn-outline-secondary rounded-3 d-flex align-items-center gap-1"
							onClick={() => loadData(activeTab)} disabled={dataLoading}>
							<i className={`bi bi-arrow-clockwise ${dataLoading ? 'spin' : ''}`} />
							Odśwież
						</button>
					</div>
				</div>

				{error && (
					<div className="alert alert-danger rounded-3 border-0 mb-4">
						<i className="bi bi-exclamation-triangle-fill me-2" />{error}
					</div>
				)}

				{/* Formularz dodawania auta */}
				{activeTab === 'cars' && showAddForm && (
					<div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
						<h6 className="fw-bold mb-4 d-flex align-items-center gap-2">
							<i className="bi bi-plus-circle text-primary" /> Nowy samochód
						</h6>
						<AddCarForm token={token} onSuccess={() => { setShowAddForm(false); loadData('cars'); }} />
					</div>
				)}

				{dataLoading && (
					<div className="d-flex justify-content-center py-5">
						<div className="spinner-border text-primary" />
					</div>
				)}

				{/* ── DASHBOARD ── */}
				{activeTab === 'dashboard' && !dataLoading && stats && (
					<>
						<div className="row g-3 mb-4">
							<StatCard icon="bi-calendar2-check" label="Wszystkie wypożyczenia" value={stats.totalRentals} color="#0d6efd" />
							<StatCard icon="bi-clock-history" label="Aktywne teraz" value={stats.activeRentals} color="#198754" />
							<StatCard icon="bi-car-front-fill" label="Samochodów w flotcie" value={stats.totalCars} color="#fd7e14" />
							<StatCard icon="bi-people-fill" label="Zarejestrowani użytkownicy" value={stats.totalUsers} color="#6f42c1" />
						</div>
						<div className="card border-0 shadow-sm rounded-4 p-4">
							<h6 className="fw-bold mb-1">Łączny przychód</h6>
							<p className="text-muted small mb-3">Suma wszystkich zrealizowanych wypożyczeń</p>
							<div className="display-6 fw-bold text-success">{priceFmt.format(stats.totalRevenue ?? 0)}</div>
						</div>
					</>
				)}

				{/* ── WYPOŻYCZENIA ── */}
				{activeTab === 'rentals' && !dataLoading && (
					<div className="card border-0 shadow-sm rounded-4 overflow-hidden">
						<div className="table-responsive">
							<table className="table table-hover align-middle mb-0">
								<thead style={{ background: '#f9fafb' }}>
									<tr>
										{['ID', 'Samochód', 'Użytkownik', 'Od', 'Do', 'Kwota', 'Akcje'].map(h => (
											<th key={h} className={`py-3 fw-semibold text-muted ${h === 'Kwota' ? 'text-end' : h === 'Akcje' ? 'text-center' : ''} ${h === 'ID' ? 'px-4' : ''}`}
												style={{ fontSize: 13 }}>{h}</th>
										))}
									</tr>
								</thead>
								<tbody>
									{rentals.length === 0 ? (
										<tr><td colSpan={7} className="text-center text-muted py-5">
											<i className="bi bi-journal-x d-block mb-2 fs-1" />Brak wypożyczeń
										</td></tr>
									) : rentals.map(r => (
										<tr key={r.id}>
											<td className="px-4 text-muted" style={{ fontSize: 12 }}>#{String(r.id).slice(0, 8)}…</td>
											<td>
												<span className="fw-semibold">{r.auta?.marka} {r.auta?.model}</span>
												<div className="text-muted small">{priceFmt.format(r.auta?.cena_za_dobe ?? 0)}/doba</div>
											</td>
											<td><span className="badge bg-light text-dark border">{r.uzytkownik_email}</span></td>
											<td className="small">{dateFmt.format(new Date(r.data_wypozyczenia))}</td>
											<td className="small">{dateFmt.format(new Date(r.data_zwrotu))}</td>
											<td className="text-end fw-bold text-success">{priceFmt.format(r.cena_calkowita ?? 0)}</td>
											<td className="text-center">
												<button className="btn btn-sm btn-outline-danger rounded-3"
													onClick={() => handleDeleteRental(r.id)}>
													<i className="bi bi-trash3" />
												</button>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
						<div className="px-4 py-3 border-top text-muted small">Łącznie: <strong>{rentals.length}</strong> wypożyczeń</div>
					</div>
				)}

				{/* ── SAMOCHODY ── */}
				{activeTab === 'cars' && !dataLoading && (
					<div className="card border-0 shadow-sm rounded-4 overflow-hidden">
						<div className="table-responsive">
							<table className="table table-hover align-middle mb-0">
								<thead style={{ background: '#f9fafb' }}>
									<tr>
										{['Zdjęcie', 'Marka / Model', 'Kategoria', 'Paliwo', 'Skrzynia', 'Miejsca', 'Cena/doba', 'Akcje'].map(h => (
											<th key={h} className={`py-3 fw-semibold text-muted ${h === 'Cena/doba' ? 'text-end pe-3' : ''} ${h === 'Akcje' ? 'text-center' : ''}`}
												style={{ fontSize: 13, paddingLeft: h === 'Zdjęcie' ? 20 : undefined }}>{h}</th>
										))}
									</tr>
								</thead>
								<tbody>
									{cars.length === 0 ? (
										<tr><td colSpan={8} className="text-center text-muted py-5">
											<i className="bi bi-car-front d-block mb-2 fs-1" />Brak samochodów
										</td></tr>
									) : cars.map(car => (
										<tr key={car.id}>
											<td style={{ paddingLeft: 20 }}>
												{car.zdjecie ? (
													<img src={car.zdjecie} alt={car.model}
														className="rounded-3 object-fit-cover"
														style={{ width: 64, height: 44 }}
														onError={e => { e.target.style.display = 'none' }} />
												) : (
													<div className="rounded-3 bg-light d-flex align-items-center justify-content-center"
														style={{ width: 64, height: 44 }}>
														<i className="bi bi-image text-muted" />
													</div>
												)}
											</td>
											<td>
												<span className="fw-semibold">{car.marka} {car.model}</span>
												{car.rok_produkcji && <div className="text-muted small">{car.rok_produkcji}</div>}
											</td>
											<td><span className="badge bg-light text-dark border">{car.kategoria || car.typ_nadwozia || '—'}</span></td>
											<td className="small">{car.rodzaj_paliwa || '—'}</td>
											<td className="small">{car.skrzynia_biegow || '—'}</td>
											<td className="small text-center">{car.liczba_miejsc || '—'}</td>
											<td className="text-end pe-3 fw-bold text-primary">{priceFmt.format(car.cena_za_dobe ?? 0)}</td>
											<td className="text-center">
												<button className="btn btn-sm btn-outline-danger rounded-3"
													onClick={() => handleDeleteCar(car.id)}>
													<i className="bi bi-trash3" />
												</button>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
						<div className="px-4 py-3 border-top text-muted small">Łącznie: <strong>{cars.length}</strong> samochodów</div>
					</div>
				)}

				{/* ── UŻYTKOWNICY ── */}
				{activeTab === 'users' && !dataLoading && (
					<div className="card border-0 shadow-sm rounded-4 overflow-hidden">
						<div className="table-responsive">
							<table className="table table-hover align-middle mb-0">
								<thead style={{ background: '#f9fafb' }}>
									<tr>
										{['Email', 'Rola', 'Wypożyczenia', 'Ostatnie logowanie', 'Zarejestrowany'].map(h => (
											<th key={h} className={`py-3 fw-semibold text-muted ${h === 'Email' ? 'px-4' : ''}`}
												style={{ fontSize: 13 }}>{h}</th>
										))}
									</tr>
								</thead>
								<tbody>
									{users.length === 0 ? (
										<tr><td colSpan={5} className="text-center text-muted py-5">
											<i className="bi bi-people d-block mb-2 fs-1" />Brak użytkowników
										</td></tr>
									) : users.map(u => (
										<tr key={u.id}>
											<td className="px-4 fw-semibold">{u.email}</td>
											<td>
												<span className={`badge rounded-pill ${u.role === 'admin' ? 'bg-danger' : 'bg-primary bg-opacity-10 text-primary'}`}
													style={{ fontSize: 12 }}>
													{u.role === 'admin' ? '👑 Admin' : 'Użytkownik'}
												</span>
											</td>
											<td><strong>{u.rentals_count}</strong><span className="text-muted ms-1 small">szt.</span></td>
											<td className="small text-muted">{u.last_sign_in_at ? dateFmt.format(new Date(u.last_sign_in_at)) : '—'}</td>
											<td className="small text-muted">{dateFmt.format(new Date(u.created_at))}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
						<div className="px-4 py-3 border-top text-muted small">Łącznie: <strong>{users.length}</strong> użytkowników</div>
					</div>
				)}
			</main>

			<style>{`
				@keyframes spin { to { transform: rotate(360deg); } }
				.spin { animation: spin 1s linear infinite; display: inline-block; }
			`}</style>
		</div>
	);
}