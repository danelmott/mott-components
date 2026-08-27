'use client';
import AuthShell from './authShell.jsx';
import OtpFields from './otpFields.jsx';
import { verifyTypesOtpModal } from '../utils/verifyTypes.js';

export default function OtpModal({
    open,
    onClose,
    triggerRef,
    logo,
    brand,
    title = 'Verifica tu correo',
    email,
    description,
    code = '',
    onCodeChange,
    length = 6,
    submitLabel = 'Verificar',
    onSubmit,
    switchText = '¿No te llegó el código?',
    switchAction = 'Reenviar',
    onResend,
    error,
    loading = false,
}) {
    verifyTypesOtpModal({ code, onCodeChange, length, onSubmit, email, onResend });

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
            switchText={switchText}
            switchAction={switchAction}
            onSwitch={onResend}
            error={error}
            loading={loading}
        >
            <OtpFields
                code={code}
                onCodeChange={onCodeChange}
                length={length}
                email={email}
                description={description}
                disabled={loading}
                groupLabel={title}
            />
        </AuthShell>
    )
}
