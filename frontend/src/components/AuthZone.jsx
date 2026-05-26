import { useState } from 'react'
import { supabase } from '../utils/supabase'

export default function AuthZone({ user, onLogout }) {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [isSignUpView, setIsSignUpView] = useState(false)

	const handleLogin = async (e) => {
		e.preventDefault()
		if (!email || !password) return
		const { error } = await supabase.auth.signInWithPassword({ email, password })
		if (error) alert('Błąd logowania: ' + error.message)
		else {
			setEmail('')
			setPassword('')
		}
	}

	const handleSignUp = async (e) => {
		e.preventDefault()
		if (!email || !password) return
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
		<div className='auth-zone-responsive w-100'>
			<div className='d-flex flex-column flex-lg-row justify-content-between align-items-center gap-3 w-100'>
				{user ? (
					/* WIDOK DLA ZALOGOWANEGO UŻYTKOWNIKA */
					<div className='d-flex flex-column flex-lg-row align-items-center justify-content-between w-100 py-1 px-2 rounded-3 bg-light border border-light-subtle gap-3'>
						<div className='d-flex align-items-center gap-2'>
							<div
								className='bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-sm'
								style={{ width: '38px', height: '38px' }}>
								{user.email?.charAt(0).toUpperCase()}
							</div>
							<div className='d-flex flex-column align-items-start'>
								<span className='text-dark fw-semibold lh-sm text-truncate small' style={{ maxWidth: '180px' }}>
									Zalogowano jako
								</span>
								<span className='text-muted small text-truncate lh-sm' style={{ maxWidth: '180px' }}>
									{user.email}
								</span>
							</div>
						</div>
						<button
							onClick={onLogout}
							className='btn btn-outline-danger px-3 rounded-3 fw-medium text-sm d-flex align-items-center justify-content-center gap-2 auth-btn-container w-100 w-lg-auto'
							style={{ height: '40px' }}>
							<i className='bi bi-box-arrow-right'></i>
							<span>Wyloguj się</span>
						</button>
					</div>
				) : (
					/* FORMULARZ LOGOWANIA / REJESTRACJI */
					<form
						onSubmit={isSignUpView ? handleSignUp : handleLogin}
						className='d-flex align-items-center w-100 auth-dynamic-form'>
						<div className='d-flex align-items-center gap-3 w-100 auth-dynamic-form'>
							{/* Input Email */}
							<div className='position-relative auth-input-wrapper'>
								<i className='bi bi-envelope position-absolute top-50 start-0 translate-middle-y text-muted ms-3'></i>
								<input
									type='email'
									placeholder='Adres e-mail'
									className='form-control rounded-3 ps-5 text-sm shadow-none border-light-subtle'
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									required
								/>
							</div>

							{/* Input Hasło */}
							<div className='position-relative auth-input-wrapper'>
								<i className='bi bi-lock position-absolute top-50 start-0 translate-middle-y text-muted ms-3'></i>
								<input
									type='password'
									placeholder='Hasło'
									className='form-control rounded-3 ps-5 text-sm shadow-none border-light-subtle'
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									required
								/>
							</div>

							{/* Przyciski Akcji */}
							<div className='d-flex flex-row gap-2 auth-btn-container align-items-center w-100 w-lg-auto'>
								<button
									type='submit'
									className='btn btn-primary px-4 rounded-3 fw-bold shadow-sm text-nowrap d-flex align-items-center justify-content-center gap-2'>
									<i className={`bi ${isSignUpView ? 'bi-person-plus-fill' : 'bi-box-arrow-in-right'}`}></i>
									<span>{isSignUpView ? 'Zarejestruj' : 'Zaloguj'}</span>
								</button>

								<button
									type='button'
									className='btn btn-light border px-3 fw-semibold text-nowrap small text-center rounded-3 text-muted'
									onClick={() => setIsSignUpView(!isSignUpView)}>
									{isSignUpView ? 'Masz konto? Zaloguj' : 'Utwórz konto'}
								</button>
							</div>
						</div>
					</form>
				)}
			</div>
		</div>
	)
}
