'use client';
import Input from '../input/input.jsx';
import AuthShell from './authShell.jsx';
import PasswordField from './passwordField.jsx';
import { verifyTypesRegisterModal } from '../utils/verifyTypes.js';

// Same contract as LoginModal, one field longer. Note what is NOT here: nothing compares `password`
// against `confirmPassword`. The modal has no idea what a valid password is for this product - eight
// characters, a symbol, not the last three used - so it renders whatever `error` it is handed and
// leaves the rule to whoever knows it.
export default function RegisterModal({
    open,
    onClose,
    triggerRef,
    logo,
    brand,
    title = 'Crear cuenta',
    email,
    onEmailChange,
    password,
    onPasswordChange,
    confirmPassword,
    onConfirmPasswordChange,
    emailLabel = 'Correo',
    emailPlaceholder = 'Escribe tu correo',
    passwordLabel = 'Contraseña',
    passwordPlaceholder = 'Crea una contraseña',
    confirmLabel = 'Confirma tu contraseña',
    confirmPlaceholder = 'Escríbela de nuevo',
    submitLabel = 'Crear cuenta',
    onSubmit,
    onGoogle,
    googleLabel,
    switchText = '¿Ya tienes cuenta?',
    switchAction = 'Inicia sesión',
    onSwitch,
    error,
    loading = false,
}) {
    verifyTypesRegisterModal({
        email, password, confirmPassword,
        onEmailChange, onPasswordChange, onConfirmPasswordChange, onSubmit,
    });

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
            <PasswordField
                label={confirmLabel}
                placeholder={confirmPlaceholder}
                value={confirmPassword}
                onChange={onConfirmPasswordChange}
                disabled={loading}
            />
        </AuthShell>
    )
}
