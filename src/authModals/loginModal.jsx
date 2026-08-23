'use client';
import Input from '../input/input.jsx';
import AuthShell from './authShell.jsx';
import PasswordField from './passwordField.jsx';
import { verifyTypesLoginModal } from '../utils/verifyTypes.js';

// Controlled, field by field: the modal never holds the email or the password, it only renders what
// it is given and reports what was typed. That is what lets the consumer validate as the user types,
// prefill from a previous attempt, or keep the value across a failed submit - none of which is
// possible if the modal owns the state and only speaks at submit time.
//
// `onChange` hands over the VALUE, not the event, because that is what Input already does.
export default function LoginModal({
    open,
    onClose,
    triggerRef,
    logo,
    brand,
    title = 'Iniciar sesión',
    email,
    onEmailChange,
    password,
    onPasswordChange,
    emailLabel = 'Correo',
    emailPlaceholder = 'Escribe tu correo',
    passwordLabel = 'Contraseña',
    passwordPlaceholder = 'Escribe tu contraseña',
    submitLabel = 'Iniciar sesión',
    onSubmit,
    onGoogle,
    googleLabel,
    switchText = '¿No tienes cuenta?',
    switchAction = 'Regístrate',
    onSwitch,
    error,
    loading = false,
}) {
    verifyTypesLoginModal({ email, password, onEmailChange, onPasswordChange, onSubmit });

    return (
        <AuthShell
            open={open}
            onClose={onClose}
            triggerRef={triggerRef}
            logo={logo}
            brand={brand}
            title={title}
            submitLabel={submitLabel}
            onSubmit={onSubmit}
            onGoogle={onGoogle}
            googleLabel={googleLabel}
            switchText={switchText}
            switchAction={switchAction}
            onSwitch={onSwitch}
            error={error}
            loading={loading}
        >
            <Input
                type="text"
                inputMode="email"
                autoComplete="email"
                label={emailLabel}
                placeholder={emailPlaceholder}
                value={email}
                onChange={onEmailChange}
                disabled={loading}
            />
            <PasswordField
                label={passwordLabel}
                placeholder={passwordPlaceholder}
                value={password}
                onChange={onPasswordChange}
                disabled={loading}
            />
        </AuthShell>
    )
}
