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
			<div className='d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 w-100'>
				
				{/* Lewa strona: Status / Nagłówek */}
				<div className='text-center text-md-start'>
					{user ? (
						<div className='d-flex align-items-center justify-content-center justify-content-md-start gap-2'>
							<span className='dot bg-success animate-pulse me-1' style={{ width: '8px', height: '8px', borderRadius: '50%', display: 'inline-block' }}></span>
							<span className='text-muted small'>
								Zalogowany jako: <strong className='text-dark d-block d-sm-inline'>{user.email}</strong>
							</span>
						</div>
					) : (
						<>
							<h5 className='fw-bold m-0 text-dark fs-6'>
								{isSignUpView ? 'Dołącz do nas i rezerwuj' : 'Zaloguj się na konto'}
							</h5>
							<p className='text-muted small m-0 d-none d-sm-block'>Aby rezerwować pojazdy online</p>
						</>
					)}
				</div>

				{/* Prawa strona: Akcje (Zgrabny formularz lub ładny przycisk) */}
				<div className='w-100 w-md-auto d-flex justify-content-center justify-content-md-end'>
					{user ? (
						<button 
							className='btn btn-sm btn-outline-danger px-4 rounded-pill w-100 w-sm-auto' 
							style={{ maxWidth: '200px' }} 
							onClick={onLogout}
						>
							Wyloguj się
						</button>
					) : (
						<form
							onSubmit={isSignUpView ? handleSignUp : handleLogin}
							className='d-flex flex-column flex-sm-row align-items-stretch align-items-sm-center justify-content-md-end gap-2 w-100'
						>
							{/* Input Email */}
							<input
								type='email'
								placeholder='Adres e-mail'
								className='form-control rounded-3 border-light-subtle px-3 py-2 text-sm w-100'
								style={{ maxWidth: '240px' }}
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
							/>
							
							{/* Input Hasło */}
							<input
								type='password'
								placeholder='Hasło'
								className='form-control rounded-3 border-light-subtle px-3 py-2 text-sm w-100'
								style={{ maxWidth: '180px' }}
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
							/>
							
							{/* Przyciski operacyjne */}
							<div className='d-flex align-items-center gap-2 mt-1 mt-sm-0'>
								<button
									type='submit'
									className='btn btn-primary px-4 py-2 rounded-3 fw-medium shadow-sm flex-grow-1 flex-sm-grow-0 text-nowrap'
								>
									{isSignUpView ? 'Zarejestruj' : 'Zaloguj'}
								</button>
								<button
									type='button'
									className='btn btn-link btn-sm text-decoration-none fw-bold text-nowrap small'
									onClick={() => setIsSignUpView(!isSignUpView)}
								>
									{isSignUpView ? 'Logowanie' : 'Stwórz konto'}
								</button>
							</div>
						</form>
					)}
				</div>

			</div>
		</div>
	)
}