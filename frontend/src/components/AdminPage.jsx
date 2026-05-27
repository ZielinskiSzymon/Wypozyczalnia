import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../utils/supabase';

const dateFormatter = new Intl.DateTimeFormat('pl-PL', {
	day: '2-digit', month: 'short', year: 'numeric',
});
const priceFormatter = new Intl.NumberFormat('pl-PL', {
	style: 'currency', currency: 'PLN', minimumFractionDigits: 0,
});

const API = 'http://localhost:3000';

async function apiFetch(path, token, options = {}) {
	const res = await fetch(`${API}${path}`, {
		...options,
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
			...(options.headers || {}),
		},
	});
	const json = await res.json();
	if (!res.ok) throw new Error(json.error || `Błąd ${res.status}`);
	return json.data;
}

function StatCard({ icon, label, value, color }) {
	return (
		<div className="col-6 col-xl-3">
			<div className="card border-0 shadow-sm rounded-4 h-100">
				<div className="card-body d-flex align-items-center gap-3 p-4">
					<div
						className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
						style={{ width: 52, height: 52, background: color + '20' }}>
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

export default function AdminPage() {
	const [token, setToken] = useState(null);
	const [isAdmin, setIsAdmin] = useState(false);
	const [loading, setLoading] = useState(true);
	const [activeTab, setActiveTab] = useState('dashboard');

	const [stats, setStats] = useState(null);
	const [rentals, setRentals] = useState([]);
	const [users, setUsers] = useState([]);
	const [dataLoading, setDataLoading] = useState(false);
	const [error, setError] = useState(null);

	// BUGFIX: używamy refreshSession żeby mieć aktualny token z nową rolą
	useEffect(() => {
		const init = async () => {
			// Odśwież sesję — pobierze nowy JWT z aktualnym user_metadata
			const { data: { session } } = await supabase.auth.refreshSession();

			if (!session) {
				// Fallback: spróbuj getSession jeśli refresh nie wróci sesji
				const { data: { session: fallback } } = await supabase.auth.getSession();
				if (!fallback) { setLoading(false); return; }
				const role = fallback.user?.user_metadata?.role;
				setIsAdmin(role === 'admin');
				setToken(fallback.access_token);
				setLoading(false);
				return;
			}

			const role = session.user?.user_metadata?.role;
			setIsAdmin(role === 'admin');
			setToken(session.access_token);
			setLoading(false);
		};
		init();
	}, []);

	const loadData = useCallback(async (tab) => {
		if (!token) return;
		setDataLoading(true);
		setError(null);
		try {
			if (tab === 'dashboard') {
				const data = await apiFetch('/admin/stats', token);
				setStats(data);
			} else if (tab === 'rentals') {
				const data = await apiFetch('/admin/rentals', token);
				setRentals(data);
			} else if (tab === 'users') {
				const data = await apiFetch('/admin/users', token);
				setUsers(data);
			}
		} catch (err) {
			setError(err.message);
		} finally {
			setDataLoading(false);
		}
	}, [token]);

	useEffect(() => {
		if (isAdmin) loadData(activeTab);
	}, [activeTab, isAdmin, loadData]);

	const handleDeleteRental = async (rentalId) => {
		if (!window.confirm('Czy na pewno chcesz usunąć to wypożyczenie?')) return;
		try {
			await apiFetch(`/admin/rentals/${rentalId}`, token, { method: 'DELETE' });
			setRentals((prev) => prev.filter((r) => r.id !== rentalId));
		} catch (err) {
			alert('Błąd: ' + err.message);
		}
	};

	// ── Stany ładowania ──
	if (loading) {
		return (
			<div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
				<div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} />
			</div>
		);
	}

	if (!token) {
		return (
			<div className="container py-5">
				<div className="alert alert-warning rounded-4 border-0 shadow-sm text-center p-5">
					<i className="bi bi-lock-fill fs-1 d-block mb-3 text-warning" />
					<h4>Musisz być zalogowany</h4>
					<p className="text-muted mb-0">Zaloguj się, aby uzyskać dostęp do panelu admina.</p>
				</div>
			</div>
		);
	}

	if (!isAdmin) {
		return (
			<div className="container py-5">
				<div className="alert alert-danger rounded-4 border-0 shadow-sm text-center p-5">
					<i className="bi bi-shield-x fs-1 d-block mb-3 text-danger" />
					<h4>Brak uprawnień</h4>
					<p className="text-muted mb-0">
						Twoje konto nie ma roli <strong>admin</strong>.
					</p>
					<p className="text-muted small mt-2 mb-0">
						Jeśli właśnie ustawiłeś rolę w Supabase — wyloguj się i zaloguj ponownie.
					</p>
				</div>
			</div>
		);
	}

	// ── Sidebar nawigacja ──
	const navItems = [
		{ id: 'dashboard', icon: 'bi-speedometer2', label: 'Dashboard' },
		{ id: 'rentals', icon: 'bi-calendar2-check', label: 'Wypożyczenia' },
		{ id: 'users', icon: 'bi-people-fill', label: 'Użytkownicy' },
	];

	return (
		<div style={{ display: 'flex', minHeight: '100vh', background: '#f8f9fa' }}>

			{/* ── Sidebar ── */}
			<aside
				className="d-flex flex-column p-3 shadow-sm"
				style={{ width: 240, background: '#1a1a2e', color: '#fff', flexShrink: 0 }}>

				<div className="px-2 py-3 mb-4">
					<div className="d-flex align-items-center gap-2">
						<div
							className="rounded-3 d-flex align-items-center justify-content-center"
							style={{ width: 38, height: 38, background: '#e94560' }}>
							<i className="bi bi-car-front-fill text-white" />
						</div>
						<div>
							<div className="fw-bold" style={{ fontSize: 15 }}>AutoRent</div>
							<div style={{ fontSize: 11, color: '#aaa' }}>Panel Admina</div>
						</div>
					</div>
				</div>

				<nav className="flex-grow-1">
					{navItems.map((item) => (
						<button
							key={item.id}
							onClick={() => setActiveTab(item.id)}
							className="btn w-100 text-start d-flex align-items-center gap-2 mb-1 px-3 py-2 rounded-3"
							style={{
								color: activeTab === item.id ? '#fff' : '#aaa',
								background: activeTab === item.id ? '#e94560' : 'transparent',
								border: 'none',
								fontSize: 14,
							}}>
							<i className={`bi ${item.icon}`} />
							{item.label}
						</button>
					))}
				</nav>

				<div
					className="px-2 py-3 rounded-3 mt-2"
					style={{ background: '#ffffff10', fontSize: 12, color: '#aaa' }}>
					<i className="bi bi-shield-check me-2 text-success" />
					Zalogowany jako admin
				</div>
			</aside>

			{/* ── Główna treść ── */}
			<main className="flex-grow-1 p-4" style={{ overflowX: 'auto' }}>

				<div className="d-flex align-items-center justify-content-between mb-4">
					<h4 className="mb-0 fw-bold">
						{activeTab === 'dashboard' && 'Dashboard'}
						{activeTab === 'rentals' && 'Wszystkie wypożyczenia'}
						{activeTab === 'users' && 'Użytkownicy'}
					</h4>
					<button
						className="btn btn-sm btn-outline-secondary rounded-3"
						onClick={() => loadData(activeTab)}
						disabled={dataLoading}>
						<i className={`bi bi-arrow-clockwise me-1 ${dataLoading ? 'spin' : ''}`} />
						Odśwież
					</button>
				</div>

				{error && (
					<div className="alert alert-danger rounded-3 border-0">
						<i className="bi bi-exclamation-triangle-fill me-2" />
						{error}
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
							<div className="display-6 fw-bold text-success">
								{priceFormatter.format(stats.totalRevenue ?? 0)}
							</div>
						</div>
					</>
				)}

				{/* ── WYPOŻYCZENIA ── */}
				{activeTab === 'rentals' && !dataLoading && (
					<div className="card border-0 shadow-sm rounded-4 overflow-hidden">
						<div className="table-responsive">
							<table className="table table-hover align-middle mb-0">
								<thead style={{ background: '#f1f3f5' }}>
									<tr>
										<th className="px-4 py-3 fw-semibold text-muted" style={{ fontSize: 13 }}>ID</th>
										<th className="py-3 fw-semibold text-muted" style={{ fontSize: 13 }}>Samochód</th>
										<th className="py-3 fw-semibold text-muted" style={{ fontSize: 13 }}>Użytkownik</th>
										<th className="py-3 fw-semibold text-muted" style={{ fontSize: 13 }}>Od</th>
										<th className="py-3 fw-semibold text-muted" style={{ fontSize: 13 }}>Do</th>
										<th className="py-3 fw-semibold text-muted text-end" style={{ fontSize: 13 }}>Kwota</th>
										<th className="py-3 fw-semibold text-muted text-center" style={{ fontSize: 13 }}>Akcje</th>
									</tr>
								</thead>
								<tbody>
									{rentals.length === 0 ? (
										<tr>
											<td colSpan={7} className="text-center text-muted py-5">
												<i className="bi bi-journal-x d-block mb-2" style={{ fontSize: 32 }} />
												Brak wypożyczeń
											</td>
										</tr>
									) : rentals.map((rental) => (
										<tr key={rental.id}>
											<td className="px-4 text-muted" style={{ fontSize: 12 }}>
												#{String(rental.id).slice(0, 8)}…
											</td>
											<td>
												<span className="fw-semibold">
													{rental.auta?.marka} {rental.auta?.model}
												</span>
												<br />
												<span className="text-muted small">
													{priceFormatter.format(rental.auta?.cena_za_dobe ?? 0)}/doba
												</span>
											</td>
											<td>
												<span className="badge bg-light text-dark border" style={{ fontSize: 12 }}>
													{rental.uzytkownik_email}
												</span>
											</td>
											<td className="small">{dateFormatter.format(new Date(rental.data_wypozyczenia))}</td>
											<td className="small">{dateFormatter.format(new Date(rental.data_zwrotu))}</td>
											<td className="text-end fw-bold text-success">
												{priceFormatter.format(rental.cena_calkowita ?? 0)}
											</td>
											<td className="text-center">
												<button
													className="btn btn-sm btn-outline-danger rounded-3"
													onClick={() => handleDeleteRental(rental.id)}
													title="Usuń wypożyczenie">
													<i className="bi bi-trash3" />
												</button>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
						<div className="px-4 py-3 border-top text-muted small">
							Łącznie: <strong>{rentals.length}</strong> wypożyczeń
						</div>
					</div>
				)}

				{/* ── UŻYTKOWNICY ── */}
				{activeTab === 'users' && !dataLoading && (
					<div className="card border-0 shadow-sm rounded-4 overflow-hidden">
						<div className="table-responsive">
							<table className="table table-hover align-middle mb-0">
								<thead style={{ background: '#f1f3f5' }}>
									<tr>
										<th className="px-4 py-3 fw-semibold text-muted" style={{ fontSize: 13 }}>Email</th>
										<th className="py-3 fw-semibold text-muted" style={{ fontSize: 13 }}>Rola</th>
										<th className="py-3 fw-semibold text-muted" style={{ fontSize: 13 }}>Wypożyczenia</th>
										<th className="py-3 fw-semibold text-muted" style={{ fontSize: 13 }}>Ostatnie logowanie</th>
										<th className="py-3 fw-semibold text-muted" style={{ fontSize: 13 }}>Zarejestrowany</th>
									</tr>
								</thead>
								<tbody>
									{users.length === 0 ? (
										<tr>
											<td colSpan={5} className="text-center text-muted py-5">
												<i className="bi bi-people d-block mb-2" style={{ fontSize: 32 }} />
												Brak użytkowników
											</td>
										</tr>
									) : users.map((u) => (
										<tr key={u.id}>
											<td className="px-4 fw-semibold">{u.email}</td>
											<td>
												<span
													className={`badge rounded-pill ${u.role === 'admin' ? 'bg-danger' : 'bg-primary bg-opacity-10 text-primary'}`}
													style={{ fontSize: 12 }}>
													{u.role === 'admin' ? '👑 Admin' : 'Użytkownik'}
												</span>
											</td>
											<td>
												<span className="fw-bold">{u.rentals_count}</span>
												<span className="text-muted ms-1 small">szt.</span>
											</td>
											<td className="small text-muted">
												{u.last_sign_in_at ? dateFormatter.format(new Date(u.last_sign_in_at)) : '—'}
											</td>
											<td className="small text-muted">
												{dateFormatter.format(new Date(u.created_at))}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
						<div className="px-4 py-3 border-top text-muted small">
							Łącznie: <strong>{users.length}</strong> użytkowników
						</div>
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