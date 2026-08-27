'use client';
import Input from '../input/input.jsx';
import AuthShell, { SwitchLink } from './authShell.jsx';
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
    onForgotPassword,
    forgotPasswordText = '¿Olvidaste tu contraseña?',
    onGoogle,
    googleLabel,
    switchText = '¿No tienes cuenta?',
    switchAction = 'Regístrate',
    onSwitch,
    error,
    loading = false,
}) {
    verifyTypesLoginModal({ email, password, onEmailChange, onPasswordChange, onSubmit, onForgotPassword });
    //authshell 
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

            {/*Only when there is somewhere for it to go. A dead "forgot your password?" is worse than
               no link at all, so the callback is what decides whether it exists.

               The wrapper carries `mott-body-medium` because SwitchLink is `font: inherit` - out here
               in the form there is no typescale to inherit, so without this it picks up the browser's
               16px and comes out bigger than the title's own switch line. `body-medium` is the size
               that line uses, which is what this link is: the same kind of aside, higher up.

               The wrapper also exists to stop the button stretching: the form is a flex column, and a
               bare <button> in it would be pulled to the full width by `align-items: stretch`.*/}
            {onForgotPassword && (
                <div className="mott-body-medium">
                    <SwitchLink onClick={onForgotPassword} disabled={loading}>
                        {forgotPasswordText}
                    </SwitchLink>
                </div>
            )}
        </AuthShell>
    );
}
