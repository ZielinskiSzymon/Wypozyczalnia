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
		<div className='auth-zone mb-5 p-4 bg-white border-0 shadow-sm rounded-4 animate-fade-in'>
			{user ? (
				<div className='d-flex justify-content-between align-items-center w-100'>
					<div className='d-flex align-items-center gap-2'>
						<span className='dot bg-success animate-pulse me-2'></span>
						<span className='text-muted'>
							Zalogowany jako: <strong className='text-dark'>{user.email}</strong>
						</span>
					</div>
					<button className='btn btn-sm btn-outline-danger px-4 rounded-pill' onClick={onLogout}>
						Wyloguj się
					</button>
				</div>
			) : (
				<div className='row align-items-center g-3'>
					<div className='col-lg-4 text-center text-lg-start'>
						<h5 className='fw-bold m-0 text-dark'>
							{isSignUpView ? 'Dołącz do nas i rezerwuj' : 'Zaloguj się na konto'}
						</h5>
						<p className='text-muted small m-0'>Aby rezerwować pojazdy online</p>
					</div>
					<div className='col-lg-8'>
						<form
							onSubmit={isSignUpView ? handleSignUp : handleLogin}
							className='d-flex flex-wrap flex-sm-nowrap gap-2 align-items-center justify-content-lg-end'>
							<input
								type='email'
								placeholder='Adres e-mail'
								className='form-control rounded-3 border-light-subtle px-3 py-2 text-sm'
								style={{ maxWidth: '240px' }}
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
							/>
							<input
								type='password'
								placeholder='Hasło'
								className='form-control rounded-3 border-light-subtle px-3 py-2 text-sm'
								style={{ maxWidth: '240px' }}
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
							/>
							<button type='submit' className='btn btn-primary px-4 py-2 rounded-3 fw-medium shadow-sm'>
								{isSignUpView ? 'Zarejestruj' : 'Zaloguj'}
							</button>
							<button
								type='button'
								className='btn btn-link btn-sm text-decoration-none fw-bold ms-2'
								onClick={() => setIsSignUpView(!isSignUpView)}>
								{isSignUpView ? 'Chcę się zalogować' : 'Stwórz konto'}
							</button>
						</form>
					</div>
				</div>
			)}
		</div>
	)
}
