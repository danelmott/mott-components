'use client';
import AuthShell from './authShell.jsx';
import OtpFields from './otpFields.jsx';
import PasswordField from './passwordField.jsx';
import { verifyTypesRecoverPasswordModal } from '../utils/verifyTypes.js';

/*Two steps, one panel. `step` is a prop and not internal state on purpose: moving from the code to
  the password means the code was accepted, and only the consumer can ask the server that. A modal
  that advanced itself would either have to guess, or have to be told - and being told IS this prop.

  Everything else follows the rest of authModals: every field is controlled from outside, the change
  handlers get the VALUE, and nothing in here decides what a valid password is. Handing back an
  `error` string is how the answer gets on screen.

  There is no third step. Saving is the end of the flow: `onSubmitPassword` runs, and whoever owns the
  session opens the login modal after it - the switch line at the bottom of this step points there
  too, for someone who remembered their password halfway through.*/
export default function RecoverPasswordModal({
    open,
    onClose,
    triggerRef,
    logo,
    brand,
    step = 'code',

    // step 'code'
    email,
    code = '',
    onCodeChange,
    length = 6,
    description,
    onVerifyCode,
    onResend,
    codeTitle = 'Recupera tu contraseña',
    codeSubmitLabel = 'Verificar',
    resendText = '¿No te llegó el código?',
    resendAction = 'Reenviar',

    // step 'password'
    password,
    onPasswordChange,
    confirmPassword,
    onConfirmPasswordChange,
    onSubmitPassword,
    passwordTitle = 'Crea una contraseña nueva',
    passwordLabel = 'Nueva contraseña',
    passwordPlaceholder = 'Escribe tu contraseña nueva',
    confirmLabel = 'Confirma tu contraseña',
    confirmPlaceholder = 'Escríbela de nuevo',
    passwordSubmitLabel = 'Guardar contraseña',

    // back to the login modal
    onSwitch,
    switchText = '¿Ya la recordaste?',
    switchAction = 'Inicia sesión',

    error,
    loading = false,
}) {
    verifyTypesRecoverPasswordModal({
        step, email, code, onCodeChange, length, onVerifyCode, onResend,
        password, confirmPassword, onPasswordChange, onConfirmPasswordChange, onSubmitPassword,
    });

    const isCode = step === 'code';

    return (
        <AuthShell
            open={open}
            onClose={onClose}
            triggerRef={triggerRef}
            logo={logo}
            brand={brand}
            title={isCode ? codeTitle : passwordTitle}
            submitLabel={isCode ? codeSubmitLabel : passwordSubmitLabel}
            onSubmit={isCode ? onVerifyCode : onSubmitPassword}
            /*No `onGoogle` in either step, so AuthShell leaves the button out entirely: someone who
              got a code in their inbox is already past choosing how to identify themselves.*/
            switchText={isCode ? resendText : switchText}
            switchAction={isCode ? resendAction : switchAction}
            onSwitch={isCode ? onResend : onSwitch}
            error={error}
            loading={loading}
        >
            {isCode ? (
                <OtpFields
                    code={code}
                    onCodeChange={onCodeChange}
                    length={length}
                    email={email}
                    description={description}
                    disabled={loading}
                    groupLabel={codeTitle}
                />
            ) : (
                <>
                    {/*The panel does not close between the steps, so the focus stays where it was -
                       on the submit button, which never unmounted. `autoFocus` puts it back on the
                       field that just appeared, which is the only thing left to do here.*/}
                    <PasswordField
                        autoFocus
                        autoComplete="new-password"
                        label={passwordLabel}
                        placeholder={passwordPlaceholder}
                        value={password}
                        onChange={onPasswordChange}
                        disabled={loading}
                    />
                    <PasswordField
                        autoComplete="new-password"
                        label={confirmLabel}
                        placeholder={confirmPlaceholder}
                        value={confirmPassword}
                        onChange={onConfirmPasswordChange}
                        disabled={loading}
                    />
                </>
            )}
        </AuthShell>
    )
}
