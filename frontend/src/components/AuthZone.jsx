import { useState } from 'react'
import { supabase } from '../utils/supabase'

export default function AuthZone({ user, onLogout }) {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [isSignUpView, setIsSignUpView] = useState(false)

	const handleLogin = async (e) => {
		e.preventDefault()
		const { error } = await supabase.auth.signInWithPassword({ email, password })
		if (error) alert('Błąd logowania: ' + error.message)
		else {
			setEmail('')
			setPassword('')
		}
	}

	const handleSignUp = async (e) => {
		e.preventDefault()
		const { error } = await supabase.auth.signUp({ email, password })
		if (error) alert('Błąd rejestracji: ' + error.message)
		else {
			alert('Zarejestrowano pomyślnie! Możesz się teraz zalogować.')
			setIsSignUpView(false)
			setEmail('')
			setPassword('')
		}
	}

	return (
		<div className='auth-zone mb-4 p-3 p-sm-4 bg-white border-0 shadow-sm rounded-4 animate-fade-in'>
			{user ? (
				<div className='d-flex flex-column flex-sm-row justify-content-between align-items-center gap-3 w-100'>
					<div className='d-flex align-items-center gap-2 text-center text-sm-start'>
						<span className='dot bg-success animate-pulse me-1'></span>
						<span className='text-muted small'>
							Zalogowany jako: <strong className='text-dark d-block d-sm-inline'>{user.email}</strong>
						</span>
					</div>
					<button className='btn btn-sm btn-outline-danger px-4 rounded-pill w-100 w-sm-auto' onClick={onLogout}>
						Wyloguj się
					</button>
				</div>
			) : (
				<div className='row align-items-center g-3'>
					<div className='col-12 col-lg-4 text-center text-lg-start'>
						<h5 className='fw-bold m-0 text-dark fs-6'>
							{isSignUpView ? 'Dołącz do nas i rezerwuj' : 'Zaloguj się na konto'}
						</h5>
						<p className='text-muted small m-0'>Aby rezerwować pojazdy online</p>
					</div>
					<div className='col-12 col-lg-8'>
						<form
							onSubmit={isSignUpView ? handleSignUp : handleLogin}
							className='row g-2 align-items-center justify-content-lg-end'>
							{/* Inputy na mobile mają teraz 100% szerokości kolumny, a na desktopie max 240px */}
							<div className='col-12 col-sm-auto' style={{ minWidth: '200px' }}>
								<input
									type='email'
									placeholder='Adres e-mail'
									className='form-control rounded-3 border-light-subtle px-3 py-2 text-sm w-100'
									style={{ maxWidth: '100%' }}
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									required
								/>
							</div>
							<div className='col-12 col-sm-auto' style={{ minWidth: '200px' }}>
								<input
									type='password'
									placeholder='Hasło'
									className='form-control rounded-3 border-light-subtle px-3 py-2 text-sm w-100'
									style={{ maxWidth: '100%' }}
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									required
								/>
							</div>
							<div className='col-12 col-sm-auto d-flex flex-column flex-sm-row gap-2 w-100 w-sm-auto mt-2 mt-sm-0'>
								<button
									type='submit'
									className='btn btn-primary px-4 py-2 rounded-3 fw-medium shadow-sm w-100 w-sm-auto'>
									{isSignUpView ? 'Zarejestruj' : 'Zaloguj'}
								</button>
								<button
									type='button'
									className='btn btn-link btn-sm text-decoration-none fw-bold text-center'
									onClick={() => setIsSignUpView(!isSignUpView)}>
									{isSignUpView ? 'Chcę się zalogować' : 'Stwórz konto'}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	)
}
