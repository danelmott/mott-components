'use client';
import CustomModal from '../customModal/customModal.jsx';
import Button from '../buttons/button.jsx';
import Icon from '../icon/icon.jsx';
import GoogleIcon from '../icon/googleIcon.jsx';
import { verifyTypesAuthShell } from '../utils/verifyTypes.js';


function SwitchLink({ children, onClick, disabled }) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className="cursor-pointer border-0 bg-transparent p-0 underline-offset-4 hover:underline focus-visible:underline focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            style={{
                font: 'inherit',
                letterSpacing: 'var(--md-sys-typescale-body-medium-tracking)',
                fontWeight: 'var(--md-ref-typeface-weight-medium)',
                color: 'var(--md-sys-color-primary)',
            }}
        >
            {children}
        </button>
    );
}

export default function AuthShell({
    open,
    onClose,
    triggerRef,
    logo,
    brand,
    title,
    children,
    submitLabel,
    onSubmit,
    onGoogle,
    googleLabel = 'Continuar con Google',
    switchText,
    switchAction,
    onSwitch,
    error,
    loading = false,
}) {
    verifyTypesAuthShell({
        open, onClose, triggerRef, logo, brand, title, submitLabel,
        onSubmit, onGoogle, googleLabel, switchText, switchAction, onSwitch, error, loading,
    });

    const handleSubmit = (event) => {
        event.preventDefault();
        onSubmit?.();
    };

    return (
        <CustomModal
            open={open}
            onClose={onClose}
            triggerRef={triggerRef}
            // `--pad-card` sideways, `--gap-page` top and bottom: the reference gives the panel more
            // air above and below than beside. twMerge resolves the p-* that CustomModal sets
            // against the px-*/py-* here, so only these survive.
            className="w-[400px] px-[var(--pad-card)] py-[var(--gap-page)]"
        >
            {/*Absolute against the panel, which is the nearest positioned ancestor. `ghost` paints
               its label `primary`; a close affordance is not the action of the panel, so it is
               overridden down to the muted role.*/}
            <Button
                variant="ghost"
                iconOnly
                shape="pill"
                onClick={onClose}
                aria-label="Cerrar"
                className="absolute top-[12px] right-[12px]"
                style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
            >
                <Icon name="close" size="lg" />
            </Button>

            <div className="flex flex-col items-center text-center">
                {(logo || brand) && (
                    <div className="flex items-center gap-[var(--gap-group)]">
                        {logo}
                        {brand && (
                            <span
                                className="mott-label-large"
                                style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
                            >
                                {brand}
                            </span>
                        )}
                    </div>
                )}

                <h2
                    className="mott-headline-large"
                    style={{
                        color: 'var(--md-sys-color-on-surface)',
                        marginTop: logo || brand ? 'var(--gap-group)' : 0,
                    }}
                >
                    {title}
                </h2>

                {/*A real <form>, so Enter submits from any field and the browser does the work.
                   Everything inside it is one rhythm - `--gap-block` between field and field, field
                   and button, button and button - which is what the reference measures.*/}
                {/*`text-left` undoes the centring for the fields only. The brand, the title and the
                   switch line are centred, but a label reads as the heading of the box under it and
                   has to start where that box starts - centred over a full-width field it floats.
                   Button labels are unaffected: `mott-btn` centres them as a flex container.*/}
                <form
                    onSubmit={handleSubmit}
                    noValidate
                    className="mt-[var(--gap-page)] flex w-full flex-col gap-[var(--gap-block)] text-left"
                >
                    {children}

                    {error && (
                        <p className="mott-body-small" style={{ color: 'var(--md-sys-color-error)' }} role="alert">
                            {error}
                        </p>
                    )}

                    <Button type="submit" variant="action" fullWidth disabled={loading}>
                        {submitLabel}
                    </Button>

                    {/*Left out entirely when there is nothing to hand it: the OTP step has no
                       identity provider to fall back to, it is already past that point.*/}
                    {onGoogle && (
                        <Button variant="default" fullWidth onClick={onGoogle} disabled={loading}>
                            <GoogleIcon />
                            {googleLabel}
                        </Button>
                    )}
                </form>

                {switchText && (
                    <p
                        className="mott-body-medium mt-[var(--gap-block)]"
                        style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
                    >
                        {switchText}{' '}
                        <SwitchLink onClick={onSwitch} disabled={loading}>{switchAction}</SwitchLink>
                    </p>
                )}
            </div>
        </CustomModal>
    )
}
